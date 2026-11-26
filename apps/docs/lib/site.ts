import { localePath, type Dictionary, type Locale } from './i18n';

export const SITE = {
  name: 'Jugaad Hinglish',
  repository: 'https://github.com/KarthikSP1911/Jugaad-Lab',
} as const;

export function mainNav(locale: Locale, { nav }: Dictionary) {
  return [
    { href: localePath(locale, '/docs'), label: nav.docs },
    { href: localePath(locale, '/playground'), label: nav.playground },
  ];
}

export function docsNav(locale: Locale, { docsNav: labels }: Dictionary) {
  return [
    { href: localePath(locale, '/docs'), label: labels.start },
    { href: localePath(locale, '/docs/tour'), label: labels.tour },
    { href: localePath(locale, '/docs/cheatsheet'), label: labels.cheatsheet },
    { href: localePath(locale, '/docs/reference'), label: labels.reference },
    { href: localePath(locale, '/docs/errors'), label: labels.errors },
  ];
}
