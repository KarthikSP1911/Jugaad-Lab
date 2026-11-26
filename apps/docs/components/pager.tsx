'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_NAV } from '../lib/site';

/** Previous and next page, in sidebar order. */
export function Pager() {
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  const index = DOCS_NAV.findIndex(({ href }) => href === pathname);
  if (index < 0) return null;
  const previous = DOCS_NAV[index - 1];
  const next = DOCS_NAV[index + 1];
  return (
    <nav aria-label="More documentation" className="mt-12 grid gap-3 sm:grid-cols-2">
      {previous && (
        <Link href={previous.href} className="card card-link">
          <span className="text-xs text-muted">← Previous</span>
          <span className="block font-semibold">{previous.label}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} className="card card-link text-right sm:col-start-2">
          <span className="text-xs text-muted">Next →</span>
          <span className="block font-semibold">{next.label}</span>
        </Link>
      )}
    </nav>
  );
}
