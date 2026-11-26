import { describe, expect, it } from 'vitest';
import { tokenize } from '../src/lexer/lexer.js';
import { hinglish } from '../src/packs/hinglish.js';

const kinds = (source: string) => tokenize(source).tokens.map((token) => token.kind);
const codes = (source: string) => tokenize(source).diagnostics.map((d) => d.code);

describe('tokenize', () => {
  it('always ends with EOF', () => {
    expect(kinds('')).toEqual(['EOF']);
    expect(kinds('  // only a comment')).toEqual(['EOF']);
  });

  it('maps every keyword in the pack', () => {
    for (const [word, kind] of hinglish) expect(kinds(word)).toEqual([kind, 'EOF']);
  });

  it('treats keywords as case-sensitive whole words', () => {
    expect(kinds('Agar agarbatti _agar bolo')).toEqual([
      'Identifier',
      'Identifier',
      'Identifier',
      'Identifier',
      'EOF',
    ]);
  });

  it('prefers two-character symbols', () => {
    expect(kinds('+= -= *= /= %= == != <= >= && ||')).toEqual([
      'PlusAssign',
      'MinusAssign',
      'StarAssign',
      'SlashAssign',
      'PercentAssign',
      'EqualEqual',
      'BangEqual',
      'LessEqual',
      'GreaterEqual',
      'AndAnd',
      'OrOr',
      'EOF',
    ]);
    expect(kinds('=== <')).toEqual(['EqualEqual', 'Assign', 'Less', 'EOF']);
  });

  it('records offsets, line and column', () => {
    const { tokens } = tokenize('rakho a;\r\n  a = 1.5;');
    expect(tokens[3]).toMatchObject({ lexeme: 'a', start: 12, end: 13, line: 2, column: 3 });
    expect(tokens[5]).toMatchObject({ lexeme: '1.5', line: 2, column: 7 });
  });

  it('counts columns in code points', () => {
    const { tokens } = tokenize('"😀" x');
    expect(tokens[1]).toMatchObject({ start: 5, column: 5 });
  });

  it('skips both comment forms and a byte order mark', () => {
    expect(kinds('﻿1 /* a\n * b */ 2 // c\n3')).toEqual(['Number', 'Number', 'Number', 'EOF']);
  });

  it.each([
    ['a @ b', 'E0101'],
    ['a & b', 'E0101'],
    ['1.', 'E0101'],
    ['"abc', 'E0102'],
    ['"abc\nx', 'E0102'],
    ['"abc\\', 'E0102'],
    ['"a\\qb"', 'E0103'],
    ['12abc', 'E0104'],
    ['/* abc', 'E0105'],
  ])('reports %j as %s', (source, code) => {
    expect(codes(source)).toEqual([code]);
  });

  it('continues after an error so one run reports several', () => {
    expect(codes('@\n#\n"x')).toEqual(['E0101', 'E0101', 'E0102']);
  });

  it('caps diagnostics at 20', () => {
    expect(codes('@'.repeat(50))).toHaveLength(20);
  });

  it('puts the file name on diagnostics', () => {
    expect(tokenize('@', { file: 'a.hing' }).diagnostics[0]?.file).toBe('a.hing');
  });
});
