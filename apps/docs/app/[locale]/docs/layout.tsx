import type { ReactNode } from 'react';
import { NavLinks } from '../../../components/nav-links';
import { Pager } from '../../../components/pager';
import { pageLocale, type LocaleProps } from '../../../lib/i18n/page';
import { docsNav } from '../../../lib/site';

export default async function DocsLayout({
  children,
  params,
}: LocaleProps & { children: ReactNode }) {
  const { locale, t } = await pageLocale({ params });
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
      <aside className="shrink-0 md:w-48">
        <nav
          aria-label={t.docsNav.label}
          className="flex flex-wrap gap-1 md:sticky md:top-24 md:flex-col"
        >
          <p className="hidden px-3 pb-1 text-xs font-semibold tracking-wider text-muted uppercase md:block">
            {t.docsNav.label}
          </p>
          <NavLinks items={docsNav(locale, t)} group="docs" />
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
        <Pager />
      </div>
    </div>
  );
}
