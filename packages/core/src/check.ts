import type { Program } from './ast/stmt.js';
import { MAX_DIAGNOSTICS, type Diagnostic } from './diagnostics/diagnostic.js';
import { tokenize } from './lexer/lexer.js';
import { parse } from './parser/parser.js';

export interface CheckOptions {
  file?: string;
}

export interface CheckResult {
  /** `null` when the program has errors and must not run. */
  ast: Program | null;
  /** In source order. */
  diagnostics: Diagnostic[];
}

export function check(source: string, options: CheckOptions = {}): CheckResult {
  const lexed = tokenize(source, options);
  const parsed = parse(lexed.tokens, options);
  const diagnostics = [...lexed.diagnostics, ...parsed.diagnostics]
    .sort((a, b) => a.span.start - b.span.start)
    .slice(0, MAX_DIAGNOSTICS);
  const failed = diagnostics.some((diagnostic) => diagnostic.severity === 'error');
  return { ast: failed ? null : parsed.ast, diagnostics };
}
