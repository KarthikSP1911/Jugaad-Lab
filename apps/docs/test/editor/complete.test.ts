import { describe, expect, it } from 'vitest';
import { complete } from '../../lib/editor/complete';
import { highlight } from '../../lib/editor/highlight';

/** `|` marks the cursor. */
function at(marked: string, explicit = false) {
  const cursor = marked.indexOf('|');
  const result = complete(marked.replace('|', ''), cursor, explicit);
  return result?.items.map((item) => item.label) ?? null;
}

describe('complete', () => {
  it('suggests keywords, built-ins and names from the program', () => {
    expect(at('rak|')).toContain('rakho');
    expect(at('bo|')).toEqual(['bolo']);
    expect(at('rakho total = 1;\nbolo(tot|);')).toEqual(['total']);
  });

  it('stays quiet for finished words, numbers and empty prefixes', () => {
    expect(at('rakho|')).toBeNull();
    expect(at('rakho x = 12ag|')).toBeNull();
    expect(at('rakho x = |')).toBeNull();
  });

  it('stays quiet inside strings and comments', () => {
    expect(at('bolo("ag|')).toBeNull();
    expect(at('bolo("ag|");')).toBeNull();
    expect(at('// ag|')).toBeNull();
    expect(at('/* ag|')).toBeNull();
    expect(at('bolo("a"); ag|')).toContain('agar');
  });

  it('offers everything on request', () => {
    expect(at('|', true)).toEqual(expect.arrayContaining(['agar', 'bolo']));
  });
});

describe('highlight kinds', () => {
  it('separates literals and built-ins from keywords', () => {
    const segments = highlight('agar (sach) { bolo(1); }');
    const find = (text: string) => segments.find((segment) => segment.text === text)?.kind;
    expect(find('agar')).toBe('keyword');
    expect(find('sach')).toBe('literal');
    expect(find('bolo')).toBe('builtin');
  });
});
