import type {
  Assign,
  AssignOp,
  BinaryOp,
  Call,
  Expr,
  IndexExpr,
  Unary,
  VarExpr,
} from '../ast/expr.js';
import type { For, Program, Stmt, While } from '../ast/stmt.js';
import type { DiagnosticDraft, Fail } from '../diagnostics/diagnostic.js';
import { InternalError } from '../diagnostics/internal-error.js';
import {
  booleanExpected,
  callDepthExceeded,
  notCallable,
  stepLimitExceeded,
  usedBeforeValue,
  wrongArity,
  wrongOperandType,
} from '../diagnostics/runtime-messages.js';
import type { Span } from '../diagnostics/span.js';
import { createBuiltins } from '../runtime/builtins.js';
import { readIndex, writeIndex } from '../runtime/collections.js';
import { toText } from '../runtime/stringify.js';
import { Environment } from '../runtime/environment.js';
import { HinglishError, type Frame } from '../runtime/hinglish-error.js';
import type { Host } from '../runtime/host.js';
import { HinglishFunction, NativeFunction, typeName, type Value } from '../runtime/value.js';
import { NORMAL, type Completion } from './completion.js';
import { applyBinary } from './operators.js';

export const DEFAULT_MAX_DEPTH = 1000;

export interface InterpreterOptions {
  file: string;
  maxDepth?: number;
  /** Statements that may run; unlimited when omitted. */
  maxSteps?: number;
}

/** `+=` and friends are the binary operator without the trailing `=`. */
function binaryOperator(op: Exclude<AssignOp, '='>): BinaryOp {
  return op.slice(0, -1) as BinaryOp;
}

/** Holds all the state of one run or REPL session. Expects resolved programs. */
export class Interpreter {
  private readonly frames: Frame[] = [];
  private lastCall: Span | undefined;
  private steps = 0;

  private readonly globals: Environment;

  constructor(
    private readonly host: Host,
    private readonly options: InterpreterOptions,
  ) {
    const builtins = new Environment();
    for (const native of createBuiltins()) builtins.define(native.name, native);
    this.globals = new Environment(builtins);
  }

  /** Whether a top-level name has received a value. */
  hasGlobal(name: string): boolean {
    return this.globals.get(name, 0) !== undefined;
  }

  /** With `echo`, returns the text of a final expression's value unless it is null. */
  run(program: Program, echo = false): string | undefined {
    this.steps = 0;
    const last = program.body.at(-1);
    const shown =
      echo && last?.kind === 'ExprStmt' && last.expr.kind !== 'Assign' ? last : undefined;
    try {
      this.hoist(program.body, this.globals);
      for (const stmt of program.body) {
        if (stmt !== shown) {
          this.execute(stmt, this.globals);
          continue;
        }
        const value = this.evaluate(shown.expr, this.globals);
        return value === null ? undefined : toText(value, this.failAt(shown.span));
      }
      return undefined;
    } catch (error) {
      // The host stack can run out before the call-depth limit is reached.
      if (error instanceof Error && /call stack|too much recursion/i.test(error.message)) {
        this.fail(callDepthExceeded(), this.lastCall ?? program.span);
      }
      throw error;
    }
  }

  /** Functions are usable throughout their block. */
  private hoist(body: readonly Stmt[], env: Environment): void {
    for (const stmt of body) {
      if (stmt.kind !== 'FuncDecl') continue;
      const { name } = stmt.name;
      env.define(name, new HinglishFunction(name, stmt.params, stmt.body, env));
    }
  }

  private executeAll(body: readonly Stmt[], env: Environment): Completion {
    this.hoist(body, env);
    for (const stmt of body) {
      const completion = this.execute(stmt, env);
      if (completion.type !== 'normal') return completion;
    }
    return NORMAL;
  }

  private execute(stmt: Stmt, env: Environment): Completion {
    const { maxSteps } = this.options;
    if (maxSteps !== undefined && ++this.steps > maxSteps) {
      this.fail(stepLimitExceeded(maxSteps), stmt.span);
    }
    switch (stmt.kind) {
      case 'VarDecl':
        env.define(stmt.name.name, stmt.init ? this.evaluate(stmt.init, env) : null);
        return NORMAL;
      case 'FuncDecl':
        // Defined when its block was entered.
        return NORMAL;
      case 'Block':
        return this.executeAll(stmt.body, new Environment(env));
      case 'If':
        if (this.condition(stmt.test, env)) return this.execute(stmt.then, env);
        return stmt.otherwise ? this.execute(stmt.otherwise, env) : NORMAL;
      case 'While':
        return this.loop(stmt, env);
      case 'For': {
        const scope = new Environment(env);
        if (stmt.init) this.execute(stmt.init, scope);
        return this.loop(stmt, scope);
      }
      case 'Return':
        return { type: 'return', value: stmt.value ? this.evaluate(stmt.value, env) : null };
      case 'Break':
        return { type: 'break' };
      case 'Continue':
        return { type: 'continue' };
      case 'ExprStmt':
        this.evaluate(stmt.expr, env);
        return NORMAL;
      default: {
        const missing: never = stmt;
        return missing;
      }
    }
  }

