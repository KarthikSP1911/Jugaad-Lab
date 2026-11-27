import {
  check,
  InternalError,
  renderRuntimeError,
  run,
  VERSION,
  type Lang,
} from '@jugaad-hinglish/core';
import { hostFor, type Io } from './io.js';
import * as messages from './messages.js';
import { printDiagnostics, printError } from './report.js';
import { repl } from './repl.js';

export const EXIT = { ok: 0, usage: 64, compile: 65, noInput: 66, runtime: 70 } as const;

/** Runs one command and returns the exit code. */
export function runCli(argv: readonly string[], io: Io): number {
  const words: string[] = [];
  let lang: Lang | undefined;
  let help = false;
  let problem: ReturnType<typeof messages.unknownOption> | undefined;
  const rest = [...argv];
  for (let arg = rest.shift(); arg !== undefined; arg = rest.shift()) {
    if (arg === '--help' || arg === '-h') help = true;
    else if (arg === '--version' || arg === '-v') {
      io.out(`${VERSION}\n`);
      return EXIT.ok;
    } else if (arg === '--lang' || arg.startsWith('--lang=')) {
      const value = arg === '--lang' ? (rest.shift() ?? '') : arg.slice('--lang='.length);
      if (value === 'en' || value === 'hi') lang = value;
      else problem ??= messages.badLanguage(value);
    } else if (arg.startsWith('-')) problem ??= messages.unknownOption(arg);
    else words.push(arg);
  }
  if (help) {
    io.out(messages.block(messages.USAGE, lang));
    return EXIT.ok;
  }
  if (problem) return usage(io, problem, lang);

  // `hinglish file.hing` is short for `hinglish run file.hing`.
  if (words[0]?.endsWith('.hing')) words.unshift('run');
  const options = lang ? { lang } : {};
  const [command = 'repl', file, extra] = words;
  if (command === 'repl') {
    return file === undefined ? repl(io, options) : usage(io, messages.extraArgument(file), lang);
  }
  if (command !== 'run' && command !== 'check') {
    return usage(io, messages.unknownCommand(command), lang);
  }
  if (file === undefined) return usage(io, messages.missingFile(command), lang);
  if (extra !== undefined) return usage(io, messages.extraArgument(extra), lang);

  let source: string;
  try {
    // Some Windows editors start files with a byte order mark.
    source = io.readFile(file).replace(/^\uFEFF/, '');
  } catch (error) {
    const reason =
      (error as { code?: unknown }).code === 'ENOENT'
        ? messages.fileNotFound(file)
        : messages.cannotRead(file, error instanceof Error ? error.message : String(error));
    io.err(`hinglish: ${messages.line(reason, lang)}\n`);
    return EXIT.noInput;
  }

  try {
    if (command === 'check') {
      const { diagnostics } = check(source, { file });
      printDiagnostics(io, diagnostics, source, options);
      if (diagnostics.some((d) => d.severity === 'error')) return EXIT.compile;
      // Silent in scripts, as is usual; a person at a terminal gets an answer.
      if (io.interactive) io.out(`${messages.line(messages.noErrors(file), lang)}\n`);
      return EXIT.ok;
    }
    const result = run(source, hostFor(io), { file });
    if (result.status === 'runtime-error') {
      printError(io, renderRuntimeError(result.error, source, options));
      return EXIT.runtime;
    }
    printDiagnostics(io, result.diagnostics, source, options);
    return result.status === 'ok' ? EXIT.ok : EXIT.compile;
  } catch (error) {
    if (!(error instanceof InternalError)) throw error;
    io.err(`hinglish: ${messages.line(messages.internalError(error.message), lang)}\n`);
    return EXIT.runtime;
  }
}

function usage(io: Io, problem: ReturnType<typeof messages.unknownOption>, lang?: Lang): number {
  io.err(`hinglish: ${messages.line(problem, lang)}\n${messages.line(messages.SEE_HELP, lang)}\n`);
  return EXIT.usage;
}
