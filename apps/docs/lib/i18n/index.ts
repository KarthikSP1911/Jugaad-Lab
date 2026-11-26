import { en, type Dictionary } from './en';
import { hi } from './hi';
import type { Locale } from './locales';

export type { Dictionary } from './en';
export * from './locales';

export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi };
