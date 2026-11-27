'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, DICTIONARIES, type Locale } from '../../lib/i18n';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export const useLocale = () => useContext(LocaleContext);

export const useDictionary = () => DICTIONARIES[useLocale()];
