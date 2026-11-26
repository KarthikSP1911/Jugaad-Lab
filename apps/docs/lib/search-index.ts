import { errorList } from './error-list';
import { EXAMPLES } from './examples';
import { headings, readDoc } from './markdown';
import { BUILTINS } from './reference';
import type { SearchEntry } from './search';
import { DOCS_NAV } from './site';

/** Built once, at build time, from the same sources as the pages. */
export function searchIndex(): SearchEntry[] {
  return [
    ...DOCS_NAV.map(({ href, label }) => ({ title: label, section: 'Page', href })),
    { title: 'Playground', section: 'Page', href: '/playground', keywords: 'run editor try' },
    ...EXAMPLES.map(({ id, title, summary }) => ({
      title,
      section: 'Language tour',
      href: `/docs/tour#${id}`,
      keywords: summary,
    })),
    ...BUILTINS.map(({ name, does }) => ({
      title: name,
      section: 'Built-in',
      href: '/docs/cheatsheet#builtins',
      keywords: does,
    })),
    ...headings(readDoc('language-spec.md')).map(({ id, text }) => ({
      title: text,
      section: 'Reference',
      href: `/docs/reference#${id}`,
    })),
    ...errorList().map(({ code, hinglish, english }) => ({
      title: `${code} ${hinglish}`,
      section: 'Error code',
      href: `/docs/errors#${code}`,
      keywords: english,
    })),
  ];
}
