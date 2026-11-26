import type { Program } from './ast/stmt.js';
import { MAX_DIAGNOSTICS, type Diagnostic } from './diagnostics/diagnostic.js';
import { tokenize } from './lexer/lexer.js';
import { parse } from './parser/parser.js';
import { resolve } from './resolver/resolver.js';

export interface CheckOptions {
  file?: string;
}

export interface CheckResult {
  /** Resolved and ready to run; `null` when there are errors. */
  ast: Program | null;
  /** In source order. */
  diagnostics: Diagnostic[];
}

const hasError = (diagnostics: Diagnostic[]) => diagnostics.some((d) => d.severity === 'error');

export function check(source: string, options: CheckOptions = {}): CheckResult {
  const lexed = tokenize(source, options);
  const parsed = parse(lexed.tokens, options);
  let diagnostics = [...lexed.diagnostics, ...parsed.diagnostics];
  // A partial tree would only produce follow-on semantic errors.
  if (!hasError(diagnostics)) diagnostics = resolve(parsed.ast, options);
  diagnostics = diagnostics.sort((a, b) => a.span.start - b.span.start).slice(0, MAX_DIAGNOSTICS);
  return { ast: hasError(diagnostics) ? null : parsed.ast, diagnostics };
}
