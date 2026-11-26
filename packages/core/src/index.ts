export const VERSION = '0.0.0';

export type * from './ast/expr.js';
export type * from './ast/stmt.js';
export { check, type CheckOptions, type CheckResult } from './check.js';
export type { DiagnosticCode } from './diagnostics/codes.js';
export type { Bilingual, Diagnostic } from './diagnostics/diagnostic.js';
export { InternalError } from './diagnostics/internal-error.js';
export { renderDiagnostic, type Lang, type RenderOptions } from './diagnostics/render.js';
export type { Span } from './diagnostics/span.js';
export { tokenize, type TokenizeOptions, type TokenizeResult } from './lexer/lexer.js';
export type { Token, TokenKind } from './lexer/token.js';
export { hinglish, type LanguagePack } from './packs/hinglish.js';
export { parse, type ParseOptions, type ParseResult } from './parser/parser.js';
