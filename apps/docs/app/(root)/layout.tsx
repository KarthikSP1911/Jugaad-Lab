import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FONT_CLASSES } from '../../lib/fonts';
import { DEFAULT_LOCALE } from '../../lib/i18n/locales';
import { SITE } from '../../lib/site';
import { THEME_SCRIPT } from '../../lib/theme-script';
import '../globals.css';

export const metadata: Metadata = { title: SITE.name };

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={FONT_CLASSES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
