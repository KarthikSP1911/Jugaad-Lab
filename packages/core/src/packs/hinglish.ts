import type { KeywordKind } from '../lexer/token.js';

/** Maps each reserved word to its token kind. Aliases are extra entries. */
export type LanguagePack = ReadonlyMap<string, KeywordKind>;

export const hinglish: LanguagePack = new Map<string, KeywordKind>([
  ['rakho', 'Var'],
  ['pakka', 'Const'],
  ['kaam', 'Function'],
  ['wapas', 'Return'],
  ['agar', 'If'],
  ['warna', 'Else'],
  ['sach', 'True'],
  ['jhooth', 'False'],
  ['khaali', 'Null'],
  ['jabtak', 'While'],
  ['chalo', 'For'],
  ['ruko', 'Break'],
  ['agla', 'Continue'],
  ['aur', 'AndAnd'],
  ['ya', 'OrOr'],
  ['nahi', 'Bang'],
]);
