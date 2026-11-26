import { hinglish, tokenize } from '@jugaad-hinglish/core';
import { highlight } from './highlight';
import { DEFAULT_LOCALE, DICTIONARIES, type Locale } from './i18n';
import { builtins as builtinList, KEYWORD_MEANINGS } from './reference';

export interface Suggestion {
  label: string;
  kind: 'keyword' | 'builtin' | 'name';
  detail: string;
  /** Text that replaces the typed prefix. */
  insert: string;
}

export interface Completion {
  /** Where the typed prefix starts. */
  from: number;
  items: Suggestion[];
}

export const MAX_SUGGESTIONS = 8;

const PREFIX = /[\p{ID_Start}_][\p{ID_Continue}]*$/u;
const PARTIAL_NUMBER = /[\p{ID_Continue}]$/u;

function insideText(source: string, cursor: number): boolean {
  let end = 0;
  for (const { kind, text } of highlight(source.slice(0, cursor))) {
    end += text.length;
    if (end === cursor) {
      // A line comment still holds the cursor; a closed string or block comment does not.
      if (kind === 'comment') return !text.endsWith('*/');
      return false;
    }
  }
  return false;
}

/** The lexer rejects an unterminated string, so look for an open quote on the line. */
function insideOpenString(source: string, cursor: number): boolean {
  const line = source.slice(source.lastIndexOf('\n', cursor - 1) + 1, cursor);
  let quote = '';
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '/' && line[index + 1] === '/') return true;
  }
  return quote !== '';
}

function candidates(source: string, from: number, locale: Locale): Suggestion[] {
  const { editor } = DICTIONARIES[locale];
  const keywords = [...hinglish].map(
    ([word, kind]): Suggestion => ({
      label: word,
      kind: 'keyword',
      detail: KEYWORD_MEANINGS[locale][kind] ?? editor.keyword,
      insert: word,
    }),
  );
  const builtins = builtinList(locale).map(({ name, does }): Suggestion => {
    const label = name.slice(0, name.indexOf('('));
    return { label, kind: 'builtin', detail: does, insert: `${label}(` };
  });
  const known = new Set([...keywords, ...builtins].map(({ label }) => label));
  const names = tokenize(source)
    .tokens.filter((token) => token.kind === 'Identifier' && token.start !== from)
    .map((token) => token.lexeme)
    .filter((name) => !known.has(name));
  const own = [...new Set(names)].map(
    (name): Suggestion => ({
      label: name,
      kind: 'name',
      detail: editor.ownName,
      insert: name,
    }),
  );
  return [...own, ...keywords, ...builtins];
}

/**
 * Suggestions for the word ending at the cursor. `explicit` (Ctrl+Space) also
 * offers everything when nothing has been typed.
 */
export function complete(
  source: string,
  cursor: number,
  explicit = false,
  locale: Locale = DEFAULT_LOCALE,
): Completion | null {
  const before = source.slice(0, cursor);
  if (insideText(source, cursor) || insideOpenString(source, cursor)) return null;
  const prefix = PREFIX.exec(before)?.[0] ?? '';
  // Digits followed by letters are not the start of a name.
  const start = cursor - prefix.length;
  if (prefix && PARTIAL_NUMBER.test(source.slice(0, start))) return null;
  if (!prefix && !explicit) return null;

  const all = candidates(source, start, locale);
  // A finished word needs no popup, so Enter keeps adding a new line.
  if (!explicit && all.some(({ label }) => label === prefix)) return null;
  const typed = prefix.toLowerCase();
  const items = all.filter(({ label }) => label.toLowerCase().startsWith(typed));
  if (items.length === 0) return null;
  return { from: start, items: explicit ? items : items.slice(0, MAX_SUGGESTIONS) };
}
