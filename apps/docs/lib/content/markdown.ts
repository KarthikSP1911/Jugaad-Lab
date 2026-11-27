import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_LOCALE, type Locale } from '../i18n/locales';

/** Reads a file from the repository's `docs/` at build time; Hindi copies live in `docs/hi/`. */
export function readDoc(file: string, locale: Locale = DEFAULT_LOCALE): string {
  const folder = locale === DEFAULT_LOCALE ? [] : [locale];
  return readFileSync(join(process.cwd(), '..', '..', 'docs', ...folder, file), 'utf8');
}

export interface Heading {
  id: string;
  text: string;
}

/** Second-level headings, with the ids `rehype-slug` gives plain-text titles. */
export function headings(markdown: string): Heading[] {
  return [...markdown.matchAll(/^## (.+?)\r?$/gm)].map((match) => {
    const text = match[1] ?? '';
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');
    return { id, text: text.replaceAll('`', '') };
  });
}
