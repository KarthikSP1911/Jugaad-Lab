import { renderDiagnostic, type Diagnostic, type RenderOptions } from '@jugaad-hinglish/core';
import type { Io } from './io.js';
import { errorCount, line } from './messages.js';

const RED = '\u001b[31m';
const BOLD_RED = '\u001b[1;31m';
const RESET = '\u001b[0m';
const CARET_LINE = /^\s*\^+\s*$/;

/** Highlights the headline and the caret of a rendered error. */
export function paint(rendered: string): string {
  return rendered
    .split('\n')
    .map((text, index) => {
      if (index === 0) return `${BOLD_RED}${text}${RESET}`;
      return CARET_LINE.test(text) ? `${RED}${text}${RESET}` : text;
    })
    .join('\n');
}

export function printError(io: Io, rendered: string): void {
  io.err(`${io.color ? paint(rendered) : rendered}\n`);
}

/** Errors separated by blank lines, with a count when there are several. */
export function printDiagnostics(
  io: Io,
  diagnostics: readonly Diagnostic[],
  source: string,
  options: RenderOptions,
): void {
  diagnostics.forEach((diagnostic, index) => {
    if (index > 0) io.err('\n');
    printError(io, renderDiagnostic(diagnostic, source, options));
  });
  if (diagnostics.length > 1) {
    io.err(`\n${line(errorCount(diagnostics.length), options.lang)}\n`);
  }
}
