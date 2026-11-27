'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNav } from '../../lib/config/site';
import { useDictionary, useLocale } from '../ui/locale';

/** Previous and next page, in sidebar order. */
export function Pager() {
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  const t = useDictionary();
  const pages = docsNav(useLocale(), t);
  const index = pages.findIndex(({ href }) => href === pathname);
  if (index < 0) return null;
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <nav aria-label={t.docsNav.more} className="mt-12 grid gap-3 sm:grid-cols-2">
      {previous && (
        <Link href={previous.href} className="card card-link">
          <span className="text-xs text-muted">← {t.docsNav.previous}</span>
          <span className="block font-semibold">{previous.label}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} className="card card-link text-right sm:col-start-2">
          <span className="text-xs text-muted">{t.docsNav.next} →</span>
          <span className="block font-semibold">{next.label}</span>
        </Link>
      )}
    </nav>
  );
}
