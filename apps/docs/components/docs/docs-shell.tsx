import type { ReactNode } from 'react';
import { HTML_LANG, type Locale } from '../../lib/i18n/locales';
import { docsNav } from '../../lib/i18n/nav';
import { STRINGS } from '../../lib/i18n/strings';
import { NavLinks } from '../nav-links';
import { Pager } from '../pager';

/** Sidebar, page and pager for the docs in one language. */
export function DocsShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const items = docsNav(locale);
  const strings = STRINGS[locale];
  return (
    <div
      lang={HTML_LANG[locale]}
      className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10"
    >
      <aside className="shrink-0 md:w-48">
        <nav
          aria-label={strings.sidebar}
          className="flex flex-wrap gap-1 md:sticky md:top-24 md:flex-col"
        >
          <p className="hidden px-3 pb-1 text-xs font-semibold tracking-wider text-muted uppercase md:block">
            {strings.sidebar}
          </p>
          <NavLinks items={items} group="docs" />
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
        <Pager items={items} labels={strings.pager} />
      </div>
    </div>
  );
}
