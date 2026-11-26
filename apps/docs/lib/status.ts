import type { Locale } from './i18n/locales';

interface Status {
  works: readonly string[];
  notYet: readonly string[];
}

/** What the language covers. Update when a release changes it. */
export const STATUS: Record<Locale, Status> = {
  en: {
    works: [
      'Variables, constants, conditions and loops',
      'Functions and closures',
      'Lists, dictionaries and indexing',
      'All built-ins, from bolo to prakar',
      'Command line, REPL and bilingual errors',
    ],
    notYet: [
      'Modules and classes',
      'For-each loops',
      'try / catch',
      'String interpolation',
      'Devanagari keywords',
    ],
  },
  hi: {
    works: [
      'वेरिएबल, स्थिरांक, शर्तें और लूप',
      'फ़ंक्शन और क्लोज़र',
      'सूचियाँ, शब्दकोश और इंडेक्सिंग',
      'सभी अंतर्निहित फ़ंक्शन, bolo से prakar तक',
      'कमांड लाइन, REPL और दो भाषाओं में त्रुटियाँ',
    ],
    notYet: [
      'मॉड्यूल और क्लास',
      'for-each लूप',
      'try / catch',
      'स्ट्रिंग इंटरपोलेशन',
      'देवनागरी कीवर्ड',
    ],
  },
};
