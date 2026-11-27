'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useDictionary } from './locale';

/** Always shown on wide screens; behind a button on narrow ones. */
export function Menu({ children }: { children: ReactNode }) {
  const { header } = useDictionary();
  const pathname = usePathname();
  /** The page the menu was opened on, so following a link closes it. */
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <div
      className="contents"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpenOn(null);
      }}
    >
      <div id="site-menu" className="site-menu" data-open={open}>
        {children}
      </div>
      <button
        type="button"
        className="icon-button order-last md:hidden"
        aria-label={header.menu}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
        </svg>
      </button>
    </div>
  );
}
