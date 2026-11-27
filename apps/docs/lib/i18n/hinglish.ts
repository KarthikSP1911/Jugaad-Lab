import type { DocsStrings } from './strings';

/** Hindi in Roman script, the way the keywords and error messages are written. */
export const hinglish: DocsStrings = {
  sidebar: 'Docs',
  nav: {
    start: 'Shuruaat',
    tour: 'Bhasha ki sair',
    cheatsheet: 'Cheatsheet',
    reference: 'Poori jaankari',
    errors: 'Error codes',
  },
  pager: { previous: '← Pichhla', next: 'Agla →' },
  start: {
    intro:
      'Ek chhoti programming language jiske keywords Roman Hindi mein hain. Yeh TypeScript mein bana ek tree-walking interpreter hai.',
    notice:
      'Yeh version 0.1.0 hai. Naam, `.hing` extension aur keywords ki spelling abhi badal sakti hai.',
    firstProgram: 'Aapka pehla program',
    tryIt: {
      before: '',
      link: 'Playground',
      after: ' kholiye, upar wali line likhiye aur Run dabaiye.',
    },
    runLocal: 'Apne computer par chalaiye',
    needs: 'Aapko Node 24 aur Git chahiye.',
    nextSteps: 'Aage kya padhein',
    next: {
      tour: 'chhote examples jo aap chala sakte hain.',
      cheatsheet: 'saare keywords aur built-ins ek page par.',
      reference: 'keywords, types, operators aur grammar.',
      errors: 'har code ka matlab.',
    },
  },
  tour: {
    intro:
      'Chhote examples, unke output ke saath. Inmein se koi bhi playground mein chalaiye aur badaliye.',
    output: 'Output',
    open: 'Playground mein kholiye →',
  },
  cheatsheet: {
    intro: 'Jo kuch chahiye, sab ek page par.',
    shapes: 'Statements ek nazar mein',
    keywords: 'Keywords',
    keyword: 'Keyword',
    meaning: 'Matlab',
    aliases: 'Yeh spelling bhi chalti hai',
    builtins: 'Built-in functions',
    function: 'Function',
    does: 'Kya karta hai',
  },
  reference: {
    notice: 'Naam, file extension, command aur keywords ki spelling abhi badal sakti hai.',
  },
  errors: {
    intro:
      'Errors Hinglish mein likhe jaate hain. Har error apna code, file, line aur column batata hai, aur galti ki jagah par nishaan lagata hai. Is program ke liye:',
    error: 'Error',
    fix: 'Playground mein theek kijiye →',
    all: 'Saare codes',
    exitCodes: 'Command line ke exit codes: 0 sab theek, 65 compile errors, 70 runtime error.',
    table: {
      filter: 'Code ya shabd se dhoondhiye',
      filterLabel: 'Error codes dhoondhiye',
      stages: {
        all: 'Sab',
        lexical: 'Lexical',
        syntax: 'Syntax',
        semantic: 'Semantic',
        runtime: 'Runtime',
      },
      code: 'Code',
      hinglish: 'Hinglish',
      english: 'English',
      count: '{total} mein se {shown} codes',
    },
  },
  keywords: {
    Var: 'variable banaiye',
    Const: 'constant banaiye (badal nahi sakta)',
    Function: 'function banaiye',
    Return: 'function se value wapas bhejiye',
    If: 'agar (if)',
    Else: 'warna (else)',
    True: 'sach (true)',
    False: 'jhooth (false)',
    Null: 'kuch nahi (null)',
    While: 'jab tak shart sach hai, dohraiye',
    For: 'ginti wala loop',
    Break: 'loop se bahar niklo',
    Continue: 'agle round par jaao',
    AndAnd: 'aur (&&)',
    OrOr: 'ya (||)',
    Bang: 'nahi (!)',
  },
  builtins: {
    'bolo(a, b, ...)': 'values print kijiye, phir nayi line',
    'suno(prompt)': 'prompt dikhaiye aur ek line padhiye',
    'lambai(x)': 'string, list ya dictionary ki lambai',
    'joro(list, x)': 'list ke aakhir mein x jodiye',
    'nikalo(list)': 'aakhri item nikaal kar wapas deta hai',
    'sankhya(x)': 'string ko number banaiye',
    'shabd(x)': 'kisi bhi value ko string banaiye',
    'prakar(x)': 'x ka type ka naam',
    'mod(x)': 'bina minus wali value (absolute)',
    'vargmool(x)': 'square root',
    'ghaat(a, b)': 'a ki b ghaat (power)',
    'gol(x)': 'sabse paas wale poore number tak gol kijiye',
    'neeche(x)': 'neeche ki taraf gol kijiye',
    'upar(x)': 'upar ki taraf gol kijiye',
    'adhiktam(a, b, ...)': 'sabse bada number (ya ek list mein se)',
    'nyuntam(a, b, ...)': 'sabse chhota number (ya ek list mein se)',
    'kismat(a, b)': 'a se b tak koi bhi poora number (random)',
    'todo(text, sep)': 'string ko tod kar list banaiye',
    'milao(list, sep)': 'list ko jod kar string banaiye',
    'bade(text)': 'bade akshar (upper case)',
    'chhote(text)': 'chhote akshar (lower case)',
    'saaf(text)': 'dono taraf ki khaali jagah hataiye',
    'badlo(text, old, new)': 'har old ko new se badaliye',
    'hai(x, item)': 'kya list, string ya dictionary mein item hai?',
    'kahan(x, item)': 'item ki jagah (index), ya -1',
    'kaato(x, start, end)': 'list ya string ka ek hissa',
    'ulta(x)': 'ulti list ya string',
    'chhanto(list)': 'list ki sorted copy',
    'har(list, f)': 'har item par f chala kar nayi list',
    'chuno(list, f)': 'woh items jinke liye f(item) sach hai',
    'daalo(list, i, x)': 'jagah i par x daaliye',
    'hatao(list, i)': 'jagah i wala item hata kar wapas deta hai',
    'chaabiyan(dict)': 'dictionary ki saari keys ki list',
  },
  examples: {
    hello: {
      title: 'Hello, duniya',
      summary:
        'Program upar se chalta hai. Koi wrapper nahi, aur har statement semicolon par khatam hota hai.',
    },
    variables: {
      title: 'Variables aur constants',
      summary: 'rakho se variable banta hai aur pakka se constant.',
    },
    conditions: {
      title: 'Shartein (conditions)',
      summary: 'agar aur warna raasta chunte hain. Shart sach ya jhooth honi chahiye.',
    },
    loops: {
      title: 'Loops',
      summary:
        'jabtak tab tak dohrata hai jab tak shart sach hai; chalo ginti karta hai. ruko loop todta hai aur agla agle round par jaata hai.',
    },
    functions: {
      title: 'Functions aur closures',
      summary:
        'kaam function banata hai aur wapas usse value lauta deta hai. Function yaad rakhte hain ki woh kahan bane the.',
    },
    collections: {
      title: 'Lists aur dictionaries',
      summary:
        'List values ko kram (order) mein rakhti hai; dictionary unhe string key se dhoondhti hai.',
    },
    input: {
      title: 'Input',
      summary: 'suno ek line padhta hai. Playground mein yeh input box se lines leta hai.',
    },
    fizzbuzz: { title: 'FizzBuzz', summary: 'Mashhoor sawaal, Hinglish mein.' },
    errors: {
      title: 'Madadgaar errors',
      summary:
        'Galtiyan code, jagah aur sandesh ke saath batayi jaati hain. Is program mein jaan-boojh kar ek galti hai.',
    },
  },
};
