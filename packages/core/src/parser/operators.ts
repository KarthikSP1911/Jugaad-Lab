import type { AssignOp, BinaryOp, LogicalOp, UnaryOp } from '../ast/expr.js';
import type { TokenKind } from '../lexer/token.js';

export type Infix =
  | { kind: 'Binary'; op: BinaryOp; precedence: number }
  | { kind: 'Logical'; op: LogicalOp; precedence: number };

const binary = (op: BinaryOp, precedence: number): Infix => ({ kind: 'Binary', op, precedence });
const logical = (op: LogicalOp, precedence: number): Infix => ({ kind: 'Logical', op, precedence });

/** Left-associative operators; a higher precedence binds tighter. */
export const INFIX: ReadonlyMap<TokenKind, Infix> = new Map<TokenKind, Infix>([
  ['OrOr', logical('||', 1)],
  ['AndAnd', logical('&&', 2)],
  ['EqualEqual', binary('==', 3)],
  ['BangEqual', binary('!=', 3)],
  ['Less', binary('<', 4)],
  ['LessEqual', binary('<=', 4)],
  ['Greater', binary('>', 4)],
  ['GreaterEqual', binary('>=', 4)],
  ['Plus', binary('+', 5)],
  ['Minus', binary('-', 5)],
  ['Star', binary('*', 6)],
  ['Slash', binary('/', 6)],
  ['Percent', binary('%', 6)],
]);

export const ASSIGN: ReadonlyMap<TokenKind, AssignOp> = new Map<TokenKind, AssignOp>([
  ['Assign', '='],
  ['PlusAssign', '+='],
  ['MinusAssign', '-='],
  ['StarAssign', '*='],
  ['SlashAssign', '/='],
  ['PercentAssign', '%='],
]);

export const UNARY: ReadonlyMap<TokenKind, UnaryOp> = new Map<TokenKind, UnaryOp>([
  ['Bang', '!'],
  ['Minus', '-'],
]);
