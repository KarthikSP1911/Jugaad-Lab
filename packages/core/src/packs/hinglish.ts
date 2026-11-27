import type { KeywordKind } from '../lexer/token.js';

/** Maps each reserved word to its token kind. Aliases are extra entries. */
export type LanguagePack = ReadonlyMap<string, KeywordKind>;

/** The main spelling of each keyword: the one the docs teach and output prints. */
export const KEYWORDS: LanguagePack = new Map<string, KeywordKind>([
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

/**
 * Roman Hindi has no standard spelling, so common variants are accepted too.
 * Each alias maps to its main spelling. An alias is a reserved word, so it cannot
 * be a variable name: only add spellings nobody would use as a name.
 */
export const ALIASES: ReadonlyMap<string, string> = new Map([
  ['pakaa', 'pakka'],
  ['pukka', 'pakka'],
  ['vapas', 'wapas'],
  ['waapas', 'wapas'],
  ['vaapas', 'wapas'],
  ['varna', 'warna'],
  ['sachh', 'sach'],
  ['sacch', 'sach'],
  ['jhoot', 'jhooth'],
  ['jhuth', 'jhooth'],
  ['jhut', 'jhooth'],
  ['jhoothh', 'jhooth'],
  ['khali', 'khaali'],
  ['yaa', 'ya'],
  ['nahin', 'nahi'],
  ['nhi', 'nahi'],
]);

/** Every spelling the lexer accepts: the main ones and their aliases. */
export const hinglish: LanguagePack = new Map<string, KeywordKind>([
  ...KEYWORDS,
  ...[...ALIASES].map(([alias, word]): [string, KeywordKind] => {
    const kind = KEYWORDS.get(word);
    if (kind === undefined) throw new Error(`alias '${alias}' points to unknown keyword '${word}'`);
    return [alias, kind];
  }),
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
