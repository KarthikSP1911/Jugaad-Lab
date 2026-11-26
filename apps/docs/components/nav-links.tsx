'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  items: readonly { href: string; label: string }[];
  /** Also mark an item current on pages below it. */
  nested?: boolean;
}

export function NavLinks({ items, nested = false }: Props) {
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  return items.map(({ href, label }) => {
    const current = pathname === href || (nested && pathname.startsWith(`${href}/`));
    return (
      <Link key={href} href={href} className="nav-link" aria-current={current ? 'page' : undefined}>
        {label}
      </Link>
    );
  });
}
