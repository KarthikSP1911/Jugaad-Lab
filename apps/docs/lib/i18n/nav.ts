import { localize, type Locale } from './locales';
import { STRINGS } from './strings';

/** The docs sidebar for one language, in reading order. */
export function docsNav(locale: Locale): { href: string; label: string }[] {
  const { nav } = STRINGS[locale];
  return [
    { href: '/docs', label: nav.start },
    { href: '/docs/tour', label: nav.tour },
    { href: '/docs/cheatsheet', label: nav.cheatsheet },
    { href: '/docs/reference', label: nav.reference },
    { href: '/docs/errors', label: nav.errors },
  ].map(({ href, label }) => ({ href: localize(href, locale), label }));
}
