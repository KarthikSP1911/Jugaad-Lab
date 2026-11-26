import { TITLES } from '@jugaad-hinglish/core';
import { readDoc } from './markdown';

export interface ErrorEntry {
  code: string;
  hinglish: string;
  english: string;
}

/** Hinglish titles come from `core`; English meanings from `docs/error-codes.md`. */
export function errorList(): ErrorEntry[] {
  const meanings = new Map(
    [...readDoc('error-codes.md').matchAll(/^\| (E\d{4}) \| (.+?) \|\s*$/gm)].map(
      (row) => [row[1], row[2]?.replaceAll('`', '') ?? ''] as const,
    ),
  );
  return Object.entries(TITLES).map(([code, title]) => ({
    code,
    hinglish: title.hi,
    english: meanings.get(code) ?? title.en,
  }));
}
