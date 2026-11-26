import type { Span } from '../diagnostics/span.js';
import type { Block } from './stmt.js';

export interface Name {
  name: string;
  span: Span;
}

export type BinaryOp = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=';
export type LogicalOp = '&&' | '||';
export type UnaryOp = '!' | '-';
export type AssignOp = '=' | '+=' | '-=' | '*=' | '/=' | '%=';

export interface Literal {
  kind: 'Literal';
  value: number | string | boolean | null;
  span: Span;
}

export interface ListExpr {
  kind: 'List';
  elements: Expr[];
  span: Span;
}

export interface DictExpr {
  kind: 'Dict';
  entries: { key: string; value: Expr }[];
  span: Span;
}

export interface VarExpr {
  /** Scopes between this use and the declaration; set by the resolver. */
  depth?: number;
  kind: 'Var';
  name: string;
  span: Span;
}

export interface Unary {
  kind: 'Unary';
  op: UnaryOp;
  operand: Expr;
  span: Span;
}

export interface Binary {
  kind: 'Binary';
  op: BinaryOp;
  left: Expr;
  right: Expr;
  span: Span;
}

export interface Logical {
  kind: 'Logical';
  op: LogicalOp;
  left: Expr;
  right: Expr;
  span: Span;
}

export interface Assign {
  kind: 'Assign';
  target: VarExpr | IndexExpr;
  op: AssignOp;
  value: Expr;
  span: Span;
}

export interface Call {
  kind: 'Call';
  callee: Expr;
  args: Expr[];
  span: Span;
}

export interface IndexExpr {
  kind: 'Index';
  object: Expr;
  index: Expr;
  span: Span;
}

export interface FunctionExpr {
  kind: 'Function';
  params: Name[];
  body: Block;
  span: Span;
}

export type Expr =
  | Literal
  | ListExpr
  | DictExpr
  | VarExpr
  | Unary
  | Binary
  | Logical
  | Assign
  | Call
  | IndexExpr
  | FunctionExpr;
