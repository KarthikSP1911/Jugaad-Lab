import { readFileSync } from 'node:fs';
import { tokenize } from '@jugaad-hinglish/core';
import { describe, expect, it } from 'vitest';
import { examples } from '../../lib/content/examples';
import { execute } from '../../lib/playground/execute';
import { DICTIONARIES, switchLocale } from '../../lib/i18n';
import { headings } from '../../lib/content/markdown';

/** Every text in a dictionary, with its path. */
function texts(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  return Object.entries(value as object).flatMap(([key, item]) => texts(item, `${path}.${key}`));
}

describe('dictionaries', () => {
  it('have the same entries, with no Hindi text left empty', () => {
    const english = texts(DICTIONARIES.en);
    const hindi = texts(DICTIONARIES.hi);
    expect(hindi.map(([path]) => path)).toEqual(english.map(([path]) => path));
    // Hindi word order leaves this sentence nothing before its link.
    const empty = hindi.filter(([, text]) => text === '').map(([path]) => path);
    expect(empty).toEqual(['.start.openStart']);
  });
});

describe('switchLocale', () => {
  it('keeps the page', () => {
    expect(switchLocale('/en', 'hi')).toBe('/hi');
    expect(switchLocale('/en/docs/tour', 'hi')).toBe('/hi/docs/tour');
    expect(switchLocale('/hi/playground/', 'en')).toBe('/en/playground');
  });
});

describe('examples', () => {
  const english = examples('en');
  const hindi = examples('hi');
  const kinds = (code: string) => tokenize(code).tokens.map(({ kind }) => kind);
  const outcome = ({ code, input = '' }: (typeof english)[number]) =>
    execute(code, () => {}, { input }).outcome;

  it('are the same programs in both languages', () => {
    expect(hindi.map(({ id }) => id)).toEqual(english.map(({ id }) => id));
    hindi.forEach((example, index) => {
      const original = english[index] ?? english[0];
      expect(kinds(example.code)).toEqual(kinds(original.code));
      expect(outcome(example)).toBe(outcome(original));
      expect(example.title).not.toBe('');
    });
  });
});

/** Read directly: `readDoc` resolves paths from the app, not the repository root. */
const doc = (path: string) =>
  readFileSync(new URL(`../../../../docs/${path}`, import.meta.url), 'utf8');

describe('Hindi docs', () => {
  const blocks = (markdown: string) =>
    markdown.replaceAll('\r', '').match(/^```[\s\S]*?^```$/gm);

  it('match the English sections and code', () => {
    const english = doc('language-spec.md');
    const hindi = doc('hi/language-spec.md');
    expect(headings(hindi)).toHaveLength(headings(english).length);
    expect(blocks(hindi)).toEqual(blocks(english));
  });

  it('lists the same error codes', () => {
    const codes = (path: string) => doc(path).match(/^| Ed{4} /gm);
    expect(codes('hi/error-codes.md')).toEqual(codes('error-codes.md'));
  });

  it('keeps vowel signs in heading anchors', () => {
    expect(headings('## शब्द-स्तर के नियम\n')[0]?.id).toBe('शब्द-स्तर-के-नियम');
  });
});
