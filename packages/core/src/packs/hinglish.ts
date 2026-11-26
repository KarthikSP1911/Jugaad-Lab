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

/** Keyword spellings that output and messages need. */
export const WORDS = {
  true: 'sach',
  false: 'jhooth',
  null: 'khaali',
  function: 'kaam',
  return: 'wapas',
  break: 'ruko',
  continue: 'agla',
} as const;

/** Type names as programs and error messages see them. */
export const TYPE_NAMES = {
  number: 'sankhya',
  string: 'shabd',
  boolean: 'bool',
  null: WORDS.null,
  list: 'soochi',
  dictionary: 'kosh',
  function: WORDS.function,
} as const;
