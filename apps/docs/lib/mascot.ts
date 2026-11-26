import type { Bilingual } from '@jugaad-hinglish/core';
import type { Outcome } from './execute';
import type { SoundName } from './sound';

export type Status = 'idle' | 'running' | Outcome;

export type Mood = 'idle' | 'thinking' | 'happy' | 'worried' | 'talking';

export interface Reaction {
  mood: Mood;
  sound: SoundName | null;
  line: Bilingual;
}

/** What Mithu does for each state of the playground. */
export const REACTIONS: Record<Status, Reaction> = {
  idle: {
    mood: 'idle',
    sound: null,
    line: { hi: 'Code likho aur Run dabao!', en: 'Write some code and press Run!' },
  },
  running: {
    mood: 'thinking',
    sound: 'run',
    line: { hi: 'Soch raha hoon…', en: 'Thinking…' },
  },
  ok: {
    mood: 'happy',
    sound: 'success',
    line: { hi: 'Shabash! Program chal gaya.', en: 'Well done! The program ran.' },
  },
  'compile-error': {
    mood: 'worried',
    sound: 'error',
    line: { hi: 'Arre! Code mein galti hai.', en: 'Oh no! The code has a mistake.' },
  },
  'runtime-error': {
    mood: 'worried',
    sound: 'error',
    line: { hi: 'Oho! Chalte waqt gadbad hui.', en: 'Oops! Something broke while running.' },
  },
  stopped: {
    mood: 'worried',
    sound: 'stop',
    line: { hi: 'Ruk gaya. Phir se koshish karo.', en: 'It stopped. Try again.' },
  },
};

/** Said one after another when Mithu is clicked. */
export const TIPS: readonly Bilingual[] = [
  { hi: 'Har line ke ant mein ; lagana.', en: 'End each statement with ;' },
  { hi: 'bolo() se kuch bhi chhapo.', en: 'Print anything with bolo().' },
  { hi: 'Badalne wali value? rakho.', en: 'A value that changes? Use rakho.' },
  { hi: 'Na badalne wali value? pakka.', en: 'A value that stays? Use pakka.' },
  { hi: 'Mithu ko mirchi pasand hai!', en: 'Mithu likes chillies!' },
];

export const GREETING = 'Namaste! Main Mithu hoon. Mujhe click karo.';
