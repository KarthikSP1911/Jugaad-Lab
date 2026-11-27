'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Heading } from '../../lib/content/markdown';
import { useDictionary } from '../ui/locale';

/** Distance below the top at which a heading counts as being read. */
const READING_LINE = 140;

export function Toc({ headings }: { headings: Heading[] }) {
  const { docsNav } = useDictionary();
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    function update() {
      const passed = headings.filter(({ id }) => {
        const element = document.getElementById(id);
        return element !== null && element.getBoundingClientRect().top <= READING_LINE;
      });
      setActive((passed.at(-1) ?? headings[0])?.id);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [headings]);

  return (
    <nav aria-label={docsNav.onThisPage} className="sticky top-24 text-sm">
      <p className="mb-2 font-semibold">{docsNav.onThisPage}</p>
      {headings.map(({ id, text }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`relative block py-1 pl-3 hover:text-ink ${
            active === id ? 'text-ink' : 'text-muted'
          }`}
          aria-current={active === id ? 'location' : undefined}
        >
          {active === id && <motion.span layoutId="toc" className="toc-marker" />}
          {text}
        </a>
      ))}
    </nav>
  );
}