  private loop(stmt: While | For, env: Environment): Completion {
    const step = stmt.kind === 'For' ? stmt.step : undefined;
    while (stmt.test === undefined || this.condition(stmt.test, env)) {
      const completion = this.execute(stmt.body, env);
      if (completion.type === 'break') break;
      if (completion.type === 'return') return completion;
      if (step) this.evaluate(step, env);
    }
    return NORMAL;
  }

  private evaluate(expr: Expr, env: Environment): Value {
    switch (expr.kind) {
      case 'Literal':
        return expr.value;
      case 'Var':
        return this.read(expr, env);
      case 'Unary':
        return this.unary(expr, env);
      case 'Binary':
        return this.binary(
          expr.op,
          this.evaluate(expr.left, env),
          this.evaluate(expr.right, env),
          expr.span,
        );
      case 'Logical': {
        const left = this.condition(expr.left, env);
        if (left === (expr.op === '||')) return left;
        return this.condition(expr.right, env);
      }
      case 'Assign':
        return this.assign(expr, env);
      case 'Call':
        return this.call(expr, env);
      case 'Function':
        return new HinglishFunction(undefined, expr.params, expr.body, env);
      case 'List':
        return expr.elements.map((element) => this.evaluate(element, env));
      case 'Dict':
        return new Map(expr.entries.map(({ key, value }) => [key, this.evaluate(value, env)]));
      case 'Index': {
        const object = this.evaluate(expr.object, env);
        const index = this.evaluate(expr.index, env);
        return readIndex(object, index, this.failAt(expr.span));
      }
      default: {
        const missing: never = expr;
        return missing;
      }
    }
  }

  private condition(expr: Expr, env: Environment): boolean {
    const value = this.evaluate(expr, env);
    if (typeof value !== 'boolean') this.fail(booleanExpected(typeName(value)), expr.span);
    return value;
  }

  private unary(expr: Unary, env: Environment): Value {
    if (expr.op === '!') return !this.condition(expr.operand, env);
    const value = this.evaluate(expr.operand, env);
    if (typeof value !== 'number') {
      this.fail(wrongOperandType(expr.op, typeName(value)), expr.span);
    }
    return -value;
  }

  private binary(op: BinaryOp, left: Value, right: Value, span: Span): Value {
    return applyBinary(op, left, right, this.failAt(span));
  }

  private read(expr: VarExpr, env: Environment): Value {
    const value = env.get(expr.name, this.depthOf(expr));
    if (value === undefined) this.fail(usedBeforeValue(expr.name), expr.span);
    return value;
  }

  private assign(expr: Assign, env: Environment): Value {
    const { target } = expr;
    if (target.kind === 'Index') return this.assignIndex(target, expr, env);
    const result = this.assigned(expr, () => this.read(target, env), env);
    if (!env.assign(target.name, this.depthOf(target), result)) {
      this.fail(usedBeforeValue(target.name), target.span);
    }
    return result;
  }

  /** The object and the index are evaluated once, even for `+=` and friends. */
  private assignIndex(target: IndexExpr, expr: Assign, env: Environment): Value {
    const object = this.evaluate(target.object, env);
    const index = this.evaluate(target.index, env);
    const fail = this.failAt(target.span);
    const result = this.assigned(expr, () => readIndex(object, index, fail), env);
    writeIndex(object, index, result, fail);
    return result;
  }

  /** The value to store; `current` is read only by compound operators. */
  private assigned({ op, value, span }: Assign, current: () => Value, env: Environment): Value {
    if (op === '=') return this.evaluate(value, env);
    const left = current();
    return this.binary(binaryOperator(op), left, this.evaluate(value, env), span);
  }

  private call({ callee, args, span }: Call, env: Environment): Value {
    const target = this.evaluate(callee, env);
    const values = args.map((arg) => this.evaluate(arg, env));
    if (target instanceof NativeFunction) {
      if (target.arity !== null && target.arity !== values.length) {
        this.fail(wrongArity(target.name, target.arity, values.length), span);
      }
      return target.call(values, this.host, this.failAt(span));
    }
    if (!(target instanceof HinglishFunction)) this.fail(notCallable(typeName(target)), span);
    const { name, params, body, closure } = target;
    if (params.length !== values.length) {
      this.fail(wrongArity(name ?? typeName(target), params.length, values.length), span);
    }
    if (this.frames.length >= (this.options.maxDepth ?? DEFAULT_MAX_DEPTH)) {
      this.fail(callDepthExceeded(), span);
    }
    const scope = new Environment(closure);
    values.forEach((value, i) => scope.define(params[i]?.name ?? '', value));
    this.frames.push({ functionName: name, span });
    this.lastCall = span;
    try {
      const completion = this.executeAll(body.body, scope);
      return completion.type === 'return' ? completion.value : null;
    } finally {
      this.frames.pop();
    }
  }

  private depthOf(expr: VarExpr): number {
    if (expr.depth === undefined) throw new InternalError(`'${expr.name}' was not resolved`);
    return expr.depth;
  }

  private failAt(span: Span): Fail {
    return (draft) => this.fail(draft, span);
  }

  private fail(draft: DiagnosticDraft, span: Span): never {
    const diagnostic = { ...draft, severity: 'error' as const, span, file: this.options.file };
    throw new HinglishError(diagnostic, [...this.frames].reverse());
  }
}
