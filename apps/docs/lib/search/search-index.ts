import { hinglish } from '@jugaad-hinglish/core';
import { errorList } from '../content/error-list';
import { examples } from '../content/examples';
import { DICTIONARIES, localePath, type Locale } from '../i18n';
import { headings, readDoc } from '../content/markdown';
import { builtins, KEYWORD_MEANINGS } from '../content/reference';
import type { SearchEntry } from './search';
import { docsNav } from '../config/site';

/** Built once, at build time, from the same sources as the pages. */
export function searchIndex(locale: Locale): SearchEntry[] {
  const t = DICTIONARIES[locale];
  const to = (href: string) => localePath(locale, href);
  // English words find Hindi entries too.
  const english = examples('en');
  const englishBuiltins = builtins('en');
  const alias = (text: string) => (locale === 'en' ? '' : ` ${text}`);
  return [
    ...docsNav(locale, t).map(({ href, label }) => ({ title: label, section: t.search.page, href })),
    {
      title: t.nav.playground,
      section: t.search.page,
      href: to('/playground'),
      keywords: t.search.playgroundKeywords,
    },
    ...examples(locale).map(({ id, title, summary }, index) => ({
      title,
      section: t.docsNav.tour,
      href: to(`/docs/tour#${id}`),
      keywords: summary + alias(`${english[index]?.title} ${english[index]?.summary}`),
    })),
    ...[...hinglish].map(([word, kind]) => ({
      title: word,
      section: t.search.keyword,
      href: to('/docs/cheatsheet#keywords'),
      keywords:
        (KEYWORD_MEANINGS[locale][kind] ?? '') + alias(KEYWORD_MEANINGS.en[kind] ?? ''),
    })),
    ...builtins(locale).map(({ name, does }, index) => ({
      title: name,
      section: t.search.builtin,
      href: to('/docs/cheatsheet#builtins'),
      keywords: does + alias(englishBuiltins[index]?.does ?? ''),
    })),
    ...headings(readDoc('language-spec.md', locale)).map(({ id, text }) => ({
      title: text,
      section: t.docsNav.reference,
      href: to(`/docs/reference#${id}`),
    })),
    ...errorList(locale).map(({ code, title, meaning }) => ({
      title: `${code} ${title}`,
      section: t.search.errorCode,
      href: to(`/docs/errors#${code}`),
      keywords: meaning,
    })),
  ];
}
