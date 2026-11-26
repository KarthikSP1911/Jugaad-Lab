import { DEFAULT_FILE, type Diagnostic } from './diagnostics/diagnostic.js';
import { Interpreter } from './interpreter/interpreter.js';
import { tokenize } from './lexer/lexer.js';
import { parse } from './parser/parser.js';
import { Resolver } from './resolver/resolver.js';
import type { RunOptions } from './run.js';
import { HinglishError } from './runtime/hinglish-error.js';
import type { Host } from './runtime/host.js';

export type EntryResult = {
  /** Everything entered so far; diagnostic spans point into it. */
  source: string;
  diagnostics: Diagnostic[];
} & (
  | { status: 'ok'; /** Text of a final expression's value. */ echo?: string }
  | { status: 'compile-error' }
  | { status: 'runtime-error'; error: HinglishError }
);

export interface Session {
  evaluate(entry: string): EntryResult;
}

/** A program entered piece by piece, as in a REPL. */
export function createSession(host: Host, options: RunOptions = {}): Session {
  const { file = DEFAULT_FILE, ...limits } = options;
  const resolver = new Resolver(file);
  const interpreter = new Interpreter(host, { file, ...limits });
  let source = '';

  return {
    evaluate(entry) {
      // Earlier entries are blanked out, which keeps lines and offsets unique.
      const padded = source.replace(/[^\n]/g, ' ') + entry;
      source += `${entry}\n`;
      const tokens = tokenize(padded, { file });
      const parsed = parse(tokens.tokens, { file });
      let diagnostics = [...tokens.diagnostics, ...parsed.diagnostics];
      if (diagnostics.length === 0) diagnostics = resolver.entry(parsed.ast);
      if (diagnostics.length > 0) return { status: 'compile-error', source, diagnostics };
      try {
        const echo = interpreter.run(parsed.ast, true);
        if (echo === undefined) return { status: 'ok', source, diagnostics };
        return { status: 'ok', source, diagnostics, echo };
      } catch (error) {
        if (!(error instanceof HinglishError)) throw error;
        resolver.forget((name) => interpreter.hasGlobal(name));
        return { status: 'runtime-error', source, diagnostics: [error.diagnostic], error };
      }
    },
  };
}
