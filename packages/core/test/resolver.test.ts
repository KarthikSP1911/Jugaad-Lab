import { describe, expect, it } from 'vitest';
import { check } from '../src/check.js';
import { MAX_TREE_DEPTH } from '../src/resolver/resolver.js';

const codes = (source: string) => check(source).diagnostics.map((d) => d.code);

describe('resolve', () => {
  it.each([
    ['bolo(totl);', 'E0301'],
    ['x = 1;', 'E0301'],
    ['bolo(x); rakho x = 1;', 'E0301'],
    ['{ rakho x = 1; } bolo(x);', 'E0301'],
    ['rakho a = 1; rakho a = 2;', 'E0302'],
    ['kaam f(a, a) {}', 'E0302'],
    ['kaam f(a) { rakho a = 1; }', 'E0302'],
    ['rakho f = 1; kaam f() {}', 'E0302'],
    ['pakka PI = 3; PI = 4;', 'E0303'],
    ['pakka n = 1; n += 1;', 'E0303'],
    ['bolo = 1;', 'E0303'],
    ['rakho x = x + 1;', 'E0304'],
    ['rakho x = 1; { rakho x = x + 1; }', 'E0304'],
    ['ruko;', 'E0305'],
    ['agla;', 'E0305'],
    ['jabtak (sach) { kaam f() { ruko; } }', 'E0305'],
    ['wapas 1;', 'E0306'],
    ['kaam jodo(a, b) {} jodo(1);', 'E0307'],
    ['f(); kaam f(a) {}', 'E0307'],
  ])('reports %j as %s', (source, code) => {
    expect(codes(source)).toEqual([code]);
  });

  it.each([
    'rakho a = 1; { rakho a = 2; }',
    'rakho bolo = 1;',
    'kaam a() { b(); } kaam b() { a(); }',
    'rakho f = kaam () { f(); };',
    'kaam f(n) { jabtak (sach) { ruko; } wapas f(n); }',
    // The arity of a reassigned function name is only known at run time.
    'kaam f(a) {} f = kaam () {}; f();',
  ])('accepts %j', (source) => {
    expect(codes(source)).toEqual([]);
  });

  it('suggests a close name', () => {
    const [diagnostic] = check('rakho total = 1; bolo(totl);').diagnostics;
    expect(diagnostic?.hint?.en).toContain("'total'");
  });

  it('rejects a tree too deep to walk instead of overflowing', () => {
    expect(codes(`bolo(1${' + 1'.repeat(MAX_TREE_DEPTH * 50)});`)).toEqual(['E0209']);
  });
});
