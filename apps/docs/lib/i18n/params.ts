import { notFound } from 'next/navigation';
import { isLocale, type Locale } from './locales';

export interface LocaleProps {
  params: Promise<{ locale: string }>;
}

/** The `[locale]` route segment; English has no prefix, so `/en/...` is not a page. */
export async function localeParam(params: LocaleProps['params']): Promise<Locale> {
  const { locale } = await params;
  if (locale === 'en' || !isLocale(locale)) notFound();
  return locale;
}
