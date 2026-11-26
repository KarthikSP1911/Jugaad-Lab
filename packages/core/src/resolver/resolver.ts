import type { Call, Expr, Name, VarExpr } from '../ast/expr.js';
import type { Block, Program, Stmt } from '../ast/stmt.js';
import {
  DEFAULT_FILE,
  DiagnosticBag,
  type Diagnostic,
  type DiagnosticDraft,
} from '../diagnostics/diagnostic.js';
import {
  assignToConstant,
  duplicateName,
  outsideFunction,
  outsideLoop,
  undefinedName,
  usedInOwnInitialiser,
  wrongArgumentCount,
} from '../diagnostics/semantic-messages.js';
import type { Span } from '../diagnostics/span.js';
import { nestedTooDeeply } from '../diagnostics/syntax-messages.js';
import { WORDS } from '../packs/hinglish.js';
import { createBuiltins } from '../runtime/builtins.js';
import type { Binding, Scope } from './scope.js';
import { suggest } from './suggest.js';

/** Long operator chains build deep trees that recursion cannot walk safely. */
export const MAX_TREE_DEPTH = 1000;

export interface ResolveOptions {
  file?: string;
}

interface DirectCall {
  binding: Binding;
  name: string;
  argCount: number;
  span: Span;
}

class Resolver {
  private readonly bag: DiagnosticBag;
  private readonly scopes: Scope[];
  private readonly directCalls: DirectCall[] = [];
  private functionDepth = 0;
  private loopDepth = 0;
  private treeDepth = 0;
  private tooDeep = false;

  constructor(file: string) {
    this.bag = new DiagnosticBag(file);
    const builtins: Scope = new Map();
    for (const { name } of createBuiltins()) {
      builtins.set(name, { isConst: true, ready: true, functionDepth: 0, reassigned: false });
    }
    this.scopes = [builtins];
  }

  program(program: Program): Diagnostic[] {
    this.scoped(() => this.statements(program.body));
    // Only now is it known which function names are ever reassigned.
    for (const { binding, name, argCount, span } of this.directCalls) {
      if (binding.arity !== undefined && !binding.reassigned && binding.arity !== argCount) {
        this.report(wrongArgumentCount(name, binding.arity, argCount), span);
      }
    }
    return this.bag.items;
  }

  private statements(body: readonly Stmt[]): void {
    // Functions are visible throughout their block.
    for (const stmt of body) {
      if (stmt.kind === 'FuncDecl') {
        const binding = this.declare(stmt.name, false);
        if (binding) binding.arity = stmt.params.length;
      }
    }
    for (const stmt of body) this.statement(stmt);
  }

  private statement(stmt: Stmt): void {
    switch (stmt.kind) {
      case 'VarDecl': {
        const binding = this.declare(stmt.name, stmt.isConst, false);
        if (stmt.init) this.expression(stmt.init);
        if (binding) binding.ready = true;
        return;
      }
      case 'FuncDecl':
        return this.func(stmt.params, stmt.body);
      case 'Block':
        return this.scoped(() => this.statements(stmt.body));
      case 'If':
        this.expression(stmt.test);
        this.statement(stmt.then);
        if (stmt.otherwise) this.statement(stmt.otherwise);
        return;
      case 'While':
        this.expression(stmt.test);
        return this.loopBody(stmt.body);
      case 'For':
        return this.scoped(() => {
          if (stmt.init) this.statement(stmt.init);
          if (stmt.test) this.expression(stmt.test);
          if (stmt.step) this.expression(stmt.step);
          this.loopBody(stmt.body);
        });
      case 'Return':
        if (this.functionDepth === 0) this.report(outsideFunction(WORDS.return), stmt.span);
        if (stmt.value) this.expression(stmt.value);
        return;
      case 'Break':
      case 'Continue':
        if (this.loopDepth === 0) {
          this.report(outsideLoop(stmt.kind === 'Break' ? WORDS.break : WORDS.continue), stmt.span);
        }
        return;
      case 'ExprStmt':
        return this.expression(stmt.expr);
      default: {
        const missing: never = stmt;
        return missing;
      }
    }
  }

