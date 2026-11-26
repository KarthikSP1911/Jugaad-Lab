import type { Expr, FunctionExpr, Name } from '../ast/expr.js';
import type {
  Block,
  ExprStmt,
  For,
  FuncDecl,
  If,
  Program,
  Return,
  Stmt,
  VarDecl,
  While,
} from '../ast/stmt.js';
import {
  DEFAULT_FILE,
  DiagnosticBag,
  type Diagnostic,
  type DiagnosticDraft,
} from '../diagnostics/diagnostic.js';
import type { Span } from '../diagnostics/span.js';
import {
  constantWithoutValue,
  declarationNotAllowed,
  expectedExpression,
  expectedKey,
  expectedName,
  expectedSemicolon,
  expectedSymbol,
  invalidTarget,
  nestedTooDeeply,
} from '../diagnostics/syntax-messages.js';
import type { Token, TokenKind } from '../lexer/token.js';
import { ASSIGN, INFIX, UNARY } from './operators.js';
import { TokenStream } from './token-stream.js';

export const MAX_NESTING = 256;

export interface ParseOptions {
  file?: string;
}

export interface ParseResult {
  /** Partial when there are diagnostics. */
  ast: Program;
  diagnostics: Diagnostic[];
}

// Thrown to unwind to the nearest declaration, where parsing resumes.
const ABORT = Symbol('abort');
// Thrown to unwind the whole parse.
const HALT = Symbol('halt');

const STATEMENT_KEYWORDS: ReadonlySet<TokenKind> = new Set<TokenKind>([
  'Var',
  'Const',
  'Function',
  'If',
  'While',
  'For',
  'Return',
  'Break',
  'Continue',
]);

class Parser {
  private readonly stream: TokenStream;
  private readonly bag: DiagnosticBag;
  private blockDepth = 0;
  private nesting = 0;

  constructor(tokens: readonly Token[], file: string) {
    this.stream = new TokenStream(tokens);
    this.bag = new DiagnosticBag(file);
  }

  program(): ParseResult {
    const body: Stmt[] = [];
    try {
      while (!this.stream.check('EOF') && !this.bag.full) {
        const stmt = this.declaration();
        if (stmt !== undefined) body.push(stmt);
      }
    } catch (error) {
      if (error !== HALT) throw error;
    }
    const span = { start: 0, end: this.stream.peek().end, line: 1, column: 1 };
    return { ast: { kind: 'Program', body, span }, diagnostics: this.bag.items };
  }

  // --- statements ---

  private declaration(): Stmt | undefined {
    const start = this.stream.position;
    try {
      if (this.stream.check('Var') || this.stream.check('Const')) return this.varDecl();
      if (this.atFuncDecl()) return this.funcDecl();
      return this.statement();
    } catch (error) {
      if (error !== ABORT) throw error;
      this.synchronize(start);
      return undefined;
    }
  }

  private atFuncDecl(): boolean {
    return this.stream.check('Function') && this.stream.peek(1).kind === 'Identifier';
  }

  private varDecl(): VarDecl {
    const keyword = this.stream.advance();
    const isConst = keyword.kind === 'Const';
    const name = this.name();
    const init = this.stream.match('Assign') ? this.expression() : undefined;
    if (isConst && init === undefined && this.stream.check('Semicolon')) {
      this.bag.report(constantWithoutValue(keyword.lexeme, name.name), name.span);
    }
    this.semicolon();
    const span = this.stream.spanFrom(keyword);
    return { kind: 'VarDecl', name, isConst, ...(init && { init }), span };
  }

  private funcDecl(): FuncDecl {
    const keyword = this.stream.advance();
    const name = this.name();
    const params = this.params();
    const body = this.nested(() => this.block());
    return { kind: 'FuncDecl', name, params, body, span: this.stream.spanFrom(keyword) };
  }

  private statement(): Stmt {
    return this.nested(() => {
      const token = this.stream.peek();
      switch (token.kind) {
        case 'If':
          return this.ifStmt();
        case 'While':
          return this.whileStmt();
        case 'For':
          return this.forStmt();
        case 'Return':
          return this.returnStmt();
        case 'Break':
        case 'Continue':
          this.stream.advance();
          this.semicolon();
          return { kind: token.kind, span: this.stream.spanFrom(token) };
        case 'LeftBrace':
          return this.block();
        case 'Semicolon':
          this.stream.advance();
          return { kind: 'Block', body: [], span: this.stream.spanFrom(token) };
        // Report, then parse the declaration anyway to avoid follow-on errors.
        case 'Var':
        case 'Const':
          this.bag.report(declarationNotAllowed(token.lexeme), token);
          return this.varDecl();
        default:
          if (this.atFuncDecl()) {
            this.bag.report(declarationNotAllowed(token.lexeme), token);
            return this.funcDecl();
          }
          return this.exprStmt();
      }
    });
  }

