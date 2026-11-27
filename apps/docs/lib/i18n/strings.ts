import { builtins, KEYWORD_MEANINGS } from '../reference';
import { hi } from './hi';
import { hinglish } from './hinglish';
import type { Locale } from './locales';

export type BuiltinName = ReturnType<typeof builtins>[number]['name'];
export type KeywordKind =
  | 'Var'
  | 'Const'
  | 'Function'
  | 'Return'
  | 'If'
  | 'Else'
  | 'True'
  | 'False'
  | 'Null'
  | 'While'
  | 'For'
  | 'Break'
  | 'Continue'
  | 'AndAnd'
  | 'OrOr'
  | 'Bang';
export type ExampleId =
  | 'hello'
  | 'variables'
  | 'conditions'
  | 'loops'
  | 'functions'
  | 'collections'
  | 'input'
  | 'fizzbuzz'
  | 'errors';

/** A sentence with a link in it: before, link text, after. */
export interface Linked {
  before: string;
  link: string;
  after: string;
}

/**
 * Everything the docs pages say. Text in `backticks` is shown as code.
 * Code examples, keywords and built-in names are never translated.
 */
export interface DocsStrings {
  sidebar: string;
  nav: { start: string; tour: string; cheatsheet: string; reference: string; errors: string };
  pager: { previous: string; next: string };
  start: {
    intro: string;
    notice: string;
    firstProgram: string;
    tryIt: Linked;
    runLocal: string;
    needs: string;
    nextSteps: string;
    next: { tour: string; cheatsheet: string; reference: string; errors: string };
  };
  tour: { intro: string; output: string; open: string };
  cheatsheet: {
    intro: string;
    shapes: string;
    keywords: string;
    keyword: string;
    meaning: string;
    aliases: string;
    builtins: string;
    function: string;
    does: string;
  };
  reference: { notice: string };
  errors: {
    intro: string;
    error: string;
    fix: string;
    all: string;
    exitCodes: string;
    table: ErrorTableStrings;
  };
  keywords: Record<KeywordKind, string>;
  builtins: Record<BuiltinName, string>;
  examples: Record<ExampleId, { title: string; summary: string }>;
  /** Devanagari titles for each error code; only the Hindi docs have them. */
  errorTitles?: Record<string, string>;
}

/** Passed to the client-side error table, so plain strings only. */
export interface ErrorTableStrings {
  filter: string;
  filterLabel: string;
  stages: { all: string; lexical: string; syntax: string; semantic: string; runtime: string };
  code: string;
  /** Header of the extra Devanagari column, when there is one. */
  local?: string;
  hinglish: string;
  english: string;
  /** `{shown}` and `{total}` are filled in. */
  count: string;
}

const en: DocsStrings = {
  sidebar: 'Documentation',
  nav: {
    start: 'Getting started',
    tour: 'Language tour',
    cheatsheet: 'Cheatsheet',
    reference: 'Reference',
    errors: 'Error codes',
  },
  pager: { previous: '← Previous', next: 'Next →' },
  start: {
    intro:
      'A small programming language with Roman-script Hindi keywords. It is a TypeScript tree-walking interpreter.',
    notice:
      'This is version 0.1.0. The name, the `.hing` extension and the keyword spellings may still change.',
    firstProgram: 'Your first program',
    tryIt: { before: 'Open the ', link: 'playground', after: ', type the line above and press Run.' },
    runLocal: 'Run it on your computer',
    needs: 'You need Node 24 and Git.',
    nextSteps: 'Next steps',
    next: {
      tour: 'short examples you can run.',
      cheatsheet: 'keywords and built-ins on one page.',
      reference: 'keywords, types, operators and grammar.',
      errors: 'what each code means.',
    },
  },
  tour: {
    intro: 'Short examples with their output. Run and change any of them in the playground.',
    output: 'Output',
    open: 'Open in playground →',
  },
  cheatsheet: {
    intro: 'Everything you need on one page.',
    shapes: 'Statements at a glance',
    keywords: 'Keywords',
    keyword: 'Keyword',
    meaning: 'Meaning',
    aliases: 'Also accepted',
    builtins: 'Built-in functions',
    function: 'Function',
    does: 'What it does',
  },
  reference: { notice: 'The name, file extension, command and keyword spellings may still change.' },
  errors: {
    intro:
      'Errors are written in Hinglish. Each one shows its code, the file, line and column, and points at the mistake. For this program:',
    error: 'Error',
    fix: 'Fix it in the playground →',
    all: 'All codes',
    exitCodes: 'Command line exit codes: 0 ok, 65 compile errors, 70 runtime error.',
    table: {
      filter: 'Filter by code or words',
      filterLabel: 'Filter error codes',
      stages: {
        all: 'All',
        lexical: 'Lexical',
        syntax: 'Syntax',
        semantic: 'Semantic',
        runtime: 'Runtime',
      },
      code: 'Code',
      hinglish: 'Hinglish',
      english: 'English',
      count: '{shown} of {total} codes',
    },
  },
  keywords: KEYWORD_MEANINGS.en as Record<KeywordKind, string>,
  builtins: Object.fromEntries(builtins('en').map(({ name, does }) => [name, does])) as Record<
    BuiltinName,
    string
  >,
  examples: {
    hello: {
      title: 'Hello, duniya',
      summary:
        'Programs run from the top. There is no wrapper, and every statement ends with a semicolon.',
    },
    variables: {
      title: 'Variables and constants',
      summary: 'rakho declares a variable and pakka a constant.',
    },
    conditions: {
      title: 'Conditions',
      summary: 'agar and warna choose a branch. A condition must be sach or jhooth.',
    },
    loops: {
      title: 'Loops',
      summary:
        'jabtak repeats while a condition holds; chalo counts. ruko breaks and agla continues.',
    },
    functions: {
      title: 'Functions and closures',
      summary:
        'kaam defines a function and wapas returns from it. Functions remember where they were defined.',
    },
    collections: {
      title: 'Lists and dictionaries',
      summary: 'Lists keep values in order; dictionaries look them up by a string key.',
    },
    input: {
      title: 'Input',
      summary: 'suno reads one line. In the playground it takes lines from the input box.',
    },
    fizzbuzz: { title: 'FizzBuzz', summary: 'The classic, in Hinglish.' },
    errors: {
      title: 'Helpful errors',
      summary:
        'Mistakes are reported with a code, a position and a message. This program has one on purpose.',
    },
  },
};

export const STRINGS: Record<Locale, DocsStrings> = { en, hinglish, hi };

/** The spec file shown on the reference page for each language. */
export const SPEC_FILE: Record<Locale, string> = {
  en: 'language-spec.md',
  hinglish: 'language-spec.hinglish.md',
  hi: 'language-spec.hi.md',
};
