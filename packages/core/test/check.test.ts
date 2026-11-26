import { describe, expect, it } from 'vitest';
import { check } from '../src/check.js';
import { renderDiagnostic } from '../src/diagnostics/render.js';

const render = (source: string, lang?: 'hi' | 'en') => {
  const [diagnostic] = check(source, { file: 'a.hing' }).diagnostics;
  if (!diagnostic) throw new Error('expected a diagnostic');
  return renderDiagnostic(diagnostic, source, lang ? { lang } : {}).split('\n');
};

describe('check', () => {
  it('returns the tree only when there are no errors', () => {
    expect(check('bolo(1);').ast?.kind).toBe('Program');
    expect(check('bolo(1)').ast).toBeNull();
  });

  it('merges lexical and syntax diagnostics in source order', () => {
    const { diagnostics } = check('+;\n@\n+;');
    expect(diagnostics.map((d) => d.code)).toEqual(['E0201', 'E0101', 'E0201']);
  });

  it('never throws and always terminates on random input', () => {
    const pieces = '( ) { } [ ] ; , : = + - ! " \' \\ /* // \n a 1 . rakho kaam agar warna chalo @'
      .split(' ')
      .concat(' ');
    let seed = 1;
    const random = () => (seed = (seed * 48271) % 2147483647);
    for (let run = 0; run < 2000; run += 1) {
      const source = Array.from({ length: random() % 60 }, () => pieces[random() % pieces.length]);
      expect(() => check(source.join(''))).not.toThrow();
    }
  });
});

describe('renderDiagnostic', () => {
  it('shows position, source line and caret', () => {
    const [header, line, caret] = render('rakho a;\r\n    1 = 2;\r\n');
    expect(header).toContain('E0205');
    expect(header).toContain('a.hing:2:5');
    expect(line).toBe('        1 = 2;');
    expect(caret).toBe('        ^');
  });

  it('underlines the whole span and keeps tabs', () => {
    const [, line, caret] = render('\tfoo() = 2;');
    expect(line).toBe('    \tfoo() = 2;');
    expect(caret).toBe('    \t^^^^^');
  });

  it('handles the first line, an empty line and the end of the file', () => {
    expect(render('@')[2]).toBe('    ^');
    expect(render('\n@')[1]).toBe('    @');
    expect(render('{\n')[2]).toBe('    ^');
  });

  it('selects the language', () => {
    expect(render('@', 'hi')[0]?.startsWith('Galti')).toBe(true);
    expect(render('@', 'en')[0]?.startsWith('Error')).toBe(true);
    expect(render('@', 'en')[3]).not.toBe(render('@', 'hi')[3]);
  });
});
