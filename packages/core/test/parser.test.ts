import { describe, expect, it } from 'vitest';
import { MAX_NESTING } from '../src/parser/parser.js';
import { print } from './ast-printer.js';
import { syntax } from './syntax.js';

function tree(source: string): string {
  const { ast, diagnostics } = syntax(source);
  expect(diagnostics).toEqual([]);
  return (ast?.body ?? []).map(print).join(' ');
}

const codes = (source: string) => syntax(source).diagnostics.map((d) => d.code);

describe('parse', () => {
  it.each([
    ['1 + 2 * 3 - 4;', '(- (+ 1 (* 2 3)) 4)'],
    ['(1 + 2) * 3;', '(* (+ 1 2) 3)'],
    ['a || b && c == d < e + f;', '(|| a (&& b (== c (< d (+ e f)))))'],
    ['a ya b aur nahi c;', '(|| a (&& b (! c)))'],
    ['- - a % !b;', '(% (- (- a)) (! b))'],
    ['a = b += 1;', '(= a (+= b 1))'],
    ['a[0][1] -= 2;', '(-= (index (index a 0) 1) 2)'],
    ['[sach, jhooth, khaali, "x",];', '(list true false null "x")'],
    ['({ "a b": 1, c: [], });', '(dict a b:1 c:(list))'],
    ['rakho f = kaam (a, b) { wapas; };', '(var f (fn (a b) (block (return))))'],
    ['kaam () {}();', '(call (fn () (block)))'],
  ])('parses expression %j', (source, expected) => {
    expect(tree(source)).toBe(expected);
  });

  it.each([
    ['rakho x; pakka y = 1;', '(var x) (const y 1)'],
    ['kaam f(a) { wapas a; }', '(func f (a) (block (return a)))'],
    ['{ ; ruko; agla; }', '(block (block) (break) (continue))'],
    ['agar (a) b; warna agar (c) d; warna e;', '(if a b (if c d e))'],
    ['agar (a) agar (b) c; warna d;', '(if a (if b c d))'],
    ['jabtak (a) { }', '(while a (block))'],
    ['chalo (;;) ;', '(for _ _ _ (block))'],
    ['chalo (rakho i = 0; i < 3; i += 1) x;', '(for (var i 0) (< i 3) (+= i 1) x)'],
    ['chalo (i = 0; ; ) x;', '(for (= i 0) _ _ x)'],
  ])('parses statement %j', (source, expected) => {
    expect(tree(source)).toBe(expected);
  });

  it('spans a node from its first to its last token', () => {
    const { ast } = syntax('  (a) + 1;\n');
    expect(ast?.body[0]?.span).toEqual({ start: 2, end: 10, line: 1, column: 3 });
  });

  it.each([
    ['+;', 'E0201'],
    ['warna x;', 'E0201'],
    ['a = 1', 'E0202'],
    ['agar a) {}', 'E0203'],
    ['{ a;', 'E0203'],
    ['f(a,);', 'E0201'],
    ['rakho 1 = 2;', 'E0204'],
    ['kaam f(1) {}', 'E0204'],
    ['1 = 2;', 'E0205'],
    ['f() = 2;', 'E0205'],
    ['pakka x;', 'E0206'],
    ['agar (a) rakho x = 1;', 'E0207'],
    ['jabtak (a) kaam f() {}', 'E0207'],
    ['rakho d = { 1: 2 };', 'E0208'],
  ])('reports %j as %s', (source, code) => {
    expect(codes(source)).toEqual([code]);
  });

  it('points at the gap where a semicolon is missing', () => {
    const [diagnostic] = syntax('rakho a = 1\nrakho b = 2;').diagnostics;
    expect(diagnostic?.span).toMatchObject({ line: 1, column: 12 });
  });

  it.each([
    ['rakho = 1; rakho = 2;', ['E0204', 'E0204']],
    ['{ a = ; b = ; } c = ;', ['E0201', 'E0201', 'E0201']],
    ['agar (x { y(); } z = ;', ['E0203', 'E0201']],
    ['} ) +; a; +;', ['E0201', 'E0201']],
    ['1 + rakho x = 2; +;', ['E0201', 'E0201']],
  ])('recovers after errors in %j', (source, expected) => {
    expect(codes(source)).toEqual(expected);
  });

  it('caps diagnostics at 20', () => {
    expect(codes('+;'.repeat(50))).toHaveLength(20);
    expect(codes(`{ ${'+;'.repeat(50)}`)).toHaveLength(20);
  });

  it.each(['(', '[', '!', '{', 'a = ', 'agar (a) ', 'kaam f() {', '({a:'])(
    'rejects deeply nested %j without overflowing',
    (opener) => {
      expect(codes(opener.repeat(MAX_NESTING * 50))).toContain('E0209');
    },
  );

  it('accepts reasonable nesting and long flat chains', () => {
    expect(codes(`a = ${'('.repeat(100)}1${')'.repeat(100)};`)).toEqual([]);
    expect(codes(`a = 1${' + 1'.repeat(500)};`)).toEqual([]);
  });
});
