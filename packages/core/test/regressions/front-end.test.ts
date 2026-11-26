// One block per audited defect the front end covers, numbered as in CLAUDE.md.
import { describe, expect, it } from 'vitest';
import { check } from '../../src/check.js';
import { tokenize } from '../../src/lexer/lexer.js';
import { hinglish } from '../../src/packs/hinglish.js';
import { print } from '../ast-printer.js';

function tree(source: string): string {
  const { ast, diagnostics } = check(source);
  expect(diagnostics).toEqual([]);
  return (ast?.body ?? []).map(print).join(' ');
}

describe('defect 1: sign inside number token', () => {
  it('reads minus without spaces as an operator', () => {
    expect(tree('a-1;')).toBe('(- a 1)');
    expect(tree('fact(n-1);')).toBe('(call fact (- n 1))');
    expect(tree('0.1+0.2;')).toBe('(+ 0.1 0.2)');
  });
});

describe('defect 4: index assignment ignored', () => {
  it('keeps the index as the assignment target', () => {
    expect(tree('a[0] = 9;')).toBe('(= (index a 0) 9)');
  });
});

describe('defect 5: elements limited to primary expressions', () => {
  it('accepts full expressions in lists and dictionaries', () => {
    expect(tree('[1+2, f(x)];')).toBe('(list (+ 1 2) (call f x))');
    expect(tree('({a: 1+2});')).toBe('(dict a:(+ 1 2))');
  });
});

describe('defect 6: no string escapes', () => {
  it('decodes every escape', () => {
    const [token] = tokenize(String.raw`"a\"b\n\t\\\'"`).tokens;
    expect(token?.value).toBe('a"b\n\t\\\'');
  });
});

describe('defect 9: errors without line and column', () => {
  it('locates a diagnostic', () => {
    const [diagnostic] = check('rakho a = 1;\nrakho b = ;', { file: 'x.hing' }).diagnostics;
    expect(diagnostic).toMatchObject({ file: 'x.hing', span: { line: 2, column: 11 } });
  });
});

describe('defect 10: keywords broken by extra whitespace', () => {
  it('allows any whitespace between "warna" and "agar"', () => {
    expect(tree('agar (a) b; warna  \n\t /* c */ agar (c) d;')).toBe('(if a b (if c d))');
  });
});

describe('defect 11: quadratic tokenizing', () => {
  it('tokenizes a large file quickly', () => {
    const source = 'rakho naam = "x" + 1;\n'.repeat(100_000);
    // A scan that re-slices the rest of this 2 MB source takes far longer.
    expect(tokenize(source).tokens).toHaveLength(700_001);
  }, 5_000);
});

describe('defect 13: global singletons', () => {
  it('shares no state between runs', () => {
    expect(check('+;').diagnostics).toHaveLength(1);
    expect(check('a;').diagnostics).toEqual([]);
    expect(check('+;').diagnostics).toHaveLength(1);
  });
});

describe('defect 16: no chained calls', () => {
  it('chains calls and indexes', () => {
    expect(tree('f(x)[0](y)();')).toBe('(call (call (index (call f x) 0) y))');
  });
});

describe('defect 20: non-ASCII keywords never matched', () => {
  it('matches Devanagari keywords and names', () => {
    const pack = new Map([...hinglish, ['रखो', 'Var'] as const]);
    const { tokens, diagnostics } = tokenize('रखो गिनती = 1;', { pack });
    expect(diagnostics).toEqual([]);
    expect(tokens.map((t) => t.kind).slice(0, 2)).toEqual(['Var', 'Identifier']);
    expect(tokens[1]?.lexeme).toBe('गिनती');
  });
});
