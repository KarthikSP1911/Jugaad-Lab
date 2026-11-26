import { TITLES } from './codes.js';
import type { Bilingual, Diagnostic } from './diagnostic.js';
import type { Span } from './span.js';

export type Lang = 'hi' | 'en';

export interface RenderOptions {
  /** Both languages when omitted. */
  lang?: Lang;
}

const INDENT = '    ';

function pick(text: Bilingual, lang: Lang | undefined): string {
  return lang === undefined ? `${text.hi} (${text.en})` : text[lang];
}

/** The offending source line with carets under the span. */
function excerpt(source: string, span: Span): string[] {
  const lineStart = source.lastIndexOf('\n', span.start - 1) + 1;
  // `lastIndexOf` treats a negative position as 0, which matches a leading newline.
  const from = span.start === 0 ? 0 : lineStart;
  const newline = source.indexOf('\n', from);
  const line = source.slice(from, newline === -1 ? source.length : newline).replace(/\r$/, '');
  const before = [...line].slice(0, span.column - 1);
  // Tabs are repeated so the caret lines up at any tab width.
  const padding = before.map((char) => (char === '\t' ? '\t' : ' ')).join('');
  const width = [...source.slice(span.start, Math.min(span.end, from + line.length))].length;
  return [INDENT + line, INDENT + padding + '^'.repeat(Math.max(width, 1))];
}

export function renderDiagnostic(
  diagnostic: Diagnostic,
  source: string,
  options: RenderOptions = {},
): string {
  const { code, message, hint, span, file } = diagnostic;
  const { lang } = options;
  const label = lang === 'en' ? 'Error' : 'Galti';
  const title = TITLES[code][lang ?? 'hi'];
  return [
    `${label} ${code} [${title}] at ${file}:${span.line}:${span.column}`,
    ...excerpt(source, span),
    pick(message, lang),
    ...(hint ? [pick(hint, lang)] : []),
  ].join('\n');
}
