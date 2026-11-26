import type { Bilingual, Lang } from '@jugaad-hinglish/core';

/** Picks a language the way `core` renders diagnostics: both when none is chosen. */
export function say({ hi, en }: Bilingual, lang: Lang | undefined): string {
  if (lang === 'hi') return hi;
  if (lang === 'en') return en;
  return `${hi} (${en})`;
}

export const MESSAGES = {
  tooMuchOutput: {
    hi: 'Roka gaya: program ne bahut zyada output diya.',
    en: 'Stopped: the program printed too much output.',
  },
  failed: {
    hi: 'Interpreter mein achanak gadbad ho gayi.',
    en: 'The interpreter failed unexpectedly.',
  },
  notStarted: {
    hi: 'Interpreter shuru nahi ho paya.',
    en: 'The interpreter could not be started.',
  },
  timedOut: {
    hi: 'Roka gaya: program 5 second se zyada chala.',
    en: 'Stopped: the program ran longer than 5 seconds.',
  },
  stopped: { hi: 'Aapne program rok diya.', en: 'Stopped.' },
} satisfies Record<string, Bilingual>;
