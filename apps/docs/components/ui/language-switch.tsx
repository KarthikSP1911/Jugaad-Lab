'use client';

import { usePathname } from 'next/navigation';
import { LOCALE_KEY, LOCALE_NAMES, LOCALES, switchLocale } from '../../lib/i18n';
import { useDictionary, useLocale } from './locale';

export function LanguageSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  const { header } = useDictionary();
  const other = LOCALES.find((candidate) => candidate !== locale) ?? locale;
  return (
    // A full load, so the document's language and the fonts follow.
    <a
      href={switchLocale(pathname, other)}
      className="nav-link"
      lang={other}
      title={header.language}
      onClick={(event) => {
        // The fragment holds a shared program or the heading being read.
        event.currentTarget.hash = window.location.hash;
        try {
          localStorage.setItem(LOCALE_KEY, other);
        } catch {
          // Storage can be blocked; the address still carries the choice.
        }
      }}
    >
      {LOCALE_NAMES[other]}
    </a>
  );
}
