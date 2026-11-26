/** Short titles per code. Keep `docs/error-codes.md` in step with this table. */
export const TITLES = {
  E0101: { hi: 'anjaan akshar', en: 'unknown character' },
  E0102: { hi: 'adhoora string', en: 'unterminated string' },
  E0103: { hi: 'galat escape', en: 'invalid escape' },
  E0104: { hi: 'galat sankhya', en: 'malformed number' },
  E0105: { hi: 'adhoora comment', en: 'unterminated comment' },
  E0201: { hi: 'expression chahiye', en: 'expected an expression' },
  E0202: { hi: "';' chahiye", en: "expected ';'" },
  E0203: { hi: 'chinh chahiye', en: 'expected a symbol' },
  E0204: { hi: 'naam chahiye', en: 'expected a name' },
  E0205: { hi: 'galat assignment', en: 'invalid assignment target' },
  E0206: { hi: 'value chahiye', en: 'constant needs a value' },
  E0207: { hi: 'yahan declaration nahi', en: 'declaration not allowed here' },
  E0208: { hi: 'key chahiye', en: 'expected a dictionary key' },
  E0209: { hi: 'bahut gehra code', en: 'code nested too deeply' },
} as const;

export type DiagnosticCode = keyof typeof TITLES;
