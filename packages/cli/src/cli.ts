import {
  check,
  InternalError,
  renderDiagnostic,
  renderRuntimeError,
  run,
  VERSION,
  type Lang,
} from '@jugaad-hinglish/core';
import { hostFor, type Io } from './io.js';
import { repl } from './repl.js';

export const EXIT = { ok: 0, usage: 64, compile: 65, noInput: 66, runtime: 70 } as const;

const USAGE = `Usage:
  hinglish run <file.hing> [--lang=en|hi]
  hinglish check <file.hing> [--lang=en|hi]
  hinglish [repl] [--lang=en|hi]
  hinglish --help | --version
`;

/** Runs one command and returns the exit code. */
export function runCli(argv: readonly string[], io: Io): number {
  const words: string[] = [];
  let lang: Lang | undefined;
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      io.out(USAGE);
      return EXIT.ok;
    }
    if (arg === '--version' || arg === '-v') {
      io.out(`${VERSION}\n`);
      return EXIT.ok;
    }
    if (arg === '--lang=en') lang = 'en';
    else if (arg === '--lang=hi') lang = 'hi';
    else if (arg.startsWith('-')) return usage(io);
    else words.push(arg);
  }
  const options = lang ? { lang } : {};
  const [command = 'repl', file, ...rest] = words;
  if (rest.length > 0) return usage(io);
  if (command === 'repl' && file === undefined) return repl(io, options);
  if ((command !== 'run' && command !== 'check') || file === undefined) return usage(io);

  let source: string;
  try {
    // Some Windows editors start files with a byte order mark.
    source = io.readFile(file).replace(/^\uFEFF/, '');
  } catch (error) {
    io.err(`hinglish: cannot read ${file}: ${error instanceof Error ? error.message : error}\n`);
    return EXIT.noInput;
  }

  try {
    if (command === 'check') {
      const { diagnostics } = check(source, { file });
      for (const d of diagnostics) io.err(`${renderDiagnostic(d, source, options)}\n`);
      return diagnostics.some((d) => d.severity === 'error') ? EXIT.compile : EXIT.ok;
    }
    const result = run(source, hostFor(io), { file });
    if (result.status === 'runtime-error') {
      io.err(`${renderRuntimeError(result.error, source, options)}\n`);
      return EXIT.runtime;
    }
    for (const d of result.diagnostics) io.err(`${renderDiagnostic(d, source, options)}\n`);
    return result.status === 'ok' ? EXIT.ok : EXIT.compile;
  } catch (error) {
    if (!(error instanceof InternalError)) throw error;
    io.err(`hinglish: internal error: ${error.message}\n`);
    return EXIT.runtime;
  }
}

function usage(io: Io): number {
  io.err(USAGE);
  return EXIT.usage;
}
