import type { ReactNode } from 'react';
import { DocsNav } from '../../../components/docs-nav';
import { Pager } from '../../../components/pager';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
      <aside className="shrink-0 md:w-52 md:border-r md:border-line md:pr-4">
        <DocsNav />
      </aside>
      <div className="min-w-0 flex-1">
        {children}
        <Pager />
      </div>
    </div>
  );
}
