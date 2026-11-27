import { check } from './check.js';
import { DEFAULT_FILE, type Diagnostic } from './diagnostics/diagnostic.js';
import { Interpreter } from './interpreter/interpreter.js';
import { HinglishError } from './runtime/hinglish-error.js';
import type { Host } from './runtime/host.js';

export interface RunOptions {
  file?: string;
  maxDepth?: number;
  maxSteps?: number | undefined;
}

export type RunResult =
  | { status: 'ok' | 'compile-error'; diagnostics: Diagnostic[] }
  | { status: 'runtime-error'; diagnostics: Diagnostic[]; error: HinglishError };

/** Checks and runs a program. Throws only for implementation or host failures. */
export function run(source: string, host: Host, options: RunOptions = {}): RunResult {
  const { file = DEFAULT_FILE, ...limits } = options;
  const { ast, diagnostics } = check(source, { file });
  if (!ast) return { status: 'compile-error', diagnostics };
  try {
    new Interpreter(host, { file, ...limits }).run(ast);
  } catch (error) {
    if (!(error instanceof HinglishError)) throw error;
    return { status: 'runtime-error', diagnostics: [...diagnostics, error.diagnostic], error };
  }
  return { status: 'ok', diagnostics };
}
