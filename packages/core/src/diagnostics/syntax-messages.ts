import type { DiagnosticDraft } from './diagnostic.js';

// `found` is the offending lexeme, empty at the end of the file.
const quoted = (found: string) =>
  found === ''
    ? { hi: 'file khatam ho gayi', deva: 'फ़ाइल खत्म हो गई', en: 'the end of the file' }
    : { hi: `'${found}' mila`, deva: `'${found}' मिला`, en: `'${found}'` };

export const expectedExpression = (found: string): DiagnosticDraft => ({
  code: 'E0201',
  message: {
    hi: `yahan expression chahiye tha, par ${quoted(found).hi}`,
    deva: `यहाँ एक्सप्रेशन चाहिए था, पर ${quoted(found).deva}`,
    en: `expected an expression, found ${quoted(found).en}`,
  },
});

export const expectedSemicolon = (): DiagnosticDraft => ({
  code: 'E0202',
  message: {
    hi: "statement ke baad ';' lagana hai",
    deva: "स्टेटमेंट के बाद ';' लगाना है",
    en: "expected ';' after the statement",
  },
});

export const expectedSymbol = (symbol: string, found: string): DiagnosticDraft => ({
  code: 'E0203',
  message: {
    hi: `'${symbol}' chahiye tha, par ${quoted(found).hi}`,
    deva: `'${symbol}' चाहिए था, पर ${quoted(found).deva}`,
    en: `expected '${symbol}', found ${quoted(found).en}`,
  },
});

export const expectedName = (found: string): DiagnosticDraft => ({
  code: 'E0204',
  message: {
    hi: `yahan naam chahiye tha, par ${quoted(found).hi}`,
    deva: `यहाँ नाम चाहिए था, पर ${quoted(found).deva}`,
    en: `expected a name, found ${quoted(found).en}`,
  },
});

export const invalidTarget = (): DiagnosticDraft => ({
  code: 'E0205',
  message: {
    hi: 'sirf variable ya index ko value de sakte hain',
    deva: 'सिर्फ़ वेरिएबल या इंडेक्स को मान दे सकते हैं',
    en: 'only a variable or an index can be assigned to',
  },
});

export const constantWithoutValue = (keyword: string, name: string): DiagnosticDraft => ({
  code: 'E0206',
  message: {
    hi: `'${keyword} ${name}' ko shuru mein value chahiye`,
    deva: `'${keyword} ${name}' को शुरू में मान चाहिए`,
    en: `constant '${name}' needs an initial value`,
  },
});

export const declarationNotAllowed = (keyword: string): DiagnosticDraft => ({
  code: 'E0207',
  message: {
    hi: `'${keyword}' declaration yahan nahi aa sakta`,
    deva: `'${keyword}' घोषणा यहाँ नहीं आ सकती`,
    en: `a '${keyword}' declaration is not allowed here`,
  },
  hint: {
    hi: 'ise { } block ke andar rakhiye',
    deva: 'इसे { } ब्लॉक के अंदर रखिए',
    en: 'put it inside a { } block',
  },
});

export const expectedKey = (found: string): DiagnosticDraft => ({
  code: 'E0208',
  message: {
    hi: `kosh ki key string ya naam honi chahiye, par ${quoted(found).hi}`,
    deva: `kosh की कुंजी स्ट्रिंग या नाम होनी चाहिए, पर ${quoted(found).deva}`,
    en: `a dictionary key must be a string or a name, found ${quoted(found).en}`,
  },
});

export const nestedTooDeeply = (limit: number): DiagnosticDraft => ({
  code: 'E0209',
  message: {
    hi: `code ${limit} se zyada level gehra hai`,
    deva: `कोड ${limit} से ज़्यादा स्तर गहरा है`,
    en: `code is nested more than ${limit} levels deep`,
  },
});
