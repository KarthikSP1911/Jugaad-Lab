import {
  createSession,
  renderDiagnostic,
  renderRuntimeError,
  tokenize,
  VERSION,
  type RenderOptions,
  type TokenKind,
} from '@jugaad-hinglish/core';
import { hostFor, type Io } from './io.js';

const OPENERS: ReadonlySet<TokenKind> = new Set(['LeftParen', 'LeftBrace', 'LeftBracket']);
const CLOSERS: ReadonlySet<TokenKind> = new Set(['RightParen', 'RightBrace', 'RightBracket']);

export function repl(io: Io, options: RenderOptions, maxSteps?: number): number {
  io.out(`Jugaad Hinglish ${VERSION}. Type .exit to quit.\n`);
  const session = createSession(hostFor(io), { file: '<repl>', maxSteps });
  for (;;) {
    const entry = readEntry(io);
    if (entry === null || entry.trim() === '.exit') return 0;
    if (entry.trim() === '') continue;
    const result = session.evaluate(entry);
    if (result.status === 'runtime-error') {
      io.err(`${renderRuntimeError(result.error, result.source, options)}\n`);
    } else if (result.status === 'compile-error') {
      for (const d of result.diagnostics) {
        io.err(`${renderDiagnostic(d, result.source, options)}\n`);
      }
    } else if (result.echo !== undefined) {
      io.out(`${result.echo}\n`);
    }
  }
}

/** Keeps reading while a bracket or block comment is still open. */
function readEntry(io: Io): string | null {
  io.out('> ');
  let entry = io.readLine();
  while (entry !== null && isOpen(entry)) {
    io.out('. ');
    const more = io.readLine();
    if (more === null) break;
    entry += `\n${more}`;
  }
  return entry;
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
