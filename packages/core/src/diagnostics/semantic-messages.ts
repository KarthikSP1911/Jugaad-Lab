import type { DiagnosticDraft } from './diagnostic.js';

export const undefinedName = (name: string, suggestion?: string): DiagnosticDraft => ({
  code: 'E0301',
  message: {
    hi: `'${name}' declare nahi hua`,
    deva: `'${name}' घोषित नहीं हुआ`,
    en: `undefined variable '${name}'`,
  },
  ...(suggestion === undefined
    ? {}
    : {
        hint: {
          hi: `kya aapka matlab '${suggestion}' tha?`,
          deva: `क्या आपका मतलब '${suggestion}' था?`,
          en: `did you mean '${suggestion}'?`,
        },
      }),
});

export const duplicateName = (name: string): DiagnosticDraft => ({
  code: 'E0302',
  message: {
    hi: `'${name}' is scope mein pehle se hai`,
    deva: `'${name}' इस स्कोप में पहले से है`,
    en: `'${name}' is already declared in this scope`,
  },
});

export const assignToConstant = (name: string): DiagnosticDraft => ({
  code: 'E0303',
  message: {
    hi: `'${name}' constant hai, badal nahi sakte`,
    deva: `'${name}' pakka है, इसे बदल नहीं सकते`,
    en: `cannot assign to constant '${name}'`,
  },
});

export const usedInOwnInitialiser = (name: string): DiagnosticDraft => ({
  code: 'E0304',
  message: {
    hi: `'${name}' apni hi shuruaati value mein nahi aa sakta`,
    deva: `'${name}' अपने ही शुरुआती मान में नहीं आ सकता`,
    en: `'${name}' is used in its own initialiser`,
  },
});

export const outsideLoop = (keyword: string): DiagnosticDraft => ({
  code: 'E0305',
  message: {
    hi: `'${keyword}' sirf loop ke andar chalta hai`,
    deva: `'${keyword}' सिर्फ़ लूप के अंदर चलता है`,
    en: `'${keyword}' is only allowed inside a loop`,
  },
});

export const outsideFunction = (keyword: string): DiagnosticDraft => ({
  code: 'E0306',
  message: {
    hi: `'${keyword}' sirf kaam ke andar chalta hai`,
    deva: `'${keyword}' सिर्फ़ kaam के अंदर चलता है`,
    en: `'${keyword}' is only allowed inside a function`,
  },
});

export const wrongArgumentCount = (
  name: string,
  expected: number,
  actual: number,
): DiagnosticDraft => ({
  code: 'E0307',
  message: {
    hi: `'${name}' ko ${expected} argument chahiye, ${actual} mile`,
    deva: `'${name}' को ${expected} आर्ग्युमेंट चाहिए, ${actual} मिले`,
    en: `'${name}' expects ${expected} argument(s), got ${actual}`,
  },
});
