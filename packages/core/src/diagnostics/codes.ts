/** Short titles per code. Keep `docs/error-codes.md` in step with this table. */
export const TITLES = {
  E0101: { hi: 'anjaan akshar', en: 'unknown character' },
  E0102: { hi: 'adhoora string', en: 'unterminated string' },
  E0103: { hi: 'galat escape', en: 'invalid escape' },
  E0104: { hi: 'galat sankhya', en: 'malformed number' },
  E0105: { hi: 'adhoora comment', en: 'unterminated comment' },
} as const;

export type DiagnosticCode = keyof typeof TITLES;
