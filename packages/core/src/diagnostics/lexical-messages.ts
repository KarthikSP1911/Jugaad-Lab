import type { DiagnosticDraft } from './diagnostic.js';

export const unknownCharacter = (char: string): DiagnosticDraft => ({
  code: 'E0101',
  message: {
    hi: `'${char}' samajh nahi aaya`,
    en: `unexpected character '${char}'`,
  },
});

export const unterminatedString = (): DiagnosticDraft => ({
  code: 'E0102',
  message: {
    hi: 'string usi line par band nahi hua',
    en: 'string is not closed on the same line',
  },
});

export const invalidEscape = (char: string): DiagnosticDraft => ({
  code: 'E0103',
  message: { hi: `'\\${char}' koi escape nahi hai`, en: `unknown escape '\\${char}'` },
  hint: { hi: 'chalte hain: \\n \\t \\\\ \\" \\\'', en: 'valid escapes: \\n \\t \\\\ \\" \\\'' },
});

export const malformedNumber = (text: string): DiagnosticDraft => ({
  code: 'E0104',
  message: { hi: `'${text}' sahi sankhya nahi hai`, en: `'${text}' is not a valid number` },
});

export const unterminatedComment = (): DiagnosticDraft => ({
  code: 'E0105',
  message: { hi: "'/*' comment band nahi hua", en: "'/*' comment is never closed" },
});