  private ifStmt(): If {
    const keyword = this.stream.advance();
    const test = this.condition();
    const then = this.statement();
    const otherwise = this.stream.match('Else') ? this.statement() : undefined;
    const span = this.stream.spanFrom(keyword);
    return { kind: 'If', test, then, ...(otherwise && { otherwise }), span };
  }

  private whileStmt(): While {
    const keyword = this.stream.advance();
    const test = this.condition();
    const body = this.statement();
    return { kind: 'While', test, body, span: this.stream.spanFrom(keyword) };
  }

  private forStmt(): For {
    const keyword = this.stream.advance();
    this.consume('LeftParen', '(');
    let init: For['init'];
    if (this.stream.check('Var') || this.stream.check('Const')) init = this.varDecl();
    else if (!this.stream.match('Semicolon')) init = this.exprStmt();
    const test = this.stream.check('Semicolon') ? undefined : this.expression();
    this.semicolon();
    const step = this.stream.check('RightParen') ? undefined : this.expression();
    this.consume('RightParen', ')');
    const body = this.statement();
    return {
      kind: 'For',
      ...(init && { init }),
      ...(test && { test }),
      ...(step && { step }),
      body,
      span: this.stream.spanFrom(keyword),
    };
  }

  private returnStmt(): Return {
    const keyword = this.stream.advance();
    const value = this.stream.check('Semicolon') ? undefined : this.expression();
    this.semicolon();
    return { kind: 'Return', ...(value && { value }), span: this.stream.spanFrom(keyword) };
  }

  private block(): Block {
    const brace = this.consume('LeftBrace', '{');
    const body: Stmt[] = [];
    this.blockDepth += 1;
    try {
      while (!this.stream.check('RightBrace') && !this.stream.check('EOF') && !this.bag.full) {
        const stmt = this.declaration();
        if (stmt !== undefined) body.push(stmt);
      }
    } finally {
      this.blockDepth -= 1;
    }
    this.consume('RightBrace', '}');
    return { kind: 'Block', body, span: this.stream.spanFrom(brace) };
  }

  private exprStmt(): ExprStmt {
    const expr = this.expression();
    this.semicolon();
    return { kind: 'ExprStmt', expr, span: this.stream.spanFrom(expr.span) };
  }

  private condition(): Expr {
    this.consume('LeftParen', '(');
    const test = this.expression();
    this.consume('RightParen', ')');
    return test;
  }

