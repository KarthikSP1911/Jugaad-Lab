import type { ReactNode } from 'react';
import { DocsNav } from '../../../components/layout/docs-nav';
import { Pager } from '../../../components/layout/pager';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wrap flex flex-col gap-6 py-8 md:flex-row md:gap-10">
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
