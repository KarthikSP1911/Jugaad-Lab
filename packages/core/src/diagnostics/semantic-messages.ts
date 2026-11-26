import type { DiagnosticDraft } from './diagnostic.js';

export const undefinedName = (name: string, suggestion?: string): DiagnosticDraft => ({
  code: 'E0301',
  message: { hi: `'${name}' declare nahi hua`, en: `undefined variable '${name}'` },
  ...(suggestion === undefined
    ? {}
    : {
        hint: {
          hi: `kya aapka matlab '${suggestion}' tha?`,
          en: `did you mean '${suggestion}'?`,
        },
      }),
});

export const duplicateName = (name: string): DiagnosticDraft => ({
  code: 'E0302',
  message: {
    hi: `'${name}' is scope mein pehle se hai`,
    en: `'${name}' is already declared in this scope`,
  },
});

export const assignToConstant = (name: string): DiagnosticDraft => ({
  code: 'E0303',
  message: {
    hi: `'${name}' constant hai, badal nahi sakte`,
    en: `cannot assign to constant '${name}'`,
  },
});

export const usedInOwnInitialiser = (name: string): DiagnosticDraft => ({
  code: 'E0304',
  message: {
    hi: `'${name}' apni hi shuruaati value mein nahi aa sakta`,
    en: `'${name}' is used in its own initialiser`,
  },
});

export const outsideLoop = (keyword: string): DiagnosticDraft => ({
  code: 'E0305',
  message: {
    hi: `'${keyword}' sirf loop ke andar chalta hai`,
    en: `'${keyword}' is only allowed inside a loop`,
  },
});

export const outsideFunction = (keyword: string): DiagnosticDraft => ({
  code: 'E0306',
  message: {
    hi: `'${keyword}' sirf kaam ke andar chalta hai`,
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
    en: `'${name}' expects ${expected} argument(s), got ${actual}`,
  },
});
