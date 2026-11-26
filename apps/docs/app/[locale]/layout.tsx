import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '../../components/footer';
import { Header } from '../../components/header';
import { LocaleProvider } from '../../components/locale';
import { MotionProvider } from '../../components/motion';
import { SoundProvider } from '../../components/sound';
import { FONT_CLASSES } from '../../lib/fonts';
import { LOCALES } from '../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../lib/i18n/page';
import { SITE } from '../../lib/site';
import { THEME_SCRIPT } from '../../lib/theme-script';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return {
    title: { default: SITE.name, template: `%s · ${SITE.name}` },
    description: t.tagline,
  };
}

export default async function RootLayout({
  children,
  params,
}: LocaleProps & { children: ReactNode }) {
  const { locale, t } = await pageLocale({ params });
  return (
    <html lang={locale} className={FONT_CLASSES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Animated content starts hidden, so show it when scripts are off. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#content" className="skip-link">
          {t.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
          <MotionProvider>
            <SoundProvider>
              <Header locale={locale} />
              <main id="content" className="flex-1">
                {children}
              </main>
              <Footer locale={locale} />
            </SoundProvider>
          </MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
