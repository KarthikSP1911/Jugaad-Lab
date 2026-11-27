import type { Locale } from '../i18n/locales';

export interface Example {
  id: string;
  title: string;
  summary: string;
  code: string;
  /** Lines that `suno` reads. */
  input?: string;
}

type ExampleList = readonly [Example, ...Example[]];

const EN: ExampleList = [
  {
    id: 'hello',
    title: 'Hello, duniya',
    summary:
      'Programs run from the top. There is no wrapper, and every statement ends with a semicolon.',
    code: `bolo("Namaste, duniya!");
`,
  },
  {
    id: 'variables',
    title: 'Variables and constants',
    summary: 'rakho declares a variable and pakka a constant.',
    code: `rakho naam = "Asha";
rakho umar = 25;
pakka PI = 3.14159;

umar += 1;
bolo(naam, umar, PI);
bolo("Namaste " + naam);
`,
  },
  {
    id: 'conditions',
    title: 'Conditions',
    summary: 'agar and warna choose a branch. A condition must be sach or jhooth.',
    code: `rakho marks = 82;

agar (marks >= 90) {
    bolo("A");
} warna agar (marks >= 75) {
    bolo("B");
} warna {
    bolo("C");
}
`,
  },
  {
    id: 'loops',
    title: 'Loops',
    summary:
      'jabtak repeats while a condition holds; chalo counts. ruko breaks and agla continues.',
    code: `rakho i = 1;
jabtak (i <= 5) {
    agar (i == 4) { ruko; }
    bolo(i);
    i += 1;
}

chalo (rakho j = 0; j < 3; j += 1) {
    agar (j == 1) { agla; }
    bolo("j =", j);
}
`,
  },
  {
    id: 'functions',
    title: 'Functions and closures',
    summary:
      'kaam defines a function and wapas returns from it. Functions remember where they were defined.',
    code: `kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n-1);
}
bolo(factorial(5));

kaam counter() {
    rakho c = 0;
    wapas kaam () { c += 1; wapas c; };
}
rakho gino = counter();
gino();
bolo(gino());
`,
  },
  {
    id: 'collections',
    title: 'Lists and dictionaries',
    summary: 'Lists keep values in order; dictionaries look them up by a string key.',
    code: `rakho fal = ["aam", "kela", 1 + 2];
fal[0] = "seb";
joro(fal, "angoor");
bolo(lambai(fal), fal[1]);

rakho chhatra = { "naam": "Ravi", "shehar": "Pune" };
chhatra["umar"] = 21;
bolo(chhatra["naam"], lambai(chhatra));
`,
  },
  {
    id: 'input',
    title: 'Input',
    summary: 'suno reads one line. In the playground it takes lines from the input box.',
    code: `rakho naam = suno("Aapka naam? ");
rakho saal = sankhya(suno("Janm ka saal? "));
bolo("Namaste " + naam + ", umar kareeb", 2026 - saal);
`,
    input: 'Asha\n2001',
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    summary: 'The classic, in Hinglish.',
    code: `chalo (rakho n = 1; n <= 15; n += 1) {
    agar (n % 15 == 0)      { bolo("FizzBuzz"); }
    warna agar (n % 3 == 0) { bolo("Fizz"); }
    warna agar (n % 5 == 0) { bolo("Buzz"); }
    warna                   { bolo(n); }
}
`,
  },
  {
    id: 'errors',
    title: 'Helpful errors',
    summary:
      'Mistakes are reported with a code, a position and a message. This program has one on purpose.',
    code: `rakho total = 10;
bolo(totl);
`,
  },
];

/** Hindi titles and summaries, with the string literals that change. */
const HINDI: Record<string, { title: string; summary: string; text: [string, string][] }> = {
  hello: {
    title: 'नमस्ते, दुनिया',
    summary: 'प्रोग्राम ऊपर से चलते हैं। कोई बाहरी ढाँचा नहीं होता, और हर स्टेटमेंट सेमीकोलन पर खत्म होता है।',
    text: [['Namaste, duniya!', 'नमस्ते, दुनिया!']],
  },
  variables: {
    title: 'वेरिएबल और स्थिरांक',
    summary: 'rakho से वेरिएबल और pakka से स्थिरांक बनता है।',
    text: [
      ['"Asha"', '"आशा"'],
      ['"Namaste "', '"नमस्ते "'],
    ],
  },
  conditions: {
    title: 'शर्तें',
    summary: 'agar और warna शाखा चुनते हैं। शर्त sach या jhooth होनी चाहिए।',
    text: [
      ['"A"', '"अ"'],
      ['"B"', '"ब"'],
      ['"C"', '"स"'],
    ],
  },
  loops: {
    title: 'लूप',
    summary:
      'jabtak शर्त सच रहने तक दोहराता है; chalo गिनता है। ruko लूप तोड़ता है और agla अगले चक्कर पर जाता है।',
    text: [],
  },
  functions: {
    title: 'फ़ंक्शन और क्लोज़र',
    summary: 'kaam फ़ंक्शन बनाता है और wapas उससे लौटता है। फ़ंक्शन याद रखते हैं कि वे कहाँ बने थे।',
    text: [],
  },
  collections: {
    title: 'सूचियाँ और शब्दकोश',
    summary: 'सूची मानों को क्रम में रखती है; शब्दकोश उन्हें स्ट्रिंग कुंजी से खोजता है।',
    text: [
      ['"aam", "kela"', '"आम", "केला"'],
      ['"seb"', '"सेब"'],
      ['"angoor"', '"अंगूर"'],
      ['"Ravi"', '"रवि"'],
      ['"Pune"', '"पुणे"'],
    ],
  },
  input: {
    title: 'इनपुट',
    summary: 'suno एक लाइन पढ़ता है। प्लेग्राउंड में वह इनपुट बॉक्स से लाइनें लेता है।',
    text: [
      ['"Aapka naam? "', '"आपका नाम? "'],
      ['"Janm ka saal? "', '"जन्म का साल? "'],
      ['"Namaste "', '"नमस्ते "'],
      ['", umar kareeb"', '", उम्र करीब"'],
    ],
  },
  fizzbuzz: {
    title: 'FizzBuzz',
    summary: 'पुराना जाना-माना सवाल, Hinglish में।',
    text: [],
  },
  errors: {
    title: 'मददगार त्रुटियाँ',
    summary: 'गलतियाँ कोड, जगह और संदेश के साथ बताई जाती हैं। इस प्रोग्राम में जान-बूझकर एक गलती है।',
    text: [],
  },
};

const INPUTS: Record<string, string> = { input: 'आशा\n2001' };

function inHindi(example: Example): Example {
  const found = HINDI[example.id];
  if (!found) return example;
  const { title, summary, text } = found;
  const code = text.reduce((result, [from, to]) => result.replaceAll(from, to), example.code);
  const input = INPUTS[example.id] ?? example.input;
  return { ...example, title, summary, code, ...(input ? { input } : {}) };
}

const [first, ...rest] = EN;

const EXAMPLES: Record<Locale, ExampleList> = {
  en: EN,
  hi: [inHindi(first), ...rest.map(inHindi)],
};

export const examples = (locale: Locale): ExampleList => EXAMPLES[locale];
