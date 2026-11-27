import { hinglish } from '@jugaad-hinglish/core';
import { describe, expect, it } from 'vitest';
import { DEMO_IDS, DEMOS, KEYWORD_PAIRS } from '../../lib/content/home';
import { LOCALES } from '../../lib/i18n/locales';
import { execute } from '../../lib/playground/execute';

function outputOf(source: string) {
  let output = '';
  const { outcome } = execute(source, (text) => (output += text));
  return { outcome, output };
}

describe.each(LOCALES)('home page examples in %s', (locale) => {
  it.each(DEMO_IDS)('%s runs and prints something', (id) => {
    const { outcome, output } = outputOf(DEMOS[locale][id]);
    expect(outcome).toBe('ok');
    expect(output).not.toBe('');
  });
});

it('starts with a one-line program', () => {
  expect(DEMOS.en.hello.trim().split('\n')).toHaveLength(1);
});

it('maps only words the language has', () => {
  const words = KEYWORD_PAIRS.map(([word]) => word).filter((word) => word !== 'bolo');
  expect(words.filter((word) => !hinglish.has(word))).toEqual([]);
});
