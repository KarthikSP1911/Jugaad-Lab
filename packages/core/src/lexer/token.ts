import type { Span } from '../diagnostics/span.js';

export type KeywordKind =
  | 'Var'
  | 'Const'
  | 'Function'
  | 'Return'
  | 'If'
  | 'Else'
  | 'True'
  | 'False'
  | 'Null'
  | 'While'
  | 'For'
  | 'Break'
  | 'Continue'
  // Word aliases share a kind with their symbol.
  | 'AndAnd'
  | 'OrOr'
  | 'Bang';

export type SymbolKind =
  | 'LeftParen'
  | 'RightParen'
  | 'LeftBrace'
  | 'RightBrace'
  | 'LeftBracket'
  | 'RightBracket'
  | 'Comma'
  | 'Semicolon'
  | 'Colon'
  | 'Plus'
  | 'Minus'
  | 'Star'
  | 'Slash'
  | 'Percent'
  | 'Assign'
  | 'PlusAssign'
  | 'MinusAssign'
  | 'StarAssign'
  | 'SlashAssign'
  | 'PercentAssign'
  | 'EqualEqual'
  | 'BangEqual'
  | 'Less'
  | 'LessEqual'
  | 'Greater'
  | 'GreaterEqual'
  | 'AndAnd'
  | 'OrOr'
  | 'Bang';

export type TokenKind = KeywordKind | SymbolKind | 'Identifier' | 'Number' | 'String' | 'EOF';

export interface Token extends Span {
  kind: TokenKind;
  lexeme: string;
  /** Decoded contents, on `String` tokens only. */
  value?: string;
}
