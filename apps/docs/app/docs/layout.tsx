import type { ReactNode } from 'react';
import { NavLinks } from '../../components/nav-links';
import { DOCS_NAV } from '../../lib/site';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
      <aside className="shrink-0 md:w-48">
        <nav
          aria-label="Documentation"
          className="flex flex-wrap gap-1 md:sticky md:top-24 md:flex-col"
        >
          <NavLinks items={DOCS_NAV} />
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
