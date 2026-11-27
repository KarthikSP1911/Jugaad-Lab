import type { Span } from '../diagnostics/span.js';
import type { Expr, Name } from './expr.js';

export interface VarDecl {
  kind: 'VarDecl';
  name: Name;
  isConst: boolean;
  /** Absent only on a variable, which then starts as null. */
  init?: Expr;
  span: Span;
}

export interface FuncDecl {
  kind: 'FuncDecl';
  name: Name;
  params: Name[];
  body: Block;
  span: Span;
}

/** A lone `;` is an empty block. */
export interface Block {
  kind: 'Block';
  body: Stmt[];
  span: Span;
}

export interface If {
  kind: 'If';
  test: Expr;
  then: Stmt;
  otherwise?: Stmt;
  span: Span;
}

export interface While {
  kind: 'While';
  test: Expr;
  body: Stmt;
  span: Span;
}

export interface For {
  kind: 'For';
  init?: VarDecl | ExprStmt;
  test?: Expr;
  step?: Expr;
  body: Stmt;
  span: Span;
}

export interface Return {
  kind: 'Return';
  value?: Expr;
  span: Span;
}

export interface Break {
  kind: 'Break';
  span: Span;
}

export interface Continue {
  kind: 'Continue';
  span: Span;
}

export interface ExprStmt {
  kind: 'ExprStmt';
  expr: Expr;
  span: Span;
}

export type Stmt =
  VarDecl | FuncDecl | Block | If | While | For | Return | Break | Continue | ExprStmt;

export interface Program {
  kind: 'Program';
  body: Stmt[];
  span: Span;
}
