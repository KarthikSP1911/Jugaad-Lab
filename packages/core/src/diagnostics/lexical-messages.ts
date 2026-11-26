import type { DiagnosticDraft } from './diagnostic.js';

export const unknownCharacter = (char: string): DiagnosticDraft => ({
  code: 'E0101',
  message: {
    hi: `'${char}' samajh nahi aaya`,
    deva: `'${char}' समझ नहीं आया`,
    en: `unexpected character '${char}'`,
  },
});

export const unterminatedString = (): DiagnosticDraft => ({
  code: 'E0102',
  message: {
    hi: 'string usi line par band nahi hua',
    deva: 'स्ट्रिंग उसी लाइन पर बंद नहीं हुई',
    en: 'string is not closed on the same line',
  },
});

export const invalidEscape = (char: string): DiagnosticDraft => ({
  code: 'E0103',
  message: {
    hi: `'\\${char}' koi escape nahi hai`,
    deva: `'\\${char}' कोई एस्केप नहीं है`,
    en: `unknown escape '\\${char}'`,
  },
  hint: {
    hi: 'chalte hain: \\n \\t \\\\ \\" \\\'',
    deva: 'मान्य एस्केप: \\n \\t \\\\ \\" \\\'',
    en: 'valid escapes: \\n \\t \\\\ \\" \\\'',
  },
});

export const malformedNumber = (text: string): DiagnosticDraft => ({
  code: 'E0104',
  message: {
    hi: `'${text}' sahi sankhya nahi hai`,
    deva: `'${text}' सही संख्या नहीं है`,
    en: `'${text}' is not a valid number`,
  },
});

export const unterminatedComment = (): DiagnosticDraft => ({
  code: 'E0105',
  message: {
    hi: "'/*' comment band nahi hua",
    deva: "'/*' वाली टिप्पणी बंद नहीं हुई",
    en: "'/*' comment is never closed",
  },
});
