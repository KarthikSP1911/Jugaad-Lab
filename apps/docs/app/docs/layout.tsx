import type { ReactNode } from 'react';
import { NavLinks } from '../../components/nav-links';
import { Pager } from '../../components/pager';
import { DOCS_NAV } from '../../lib/site';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
      <aside className="shrink-0 md:w-48">
        <nav
          aria-label="Documentation"
          className="flex flex-wrap gap-1 md:sticky md:top-24 md:flex-col"
        >
          <p className="hidden px-3 pb-1 text-xs font-semibold tracking-wider text-muted uppercase md:block">
            Documentation
          </p>
          <NavLinks items={DOCS_NAV} group="docs" />
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
        <Pager />
      </div>
    </div>
  );
}
