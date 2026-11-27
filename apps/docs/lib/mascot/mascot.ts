import type { Bilingual, DiagnosticCode } from '@jugaad-hinglish/core';
import type { Outcome } from '../playground/execute';
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
    line: { hi: 'Code likho aur Run dabao!', deva: 'कोड लिखो और “चलाएँ” दबाओ!', en: 'Write some code and press Run!' },
  },
  running: {
    mood: 'thinking',
    sound: 'run',
    line: { hi: 'Soch raha hoon…', deva: 'सोच रहा हूँ…', en: 'Thinking…' },
  },
  ok: {
    mood: 'happy',
    sound: 'success',
    line: { hi: 'Shabash! Program chal gaya.', deva: 'शाबाश! प्रोग्राम चल गया।', en: 'Well done! The program ran.' },
  },
  'compile-error': {
    mood: 'worried',
    sound: 'error',
    line: { hi: 'Arre! Code mein galti hai.', deva: 'अरे! कोड में गलती है।', en: 'Oh no! The code has a mistake.' },
  },
  'runtime-error': {
    mood: 'worried',
    sound: 'error',
    line: { hi: 'Oho! Chalte waqt gadbad hui.', deva: 'ओहो! चलते समय गड़बड़ हुई।', en: 'Oops! Something broke while running.' },
  },
  stopped: {
    mood: 'worried',
    sound: 'stop',
    line: { hi: 'Ruk gaya. Phir se koshish karo.', deva: 'रुक गया। फिर से कोशिश करो।', en: 'It stopped. Try again.' },
  },
};

/** Said one after another when Mithu is clicked. */
export const TIPS: readonly Bilingual[] = [
  { hi: 'Har line ke ant mein ; lagana.', deva: 'हर लाइन के अंत में ; लगाना।', en: 'End each statement with ;' },
  { hi: 'bolo() se kuch bhi chhapo.', deva: 'bolo() से कुछ भी छापो।', en: 'Print anything with bolo().' },
  { hi: 'Badalne wali value? rakho.', deva: 'बदलने वाला मान? rakho लगाओ।', en: 'A value that changes? Use rakho.' },
  { hi: 'Na badalne wali value? pakka.', deva: 'न बदलने वाला मान? pakka लगाओ।', en: 'A value that stays? Use pakka.' },
  { hi: 'Mithu ko mirchi pasand hai!', deva: 'मिट्ठू को मिर्ची पसंद है!', en: 'Mithu likes chillies!' },
];

/** How to fix the mistakes beginners meet most. */
export const ERROR_TIPS: Partial<Record<DiagnosticCode, Bilingual>> = {
  E0102: { hi: 'String ke ant mein quote band karo.', deva: 'स्ट्रिंग के अंत में उद्धरण चिह्न बंद करो।', en: 'Close the string with a quote.' },
  E0202: { hi: 'Shayad koi ; chhoot gaya hai.', deva: 'शायद कोई ; छूट गया है।', en: 'A ; is probably missing.' },
  E0203: { hi: 'Bracket ( ) { } ki jodi check karo.', deva: 'ब्रैकेट ( ) { } की जोड़ी जाँचो।', en: 'Check that ( ) and { } are paired.' },
  E0301: {
    hi: 'Naam ki spelling dekho, ya pehle rakho se banao.',
    deva: 'नाम की वर्तनी देखो, या पहले rakho से बनाओ।',
    en: 'Check the spelling, or declare it with rakho first.',
  },
  E0302: { hi: 'Yeh naam pehle se hai. Naya naam chuno.', deva: 'यह नाम पहले से है। नया नाम चुनो।', en: 'That name exists. Pick another.' },
  E0303: {
    hi: 'pakka badalta nahi. Badalna hai to rakho use karo.',
    deva: 'pakka बदलता नहीं। बदलना है तो rakho लगाओ।',
    en: 'A pakka cannot change. Use rakho instead.',
  },
  E0307: { hi: 'kaam ke arguments gin lo.', deva: 'kaam के आर्ग्युमेंट गिन लो।', en: 'Count the arguments the function takes.' },
  E0402: {
    hi: 'Recursion rukne ki condition check karo.',
    deva: 'रिकर्शन रुकने की शर्त जाँचो।',
    en: 'Check the condition that ends the recursion.',
  },
  E0405: {
    hi: 'Condition sach ya jhooth honi chahiye, jaise x > 0.',
    deva: 'शर्त sach या jhooth होनी चाहिए, जैसे x > 0।',
    en: 'A condition must be true or false, such as x > 0.',
  },
  E0408: {
    hi: 'Loop khatam nahi ho raha. Condition badalti hai?',
    deva: 'लूप खत्म नहीं हो रहा। क्या शर्त बदलती है?',
    en: 'The loop never ends. Does its condition change?',
  },
  E0410: {
    hi: 'Index 0 se lambai(x) - 1 tak hota hai.',
    deva: 'इंडेक्स 0 से lambai(x) - 1 तक होता है।',
    en: 'An index runs from 0 to lambai(x) - 1.',
  },
};

const OTHER_ERROR: Bilingual = {
  hi: 'Output mein line aur ^ nishaan dekho.',
  deva: 'आउटपुट में लाइन और ^ निशान देखो।',
  en: 'Look at the line and the ^ mark in the output.',
};

const STOPPED_TIP: Bilingual = {
  hi: 'Dekho koi loop bina ruke to nahi chal raha.',
  deva: 'देखो, कोई लूप बिना रुके तो नहीं चल रहा।',
  en: 'Check for a loop that never ends.',
};

/** The tip shown under Mithu's reaction; `turn` rotates the general ones. */
export function advise(status: Status, code: DiagnosticCode | undefined, turn: number) {
  switch (status) {
    case 'running':
      return null;
    case 'compile-error':
    case 'runtime-error':
      return (code && ERROR_TIPS[code]) || OTHER_ERROR;
    case 'stopped':
      return STOPPED_TIP;
    case 'idle':
    case 'ok':
      return TIPS[turn % TIPS.length] ?? null;
  }
}

export const GREETING: Bilingual = {
  hi: 'Namaste! Main Mithu hoon. Mujhe click karo.',
  deva: 'नमस्ते! मैं मिट्ठू हूँ। मुझे क्लिक करो।',
  en: 'Hello! I am Mithu. Click me.',
};
