import type { Bilingual, DiagnosticCode } from '@jugaad-hinglish/core';
import type { Outcome } from '../playground/execute';
import type { SoundName } from './sound';

export type Status = 'idle' | 'running' | Outcome;

export type Mood = 'idle' | 'thinking' | 'happy' | 'worried';

/** How Mithu is drawn: his mood, unless he is speaking or has dozed off. */
export type Pose = Mood | 'talking' | 'sleeping';

type Lines = readonly [Bilingual, ...Bilingual[]];

/** The entry for this turn, going round the list. */
export function pick<T>(list: readonly [T, ...T[]], turn: number): T {
  return list[turn % list.length] ?? list[0];
}

export interface Reaction {
  mood: Mood;
  sound: SoundName | null;
  /** Said in turn, one for each run. */
  lines: Lines;
}

/** What Mithu does for each state of the playground. */
export const REACTIONS: Record<Status, Reaction> = {
  idle: {
    mood: 'idle',
    sound: null,
    lines: [
      {
        hi: 'Code likho aur Run dabao!',
        deva: 'कोड लिखो और “चलाएँ” दबाओ!',
        en: 'Write some code and press Run!',
      },
      {
        hi: 'Aaj kya banayenge?',
        deva: 'आज क्या बनाएँगे?',
        en: 'What shall we build today?',
      },
      {
        hi: 'Main taiyaar hoon. Run dabao!',
        deva: 'मैं तैयार हूँ। “चलाएँ” दबाओ!',
        en: 'I am ready. Press Run!',
      },
    ],
  },
  running: {
    mood: 'thinking',
    sound: null,
    lines: [
      {
        hi: 'Soch raha hoon…',
        deva: 'सोच रहा हूँ…',
        en: 'Thinking…',
      },
      {
        hi: 'Ek second, chala raha hoon…',
        deva: 'एक पल, चला रहा हूँ…',
        en: 'One moment, running it…',
      },
      {
        hi: 'Line dar line padh raha hoon…',
        deva: 'एक-एक लाइन पढ़ रहा हूँ…',
        en: 'Reading it line by line…',
      },
    ],
  },
  ok: {
    mood: 'happy',
    sound: 'success',
    lines: [
      {
        hi: 'Shabash! Program chal gaya.',
        deva: 'शाबाश! प्रोग्राम चल गया।',
        en: 'Well done! The program ran.',
      },
      {
        hi: 'Wah! Bilkul sahi chala.',
        deva: 'वाह! बिल्कुल सही चला।',
        en: 'Wow! It ran just right.',
      },
      {
        hi: 'Kamaal kar diya! Ab kuch naya try karo.',
        deva: 'कमाल कर दिया! अब कुछ नया आज़माओ।',
        en: 'Brilliant! Now try something new.',
      },
    ],
  },
  'compile-error': {
    mood: 'worried',
    sound: 'error',
    lines: [
      {
        hi: 'Arre! Code mein galti hai.',
        deva: 'अरे! कोड में गलती है।',
        en: 'Oh no! The code has a mistake.',
      },
      {
        hi: 'Zara ruko, likhne mein kuch chhoot gaya.',
        deva: 'ज़रा रुको, लिखने में कुछ छूट गया।',
        en: 'Hold on, something is miswritten.',
      },
      {
        hi: 'Koi baat nahi, saath mein theek karte hain.',
        deva: 'कोई बात नहीं, साथ में ठीक करते हैं।',
        en: 'No worries, let us fix it together.',
      },
    ],
  },
  'runtime-error': {
    mood: 'worried',
    sound: 'error',
    lines: [
      {
        hi: 'Oho! Chalte waqt gadbad hui.',
        deva: 'ओहो! चलते समय गड़बड़ हुई।',
        en: 'Oops! Something broke while running.',
      },
      {
        hi: 'Shuru to theek tha, beech mein atak gaya.',
        deva: 'शुरू तो ठीक था, बीच में अटक गया।',
        en: 'It started well, then got stuck.',
      },
      {
        hi: 'Galti se hi seekhte hain. Dobara dekho.',
        deva: 'गलती से ही सीखते हैं। दोबारा देखो।',
        en: 'Mistakes teach us. Look again.',
      },
    ],
  },
  stopped: {
    mood: 'worried',
    sound: 'stop',
    lines: [
      {
        hi: 'Ruk gaya. Phir se koshish karo.',
        deva: 'रुक गया। फिर से कोशिश करो।',
        en: 'It stopped. Try again.',
      },
      {
        hi: 'Bas, yahin rok diya.',
        deva: 'बस, यहीं रोक दिया।',
        en: 'That is it, stopped here.',
      },
    ],
  },
};

