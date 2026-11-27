import type { Locale } from '../i18n/locales';

export const DEMO_IDS = ['hello', 'factorial', 'closures', 'loops'] as const;
export type DemoId = (typeof DEMO_IDS)[number];

const FACTORIAL = `kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n - 1);
}

bolo(factorial(5));`;

const CLOSURES = `kaam counter() {
    rakho c = 0;
    wapas kaam () { c += 1; wapas c; };
}

rakho gino = counter();
bolo(gino(), gino(), gino());`;

const loops = (word: string) => `chalo (rakho i = 1; i <= 5; i += 1) {
    bolo("${word}", i);
}`;

/** One idea per program, simplest first. Only the words inside strings differ by language. */
export const DEMOS: Record<Locale, Record<DemoId, string>> = {
  en: {
    hello: 'bolo("Namaste Duniya");',
    factorial: FACTORIAL,
    closures: CLOSURES,
    loops: loops('Chakkar'),
  },
  hi: {
    hello: 'bolo("नमस्ते दुनिया");',
    factorial: FACTORIAL,
    closures: CLOSURES,
    loops: loops('चक्कर'),
  },
};

/** Each word of the language beside its nearest English equivalent. */
export const KEYWORD_PAIRS = [
  ['rakho', 'let'],
  ['pakka', 'const'],
  ['agar', 'if'],
  ['warna', 'else'],
  ['jabtak', 'while'],
  ['chalo', 'for'],
  ['kaam', 'function'],
  ['wapas', 'return'],
  ['bolo', 'print'],
] as const;
