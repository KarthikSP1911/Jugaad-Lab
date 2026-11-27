import type { Bilingual, Lang } from '@jugaad-hinglish/core';

/** Picks a language the way `core` renders diagnostics: both when none is chosen. */
export function say(text: Bilingual, lang: Lang | undefined): string {
  return lang === undefined ? `${text.hi} (${text.en})` : text[lang];
}

/** `both` shows Hinglish with English in brackets. */
export type MessageLang = Lang | 'both';

export type Messages = Record<MessageLang, string>;

/** Renders a message in every language, so switching needs no second run. */
export function everyLanguage(render: (lang: Lang | undefined) => string): Messages {
  return { hi: render('hi'), en: render('en'), deva: render('deva'), both: render(undefined) };
}

export const MESSAGES = {
  tooMuchOutput: {
    hi: 'Roka gaya: program ne bahut zyada output diya.',
    deva: 'रोका गया: प्रोग्राम ने बहुत ज़्यादा आउटपुट दिया।',
    en: 'Stopped: the program printed too much output.',
  },
  failed: {
    hi: 'Interpreter mein achanak gadbad ho gayi.',
    deva: 'इंटरप्रेटर में अचानक गड़बड़ हो गई।',
    en: 'The interpreter failed unexpectedly.',
  },
  notStarted: {
    hi: 'Interpreter shuru nahi ho paya.',
    deva: 'इंटरप्रेटर शुरू नहीं हो पाया।',
    en: 'The interpreter could not be started.',
  },
  timedOut: {
    hi: 'Roka gaya: program 5 second se zyada chala.',
    deva: 'रोका गया: प्रोग्राम 5 सेकंड से ज़्यादा चला।',
    en: 'Stopped: the program ran longer than 5 seconds.',
  },
  stopped: {
    hi: 'Aapne program rok diya.',
    deva: 'आपने प्रोग्राम रोक दिया।',
    en: 'Stopped.',
  },
} satisfies Record<string, Bilingual>;
