import { notFound } from 'next/navigation';
import { DICTIONARIES } from './index';
import { isLocale } from './locales';

export interface LocaleProps {
  params: Promise<{ locale: string }>;
}

/** The locale and dictionary of a page under `app/[locale]`. */
export async function pageLocale({ params }: LocaleProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, t: DICTIONARIES[locale] };
}
