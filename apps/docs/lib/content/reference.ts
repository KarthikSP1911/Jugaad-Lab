import type { Locale } from '../i18n/locales';

/** Short reference data for the cheatsheet and search. */
export const KEYWORD_MEANINGS: Record<Locale, Record<string, string>> = {
  en: {
    Var: 'declare a variable',
    Const: 'declare a constant',
    Function: 'define a function',
    Return: 'return from a function',
    If: 'if',
    Else: 'else',
    True: 'true',
    False: 'false',
    Null: 'null',
    While: 'while loop',
    For: 'counted loop',
    Break: 'leave a loop',
    Continue: 'skip to the next round',
    AndAnd: 'and (&&)',
    OrOr: 'or (||)',
    Bang: 'not (!)',
  },
  hi: {
    Var: 'वेरिएबल घोषित करें',
    Const: 'स्थिरांक घोषित करें',
    Function: 'फ़ंक्शन बनाएँ',
    Return: 'फ़ंक्शन से लौटें',
    If: 'अगर',
    Else: 'वरना',
    True: 'सच',
    False: 'झूठ',
    Null: 'खाली',
    While: 'जब तक वाला लूप',
    For: 'गिनती वाला लूप',
    Break: 'लूप से बाहर निकलें',
    Continue: 'अगले चक्कर पर जाएँ',
    AndAnd: 'और (&&)',
    OrOr: 'या (||)',
    Bang: 'नहीं (!)',
  },
};

const FUNCTIONS: readonly (Record<Locale, string> & { name: string })[] = [
  { name: 'bolo(a, b, ...)', en: 'print the values, then a new line', hi: 'मान छापें, फिर नई लाइन' },
  {
    name: 'suno(prompt)',
    en: 'show the prompt and read one line',
    hi: 'प्रॉम्प्ट दिखाकर एक लाइन पढ़ें',
  },
  {
    name: 'lambai(x)',
    en: 'length of a string, list or dictionary',
    hi: 'स्ट्रिंग, सूची या शब्दकोश की लंबाई',
  },
  { name: 'joro(list, x)', en: 'add x to the end of a list', hi: 'सूची के अंत में x जोड़ें' },
  {
    name: 'nikalo(list)',
    en: 'remove and return the last element',
    hi: 'आख़िरी तत्व निकालकर लौटाएँ',
  },
  { name: 'sankhya(x)', en: 'turn a string into a number', hi: 'स्ट्रिंग को संख्या में बदलें' },
  { name: 'shabd(x)', en: 'turn any value into a string', hi: 'किसी भी मान को स्ट्रिंग में बदलें' },
  { name: 'prakar(x)', en: 'name of the type of x', hi: 'x के टाइप का नाम' },
];

export function builtins(locale: Locale) {
  return FUNCTIONS.map((entry) => ({ name: entry.name, does: entry[locale] }));
}
