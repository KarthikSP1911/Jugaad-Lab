import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8');

/** The colour variables declared in the block that follows a selector. */
function colours(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf('}', start));
  return new Map(
    [...block.matchAll(/--([\w-]+): (#[0-9a-f]{6});/g)].map((m) => [m[1] ?? '', m[2] ?? '']),
  );
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => {
    const value = parseInt(hex.slice(at, at + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [low = 0, high = 0] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

const THEMES = {
  light: colours(':root'),
  dark: colours(":root[data-theme='dark']"),
};
const BACKGROUNDS = ['page', 'surface', 'raised', 'code'];
const TEXT = ['ink', 'muted', 'brand', 'link', 'accent', 'error'];
const TOKENS = ['keyword', 'string', 'number', 'comment', 'call', 'literal', 'builtin'];

describe.each(Object.entries(THEMES))('%s theme', (_, theme) => {
  const ratio = (a: string, b: string) => contrast(theme.get(a) ?? '', theme.get(b) ?? '');

  it.each(BACKGROUNDS)('has AA text and highlighting on %s', (background) => {
    const names = [...TEXT, ...TOKENS.map((token) => `tok-${token}`)];
    expect(names.filter((name) => !(ratio(name, background) >= 4.5))).toEqual([]);
  });

  it.each(BACKGROUNDS)('outlines controls at 3:1 on %s', (background) => {
    expect(ratio('control', background)).toBeGreaterThanOrEqual(3);
  });

  it('keeps primary button text readable', () => {
    expect(
      ratio('button-ink', 'button') || contrast('#1a1203', theme.get('button') ?? ''),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

it('gives the system dark theme the same colours as the toggle', () => {
  expect(colours(":root:not([data-theme='light'])")).toEqual(THEMES.dark);
});