  private expression(expr: Expr): void {
    if (this.treeDepth >= MAX_TREE_DEPTH) {
      if (!this.tooDeep) this.report(nestedTooDeeply(MAX_TREE_DEPTH), expr.span);
      this.tooDeep = true;
      return;
    }
    this.treeDepth += 1;
    this.walk(expr);
    this.treeDepth -= 1;
  }

  private walk(expr: Expr): void {
    switch (expr.kind) {
      case 'Literal':
        return;
      case 'Var':
        this.use(expr);
        return;
      case 'List':
        for (const element of expr.elements) this.expression(element);
        return;
      case 'Dict':
        for (const entry of expr.entries) this.expression(entry.value);
        return;
      case 'Unary':
        return this.expression(expr.operand);
      case 'Binary':
      case 'Logical':
        this.expression(expr.left);
        return this.expression(expr.right);
      case 'Assign': {
        this.expression(expr.value);
        if (expr.target.kind === 'Index') return this.expression(expr.target);
        const binding = this.use(expr.target);
        if (binding?.isConst) this.report(assignToConstant(expr.target.name), expr.target.span);
        if (binding) binding.reassigned = true;
        return;
      }
      case 'Call':
        return this.call(expr);
      case 'Index':
        this.expression(expr.object);
        return this.expression(expr.index);
      case 'Function':
        return this.func(expr.params, expr.body);
      default: {
        const missing: never = expr;
        return missing;
      }
    }
  }

  private call({ callee, args, span }: Call): void {
    if (callee.kind === 'Var') {
      const binding = this.use(callee);
      if (binding) {
        this.directCalls.push({ binding, name: callee.name, argCount: args.length, span });
      }
    } else {
      this.expression(callee);
    }
    for (const arg of args) this.expression(arg);
  }

  /** Parameters and body share one scope. */
  private func(params: readonly Name[], body: Block): void {
    const enclosingLoops = this.loopDepth;
    this.loopDepth = 0;
    this.functionDepth += 1;
    this.scoped(() => {
      for (const param of params) this.declare(param, false);
      this.statements(body.body);
    });
    this.functionDepth -= 1;
    this.loopDepth = enclosingLoops;
  }

  private loopBody(body: Stmt): void {
    this.loopDepth += 1;
    this.statement(body);
    this.loopDepth -= 1;
  }

  private scoped(walk: () => void): void {
    this.scopes.push(new Map());
    walk();
    this.scopes.pop();
  }

  /** `undefined` when the name is already taken in this scope. */
  private declare({ name, span }: Name, isConst: boolean, ready = true): Binding | undefined {
    const scope = this.scopes[this.scopes.length - 1];
    const existing = scope?.get(name);
    if (existing) {
      this.report(duplicateName(name), span);
      return undefined;
    }
    const binding = { isConst, ready, functionDepth: this.functionDepth, reassigned: false };
    scope?.set(name, binding);
    return binding;
  }

  /** Finds the declaration and records its distance on the node. */
  private use(expr: VarExpr): Binding | undefined {
    for (let depth = 0; depth < this.scopes.length; depth += 1) {
      const binding = this.scopes[this.scopes.length - 1 - depth]?.get(expr.name);
      if (!binding) continue;
      // A function body runs later, so it may refer to the name being declared.
      if (!binding.ready && binding.functionDepth === this.functionDepth) {
        this.report(usedInOwnInitialiser(expr.name), expr.span);
      }
      expr.depth = depth;
      return binding;
    }
    const known = this.scopes.flatMap((scope) => [...scope.keys()]);
    this.report(undefinedName(expr.name, suggest(expr.name, known)), expr.span);
    return undefined;
  }

  private report(draft: DiagnosticDraft, span: Span): void {
    this.bag.report(draft, span);
  }
}

/** Annotates every variable use with its scope depth and returns semantic errors. */
export function resolve(program: Program, options: ResolveOptions = {}): Diagnostic[] {
  return new Resolver(options.file ?? DEFAULT_FILE).program(program);
}
