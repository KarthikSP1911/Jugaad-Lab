import { WORDS } from '../packs/hinglish.js';
import type { HinglishError } from '../runtime/hinglish-error.js';
import { TITLES } from './codes.js';
import type { Bilingual, Diagnostic } from './diagnostic.js';
import type { Span } from './span.js';

/** `hi` is Roman-script Hinglish; `deva` is Hindi in Devanagari. */
export type Lang = 'hi' | 'en' | 'deva';

export interface RenderOptions {
  /** Hinglish with English in brackets when omitted. */
  lang?: Lang;
}

const INDENT = '    ';

interface Labels {
  error: string;
  place: (place: string) => string;
  frame: (name: string, place: string) => string;
  hidden: (count: number) => string;
}

const AT: Pick<Labels, 'place' | 'frame' | 'hidden'> = {
  place: (place) => `at ${place}`,
  frame: (name, place) => `at ${name} (${place})`,
  hidden: (count) => `... ${count} more`,
};

const LABELS: Record<Lang | 'both', Labels> = {
  both: { error: 'Galti', ...AT },
  en: { error: 'Error', ...AT },
  hi: {
    error: 'Galti',
    place: (place) => `yahan: ${place}`,
    frame: (name, place) => `${name} ke andar (${place})`,
    hidden: (count) => `... ${count} aur`,
  },
  deva: {
    error: 'गलती',
    place: (place) => `यहाँ: ${place}`,
    frame: (name, place) => `${name} के अंदर (${place})`,
    hidden: (count) => `... ${count} और`,
  },
};

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
  // Tabs are repeated so the caret lines up at any tab width. Marks such as
  // Devanagari vowel signs take no column of their own.
  const padding = before
    .filter((char) => !/\p{Mn}/u.test(char))
    .map((char) => (char === '\t' ? '\t' : ' '))
    .join('');
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
  const labels = LABELS[lang ?? 'both'];
  const title = TITLES[code][lang ?? 'hi'];
  const where = labels.place(`${file}:${span.line}:${span.column}`);
  return [
    `${labels.error} ${code} [${title}] ${where}`,
    ...excerpt(source, span),
    pick(message, lang),
    ...(hint ? [pick(hint, lang)] : []),
  ].join('\n');
}

const MAX_FRAMES = 10;

/** A runtime diagnostic followed by the calls that led to it, innermost first. */
export function renderRuntimeError(
  error: HinglishError,
  source: string,
  options: RenderOptions = {},
): string {
  const { diagnostic, frames } = error;
  const labels = LABELS[options.lang ?? 'both'];
  const trace = frames.slice(0, MAX_FRAMES).map(({ functionName, span }) => {
    const name = functionName ?? `<${WORDS.function}>`;
    return `  ${labels.frame(name, `${diagnostic.file}:${span.line}:${span.column}`)}`;
  });
  const hidden = frames.length - trace.length;
  if (hidden > 0) trace.push(`  ${labels.hidden(hidden)}`);
  return [renderDiagnostic(diagnostic, source, options), ...trace].join('\n');
}