/** Said one after another when Mithu is clicked. */
export const TIPS: Lines = [
  {
    hi: 'Har line ke ant mein ; lagana.',
    deva: 'हर लाइन के अंत में ; लगाना।',
    en: 'End each statement with ;',
  },
  {
    hi: 'bolo() se kuch bhi chhapo.',
    deva: 'bolo() से कुछ भी छापो।',
    en: 'Print anything with bolo().',
  },
  {
    hi: 'Badalne wali value? rakho.',
    deva: 'बदलने वाला मान? rakho लगाओ।',
    en: 'A value that changes? Use rakho.',
  },
  {
    hi: 'Na badalne wali value? pakka.',
    deva: 'न बदलने वाला मान? pakka लगाओ।',
    en: 'A value that stays? Use pakka.',
  },
  {
    hi: 'Ek aur shart? warna agar likho.',
    deva: 'एक और शर्त? warna agar लिखो।',
    en: 'Another condition? Write warna agar.',
  },
  {
    hi: 'ruko loop todta hai, agla aage badhata hai.',
    deva: 'ruko लूप तोड़ता है, agla आगे बढ़ाता है।',
    en: 'ruko leaves a loop, agla skips ahead.',
  },
  {
    hi: 'joro(list, x) list mein jodta hai.',
    deva: 'joro(list, x) सूची में जोड़ता है।',
    en: 'joro(list, x) adds to a list.',
  },
  {
    hi: 'suno() se sawaal poochho.',
    deva: 'suno() से सवाल पूछो।',
    en: 'Ask a question with suno().',
  },
  {
    hi: 'sankhya() text ko number banata hai.',
    deva: 'sankhya() टेक्स्ट को संख्या बनाता है।',
    en: 'sankhya() turns text into a number.',
  },
  {
    hi: 'Mithu ko mirchi pasand hai!',
    deva: 'मिट्ठू को मिर्ची पसंद है!',
    en: 'Mithu likes chillies!',
  },
];

/** How to fix the mistakes beginners meet most. */
export const ERROR_TIPS: Partial<Record<DiagnosticCode, Bilingual>> = {
  E0102: {
    hi: 'String ke ant mein quote band karo.',
    deva: 'स्ट्रिंग के अंत में उद्धरण चिह्न बंद करो।',
    en: 'Close the string with a quote.',
  },
  E0202: {
    hi: 'Shayad koi ; chhoot gaya hai.',
    deva: 'शायद कोई ; छूट गया है।',
    en: 'A ; is probably missing.',
  },
  E0203: {
    hi: 'Bracket ( ) { } ki jodi check karo.',
    deva: 'ब्रैकेट ( ) { } की जोड़ी जाँचो।',
    en: 'Check that ( ) and { } are paired.',
  },
  E0301: {
    hi: 'Naam ki spelling dekho, ya pehle rakho se banao.',
    deva: 'नाम की वर्तनी देखो, या पहले rakho से बनाओ।',
    en: 'Check the spelling, or declare it with rakho first.',
  },
  E0302: {
    hi: 'Yeh naam pehle se hai. Naya naam chuno.',
    deva: 'यह नाम पहले से है। नया नाम चुनो।',
    en: 'That name exists. Pick another.',
  },
  E0303: {
    hi: 'pakka badalta nahi. Badalna hai to rakho use karo.',
    deva: 'pakka बदलता नहीं। बदलना है तो rakho लगाओ।',
    en: 'A pakka cannot change. Use rakho instead.',
  },
  E0307: {
    hi: 'kaam ke arguments gin lo.',
    deva: 'kaam के आर्ग्युमेंट गिन लो।',
    en: 'Count the arguments the function takes.',
  },
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
  E0101: {
    hi: 'Yeh nishaan bhasha mein nahi hai. Use hatao.',
    deva: 'यह चिह्न भाषा में नहीं है। इसे हटाओ।',
    en: 'The language has no such symbol. Remove it.',
  },
  E0201: {
    hi: 'Yahan koi value ya naam likhna tha.',
    deva: 'यहाँ कोई मान या नाम लिखना था।',
    en: 'A value or a name belongs here.',
  },
  E0204: {
    hi: 'Yahan ek naam likhna zaroori hai.',
    deva: 'यहाँ एक नाम लिखना ज़रूरी है।',
    en: 'A name is needed here.',
  },
  E0206: {
    hi: 'pakka ko shuru mein hi value do.',
    deva: 'pakka को शुरू में ही मान दो।',
    en: 'Give a pakka its value straight away.',
  },
  E0305: {
    hi: 'ruko aur agla sirf loop ke andar chalte hain.',
    deva: 'ruko और agla सिर्फ़ लूप के अंदर चलते हैं।',
    en: 'ruko and agla work only inside a loop.',
  },
  E0306: {
    hi: 'wapas sirf kaam ke andar likho.',
    deva: 'wapas सिर्फ़ kaam के अंदर लिखो।',
    en: 'Use wapas only inside a kaam.',
  },
  E0401: {
    hi: 'Value ka type dekho: prakar(x) batayega.',
    deva: 'मान का प्रकार देखो: prakar(x) बताएगा।',
    en: 'Check the type of the value with prakar(x).',
  },
  E0403: {
    hi: 'Zero se bhaag nahi hota. Pehle check karo.',
    deva: 'शून्य से भाग नहीं होता। पहले जाँचो।',
    en: 'You cannot divide by zero. Check first.',
  },
  E0404: {
    hi: '( ) sirf kaam ke baad lagta hai.',
    deva: '( ) सिर्फ़ kaam के बाद लगता है।',
    en: 'Only a kaam can be called with ( ).',
  },
  E0414: {
    hi: 'nikalo se pehle lambai dekho.',
    deva: 'nikalo से पहले lambai देखो।',
    en: 'Check lambai before using nikalo.',
  },
  E0415: {
    hi: 'sankhya ko sirf number jaisa text do.',
    deva: 'sankhya को सिर्फ़ संख्या जैसा टेक्स्ट दो।',
    en: 'Give sankhya text that looks like a number.',
  },
  E0416: {
    hi: 'Is kaam ko sahi type ki value do.',
    deva: 'इस काम को सही प्रकार का मान दो।',
    en: 'Pass the built-in a value of the right type.',
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
      return pick(TIPS, turn);
  }
}

export const GREETING: Bilingual = {
  hi: 'Namaste! Main Mithu hoon. Mujhe click karo.',
  deva: 'नमस्ते! मैं मिट्ठू हूँ। मुझे क्लिक करो।',
  en: 'Hello! I am Mithu. Click me.',
};