  // --- expressions ---

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const first = this.stream.peek();
    const target = this.binary(1);
    const op = ASSIGN.get(this.stream.peek().kind);
    if (op === undefined) return target;
    this.stream.advance();
    const value = this.nested(() => this.assignment());
    if (target.kind !== 'Var' && target.kind !== 'Index') {
      this.bag.report(invalidTarget(), target.span);
      return target;
    }
    return { kind: 'Assign', target, op, value, span: this.stream.spanFrom(first) };
  }

  private binary(minPrecedence: number): Expr {
    const first = this.stream.peek();
    let left = this.unary();
    for (;;) {
      const infix = INFIX.get(this.stream.peek().kind);
      if (infix === undefined || infix.precedence < minPrecedence) return left;
      this.stream.advance();
      const right = this.binary(infix.precedence + 1);
      const span = this.stream.spanFrom(first);
      left =
        infix.kind === 'Binary'
          ? { kind: 'Binary', op: infix.op, left, right, span }
          : { kind: 'Logical', op: infix.op, left, right, span };
    }
  }

  // Every nested expression passes through here, so this bounds recursion.
  private unary(): Expr {
    return this.nested(() => {
      const token = this.stream.peek();
      const op = UNARY.get(token.kind);
      if (op === undefined) return this.postfix();
      this.stream.advance();
      const operand = this.unary();
      return { kind: 'Unary', op, operand, span: this.stream.spanFrom(token) };
    });
  }

  private postfix(): Expr {
    const first = this.stream.peek();
    let expr = this.primary();
    for (;;) {
      if (this.stream.match('LeftParen')) {
        const args = this.list('RightParen', ')', false, () => this.expression());
        expr = { kind: 'Call', callee: expr, args, span: this.stream.spanFrom(first) };
      } else if (this.stream.match('LeftBracket')) {
        const index = this.expression();
        this.consume('RightBracket', ']');
        expr = { kind: 'Index', object: expr, index, span: this.stream.spanFrom(first) };
      } else {
        return expr;
      }
    }
  }

  private primary(): Expr {
    const token = this.stream.peek();
    switch (token.kind) {
      case 'Number':
        return this.literal(Number.parseFloat(token.lexeme));
      case 'String':
        return this.literal(token.value ?? '');
      case 'True':
        return this.literal(true);
      case 'False':
        return this.literal(false);
      case 'Null':
        return this.literal(null);
      case 'Identifier':
        this.stream.advance();
        return { kind: 'Var', name: token.lexeme, span: this.stream.spanFrom(token) };
      case 'LeftParen': {
        this.stream.advance();
        const inner = this.expression();
        this.consume('RightParen', ')');
        return inner;
      }
      case 'LeftBracket': {
        this.stream.advance();
        const elements = this.list('RightBracket', ']', true, () => this.expression());
        return { kind: 'List', elements, span: this.stream.spanFrom(token) };
      }
      case 'LeftBrace': {
        this.stream.advance();
        const entries = this.list('RightBrace', '}', true, () => this.pair());
        return { kind: 'Dict', entries, span: this.stream.spanFrom(token) };
      }
      case 'Function':
        return this.functionExpr();
      default:
        return this.fail(expectedExpression(token.lexeme), token);
    }
  }

  private literal(value: number | string | boolean | null): Expr {
    const token = this.stream.advance();
    return { kind: 'Literal', value, span: this.stream.spanFrom(token) };
  }

  private pair(): { key: string; value: Expr } {
    const token = this.stream.peek();
    if (token.kind !== 'String' && token.kind !== 'Identifier') {
      return this.fail(expectedKey(token.lexeme), token);
    }
    this.stream.advance();
    this.consume('Colon', ':');
    return { key: token.value ?? token.lexeme, value: this.expression() };
  }

  private functionExpr(): FunctionExpr {
    const keyword = this.stream.advance();
    const params = this.params();
    const body = this.block();
    return { kind: 'Function', params, body, span: this.stream.spanFrom(keyword) };
  }

  // --- shared pieces ---

  private params(): Name[] {
    this.consume('LeftParen', '(');
    return this.list('RightParen', ')', false, () => this.name());
  }

  /** Comma-separated items up to and including `close`. */
  private list<T>(close: TokenKind, symbol: string, trailingComma: boolean, item: () => T): T[] {
    const items: T[] = [];
    if (this.stream.match(close)) return items;
    do {
      if (trailingComma && this.stream.check(close)) break;
      items.push(item());
    } while (this.stream.match('Comma'));
    this.consume(close, symbol);
    return items;
  }

  private name(): Name {
    const token = this.stream.peek();
    if (token.kind !== 'Identifier') return this.fail(expectedName(token.lexeme), token);
    this.stream.advance();
    return { name: token.lexeme, span: this.stream.spanFrom(token) };
  }

  private consume(kind: TokenKind, symbol: string): Token {
    const token = this.stream.peek();
    if (token.kind !== kind) return this.fail(expectedSymbol(symbol, token.lexeme), token);
    return this.stream.advance();
  }

  /** Reports just after the previous token, where the `;` belongs. */
  private semicolon(): void {
    if (this.stream.match('Semicolon')) return;
    const { end, line, column, lexeme } = this.stream.previous();
    const after = { start: end, end, line, column: column + [...lexeme].length };
    this.fail(expectedSemicolon(), after);
  }

  private fail(draft: DiagnosticDraft, span: Span): never {
    this.bag.report(draft, span);
    throw ABORT;
  }

  private nested<T>(parse: () => T): T {
    if (this.nesting >= MAX_NESTING) {
      this.bag.report(nestedTooDeeply(MAX_NESTING), this.stream.peek());
      throw HALT;
    }
    this.nesting += 1;
    try {
      return parse();
    } finally {
      this.nesting -= 1;
    }
  }

  /**
   * Skips to just after a `;`, or to a statement keyword or the enclosing `}`.
   * Braces opened while skipping are skipped whole.
   */
  private synchronize(start: number): void {
    let braces = 0;
    // The token that started the failed declaration must not stop us again.
    if (this.stream.position === start) {
      if (this.stream.advance().kind === 'LeftBrace') braces += 1;
    }
    while (!this.stream.check('EOF')) {
      const { kind } = this.stream.peek();
      if (braces === 0) {
        if (STATEMENT_KEYWORDS.has(kind)) return;
        if (kind === 'RightBrace' && this.blockDepth > 0) return;
      }
      this.stream.advance();
      if (kind === 'LeftBrace') {
        braces += 1;
      } else if (kind === 'RightBrace') {
        if (braces <= 1) return;
        braces -= 1;
      } else if (kind === 'Semicolon' && braces === 0) {
        return;
      }
    }
  }
}

/** Never throws on bad input. `tokens` must end with `EOF`. */
export function parse(tokens: readonly Token[], options: ParseOptions = {}): ParseResult {
  return new Parser(tokens, options.file ?? DEFAULT_FILE).program();
}
