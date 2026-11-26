export const VERSION = '0.1.0';

export type * from './ast/expr.js';
export type * from './ast/stmt.js';
export { check, type CheckOptions, type CheckResult } from './check.js';
export { TITLES, type DiagnosticCode } from './diagnostics/codes.js';
export type { Bilingual, Diagnostic } from './diagnostics/diagnostic.js';
export { InternalError } from './diagnostics/internal-error.js';
export {
  renderDiagnostic,
  renderRuntimeError,
  type Lang,
  type RenderOptions,
} from './diagnostics/render.js';
export type { Span } from './diagnostics/span.js';
export { tokenize, type TokenizeOptions, type TokenizeResult } from './lexer/lexer.js';
export type { Token, TokenKind } from './lexer/token.js';
export { hinglish, type LanguagePack } from './packs/hinglish.js';
export { parse, type ParseOptions, type ParseResult } from './parser/parser.js';
export { resolve, type ResolveOptions } from './resolver/resolver.js';
export { run, type RunOptions, type RunResult } from './run.js';
export { createSession, type EntryResult, type Session } from './session.js';
export { HinglishError, type Frame } from './runtime/hinglish-error.js';
export type { Host } from './runtime/host.js';
