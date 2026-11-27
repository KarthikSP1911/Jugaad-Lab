import {
  createSession,
  renderRuntimeError,
  tokenize,
  VERSION,
  type EntryResult,
  type RenderOptions,
  type Session,
  type TokenKind,
} from '@jugaad-hinglish/core';
import { hostFor, type Io } from './io.js';
import { banner, block, line, REPL_HELP, unknownReplCommand } from './messages.js';
import { printDiagnostics, printError } from './report.js';

const OPENERS: ReadonlySet<TokenKind> = new Set(['LeftParen', 'LeftBrace', 'LeftBracket']);
const CLOSERS: ReadonlySet<TokenKind> = new Set(['RightParen', 'RightBrace', 'RightBracket']);
const COMMAND = /^\.[a-z]+$/;

export function repl(io: Io, options: RenderOptions): number {
  io.out(`${block(banner(VERSION), options.lang)}\n`);
  const session = createSession(hostFor(io), { file: '<repl>' });
  for (;;) {
    const entry = readEntry(io, options);
    if (entry === null) return 0;
    if (entry.trim() === '') continue;
    const result = evaluate(session, entry);
    if (result.status === 'runtime-error') {
      printError(io, renderRuntimeError(result.error, result.source, options));
    } else if (result.status === 'compile-error') {
      printDiagnostics(io, result.diagnostics, result.source, options);
    } else if (result.echo !== undefined) {
      io.out(`${result.echo}\n`);
    }
  }
}

/** Forgives a missing final `;`, the commonest slip when typing one line. */
function evaluate(session: Session, entry: string): EntryResult {
  const result = session.evaluate(entry);
  const onlySemicolon =
    result.status === 'compile-error' &&
    result.diagnostics.length === 1 &&
    result.diagnostics[0]?.code === 'E0202';
  if (!onlySemicolon) return result;
  // On its own line, so a trailing comment cannot swallow it.
  const retried = session.evaluate(`${entry}\n;`);
  return retried.status === 'compile-error' ? result : retried;
}

/**
 * Reads one entry, continuing while a bracket or block comment is still open.
 * `null` means the user is done.
 */
function readEntry(io: Io, options: RenderOptions): string | null {
  let entry = '';
  let prompt = '> ';
  for (;;) {
    io.out(prompt);
    const next = io.readLine();
    if (next === null) {
      // Leaves the shell's prompt on a line of its own.
      if (entry === '') io.out('\n');
      return entry === '' ? null : entry;
    }
    const command = next.trim();
    if (command === '.exit') return null;
    if (command === '.cancel') return '';
    if (command === '.help') {
      io.out(block(REPL_HELP, options.lang));
      continue;
    }
    if (entry === '' && COMMAND.test(command)) {
      io.err(`${line(unknownReplCommand(command), options.lang)}\n`);
      return '';
    }
    entry = prompt === '> ' ? next : `${entry}\n${next}`;
    if (!isOpen(entry)) return entry;
    prompt = '. ';
  }
}

function isOpen(entry: string): boolean {
  const { tokens, diagnostics } = tokenize(entry);
  if (diagnostics.some((d) => d.code === 'E0105')) return true;
  let depth = 0;
  for (const { kind } of tokens) {
    if (OPENERS.has(kind)) depth += 1;
    else if (CLOSERS.has(kind)) depth -= 1;
  }
  return depth > 0;
}
