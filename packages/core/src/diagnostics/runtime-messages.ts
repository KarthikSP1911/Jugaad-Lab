import type { DiagnosticDraft } from './diagnostic.js';

export const wrongOperandType = (op: string, types: string): DiagnosticDraft => ({
  code: 'E0401',
  message: {
    hi: `'${op}' in types par nahi chalta: ${types}`,
    en: `'${op}' cannot be applied to ${types}`,
  },
});

export const callDepthExceeded = (): DiagnosticDraft => ({
  code: 'E0402',
  message: {
    hi: 'kaam ek doosre ko bahut gehrai tak bula rahe hain',
    en: 'too many nested calls',
  },
  hint: { hi: 'recursion rukne ki condition dekhiye', en: 'check where the recursion stops' },
});

export const divisionByZero = (op: string): DiagnosticDraft => ({
  code: 'E0403',
  message: { hi: `'${op}' mein zero se bhag nahi de sakte`, en: `'${op}' by zero` },
});

export const notCallable = (type: string): DiagnosticDraft => ({
  code: 'E0404',
  message: { hi: `${type} ko call nahi kar sakte`, en: `a ${type} cannot be called` },
});

export const booleanExpected = (type: string): DiagnosticDraft => ({
  code: 'E0405',
  message: {
    hi: `yahan bool chahiye tha, par ${type} mila`,
    en: `expected a boolean, found ${type}`,
  },
});

export const usedBeforeValue = (name: string): DiagnosticDraft => ({
  code: 'E0406',
  message: {
    hi: `'${name}' ko abhi value nahi mili`,
    en: `'${name}' is used before it has a value`,
  },
});

export const wrongArity = (name: string, expected: number, actual: number): DiagnosticDraft => ({
  code: 'E0407',
  message: {
    hi: `'${name}' ko ${expected} argument chahiye, ${actual} mile`,
    en: `'${name}' expects ${expected} argument(s), got ${actual}`,
  },
});

export const stepLimitExceeded = (limit: number): DiagnosticDraft => ({
  code: 'E0408',
  message: {
    hi: `program ${limit} steps se aage chala gaya`,
    en: `the program ran for more than ${limit} steps`,
  },
});

export const stringTooLong = (): DiagnosticDraft => ({
  code: 'E0409',
  message: { hi: 'string had se zyada lambi ho gayi', en: 'the string grew too long' },
});
