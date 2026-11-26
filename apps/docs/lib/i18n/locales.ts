import type { Lang } from '@jugaad-hinglish/core';

export const LOCALES = ['en', 'hi'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Where the visitor's chosen locale is saved. */
export const LOCALE_KEY = 'locale';

/** Each language's name in itself, as shown by the language switch. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', hi: 'हिन्दी' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The error language a page starts with: Hinglish in English, Devanagari in Hindi. */
export const ERROR_LANG: Record<Locale, Lang> = { en: 'hi', hi: 'deva' };

/** A site path such as `/docs` under the given locale. */
export function localePath(locale: Locale, href: string): string {
  return `/${locale}${href === '/' ? '' : href}`;
}

/** The same page in another locale; `pathname` starts with a locale. */
export function switchLocale(pathname: string, locale: Locale): string {
  const rest = pathname.replace(/^\/(en|hi)(?=\/|$)/, '').replace(/\/$/, '');
  return localePath(locale, rest || '/');
}
