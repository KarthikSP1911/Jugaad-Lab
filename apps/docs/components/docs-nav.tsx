'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { docsNav } from '../lib/site';
import { useDictionary, useLocale } from './locale';
import { NavLinks } from './nav-links';

/** The documentation pages in two groups, folded away on narrow screens. */
export function DocsNav() {
  const t = useDictionary();
  const pages = docsNav(useLocale(), t);
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  /** The page the list was opened on, so following a link closes it. */
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const current = pages.find(({ href }) => href === pathname);
  const groups = [
    { title: t.footer.learn, items: pages.slice(0, 2) },
    { title: t.footer.lookUp, items: pages.slice(2) },
  ];

  return (
    <nav aria-label={t.docsNav.label} className="md:sticky md:top-20">
      <button
        type="button"
        className="button w-full justify-between md:hidden"
        aria-expanded={open}
        aria-controls="docs-pages"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {current?.label ?? t.docsNav.label}
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      <div id="docs-pages" className="docs-pages" data-open={open}>
        {groups.map(({ title, items }) => (
          <div key={title} className="flex flex-col gap-0.5">
            <p className="eyebrow px-3 pb-1">{title}</p>
            <NavLinks items={items} group="docs" />
          </div>
        ))}
      </div>
    </nav>
  );
}
