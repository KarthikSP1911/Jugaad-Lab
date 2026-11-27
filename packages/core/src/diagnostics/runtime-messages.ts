import type { DiagnosticDraft } from './diagnostic.js';

export const wrongOperandType = (op: string, types: string): DiagnosticDraft => ({
  code: 'E0401',
  message: {
    hi: `'${op}' in types par nahi chalta: ${types}`,
    deva: `'${op}' इन टाइप पर नहीं चलता: ${types}`,
    en: `'${op}' cannot be applied to ${types}`,
  },
});

export const callDepthExceeded = (): DiagnosticDraft => ({
  code: 'E0402',
  message: {
    hi: 'kaam ek doosre ko bahut gehrai tak bula rahe hain',
    deva: 'kaam एक-दूसरे को बहुत गहराई तक बुला रहे हैं',
    en: 'too many nested calls',
  },
  hint: {
    hi: 'recursion rukne ki condition dekhiye',
    deva: 'देखिए कि रिकर्शन कहाँ रुकता है',
    en: 'check where the recursion stops',
  },
});

export const divisionByZero = (op: string): DiagnosticDraft => ({
  code: 'E0403',
  message: {
    hi: `'${op}' mein zero se bhag nahi de sakte`,
    deva: `'${op}' में शून्य से भाग नहीं दे सकते`,
    en: `'${op}' by zero`,
  },
});

export const notCallable = (type: string): DiagnosticDraft => ({
  code: 'E0404',
  message: {
    hi: `${type} ko call nahi kar sakte`,
    deva: `${type} को कॉल नहीं कर सकते`,
    en: `a ${type} cannot be called`,
  },
});

export const booleanExpected = (type: string): DiagnosticDraft => ({
  code: 'E0405',
  message: {
    hi: `yahan bool chahiye tha, par ${type} mila`,
    deva: `यहाँ bool चाहिए था, पर ${type} मिला`,
    en: `expected a boolean, found ${type}`,
  },
});

export const usedBeforeValue = (name: string): DiagnosticDraft => ({
  code: 'E0406',
  message: {
    hi: `'${name}' ko abhi value nahi mili`,
    deva: `'${name}' को अभी मान नहीं मिला`,
    en: `'${name}' is used before it has a value`,
  },
});

export const wrongArity = (name: string, expected: number, actual: number): DiagnosticDraft => ({
  code: 'E0407',
  message: {
    hi: `'${name}' ko ${expected} argument chahiye, ${actual} mile`,
    deva: `'${name}' को ${expected} आर्ग्युमेंट चाहिए, ${actual} मिले`,
    en: `'${name}' expects ${expected} argument(s), got ${actual}`,
  },
});

export const stepLimitExceeded = (limit: number): DiagnosticDraft => ({
  code: 'E0408',
  message: {
    hi: `program ${limit} steps se aage chala gaya`,
    deva: `प्रोग्राम ${limit} स्टेप से आगे चला गया`,
    en: `the program ran for more than ${limit} steps`,
  },
});

export const stringTooLong = (): DiagnosticDraft => ({
  code: 'E0409',
  message: {
    hi: 'string had se zyada lambi ho gayi',
    deva: 'स्ट्रिंग हद से ज़्यादा लंबी हो गई',
    en: 'the string grew too long',
  },
});

export const indexOutOfRange = (index: number, length: number): DiagnosticDraft => ({
  code: 'E0410',
  message: {
    hi: `index ${index} range ke bahar hai (lambai ${length})`,
    deva: `इंडेक्स ${index} सीमा के बाहर है (लंबाई ${length})`,
    en: `index ${index} is out of range for length ${length}`,
  },
});

export const wrongIndexType = (
  container: string,
  expected: string,
  found: string,
): DiagnosticDraft => ({
  code: 'E0411',
  message: {
    hi: `${container} ka index ${expected} hona chahiye, ${found} mila`,
    deva: `${container} का इंडेक्स ${expected.replace('whole', 'पूर्ण')} होना चाहिए, ${found} मिला`,
    en: `a ${container} index must be a ${expected}, found ${found}`,
  },
});

export const notIndexable = (type: string): DiagnosticDraft => ({
  code: 'E0412',
  message: {
    hi: `${type} mein index nahi lagta`,
    deva: `${type} में इंडेक्स नहीं लगता`,
    en: `a ${type} cannot be indexed`,
  },
});

export const stringReadOnly = (): DiagnosticDraft => ({
  code: 'E0413',
  message: {
    hi: 'string ke akshar badal nahi sakte',
    deva: 'स्ट्रिंग के अक्षर बदले नहीं जा सकते',
    en: 'strings are read-only',
  },
});

export const emptyList = (name: string): DiagnosticDraft => ({
  code: 'E0414',
  message: {
    hi: `'${name}' ke liye soochi khaali hai`,
    deva: `'${name}' के लिए सूची खाली है`,
    en: `'${name}' needs a non-empty list`,
  },
});

export const invalidNumber = (text: string): DiagnosticDraft => {
  const shown = JSON.stringify(text.length > 40 ? `${text.slice(0, 40)}...` : text);
  return {
    code: 'E0415',
    message: {
      hi: `${shown} se sankhya nahi banti`,
      deva: `${shown} से संख्या नहीं बनती`,
      en: `${shown} is not a valid number`,
    },
    hint: { hi: 'jaise "-3.5" likhiye', deva: 'जैसे "-3.5" लिखिए', en: 'write it like "-3.5"' },
  };
};

export const wrongArgumentType = (
  name: string,
  expected: string,
  found: string,
): DiagnosticDraft => ({
  code: 'E0416',
  message: {
    hi: `'${name}' ko ${expected} chahiye, ${found} mila`,
    deva: `'${name}' को ${expected} चाहिए, ${found} मिला`,
    en: `'${name}' expects ${expected}, found ${found}`,
  },
});

/** The argument has the right type but a value the built-in cannot use. */
export const invalidArgument = (
  name: string,
  problem: { hi: string; en: string },
): DiagnosticDraft => ({
  code: 'E0417',
  message: { hi: `'${name}': ${problem.hi}`, en: `'${name}': ${problem.en}` },
});
