'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  items: readonly { href: string; label: string }[];
  /** Names the highlight that slides between these items. */
  group: string;
  /** Also mark an item current on pages below it. */
  nested?: boolean;
}

export function NavLinks({ items, group, nested = false }: Props) {
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  return items.map(({ href, label }) => {
    const current = pathname === href || (nested && pathname.startsWith(`${href}/`));
    return (
      <Link key={href} href={href} className="nav-link" aria-current={current ? 'page' : undefined}>
        {current && (
          <motion.span
            layoutId={group}
            className="nav-pill"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <span className="relative">{label}</span>
      </Link>
    );
  });
}
