import { TITLES } from '@jugaad-hinglish/core';
import { ERROR_LANG, type Locale } from '../i18n/locales';
import { readDoc } from './markdown';

export interface ErrorEntry {
  code: string;
  /** In the page's error language: Hinglish or Devanagari. */
  title: string;
  meaning: string;
}

/** Titles come from `core`; meanings from the locale's `docs/error-codes.md`. */
export function errorList(locale: Locale): ErrorEntry[] {
  const meanings = new Map(
    [...readDoc('error-codes.md', locale).matchAll(/^\| (E\d{4}) \| (.+?) \|\s*$/gm)].map(
      (row) => [row[1], row[2]?.replaceAll('`', '') ?? ''] as const,
    ),
  );
  const lang = ERROR_LANG[locale];
  return Object.entries(TITLES).map(([code, title]) => ({
    code,
    title: title[lang],
    meaning: meanings.get(code) ?? title.en,
  }));
}
