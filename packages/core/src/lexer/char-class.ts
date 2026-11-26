// Tested against one non-ASCII code point at a time; ASCII never reaches them.
const UNICODE_ID_START = /\p{ID_Start}/u;
const UNICODE_ID_CONTINUE = /\p{ID_Continue}/u;

export function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

export function isIdentifierStart(char: string): boolean {
  if (char === '_') return true;
  if (char < '\u0080') return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  return UNICODE_ID_START.test(char);
}

/** Includes combining marks, which Devanagari vowel signs are. */
export function isIdentifierPart(char: string): boolean {
  if (char < '\u0080') return isIdentifierStart(char) || isDigit(char);
  return UNICODE_ID_CONTINUE.test(char);
}
