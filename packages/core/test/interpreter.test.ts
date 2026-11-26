import { describe, expect, it } from 'vitest';
import { renderRuntimeError } from '../src/diagnostics/render.js';
import { outputOf, runProgram } from './run-program.js';

describe('run', () => {
  it.each([
    ['1 + 2 * 3 - 4 / 2', '5'],
    ['7 % 3', '1'],
    ['-(2 + 3)', '-5'],
    ['"a" + 1 + sach + khaali', 'a1sachkhaali'],
    ['1 + "a"', '1a'],
    ['1 == "1"', 'jhooth'],
    ['khaali == khaali', 'sach'],
    ['"ab" < "b"', 'sach'],
    ['2 >= 3', 'jhooth'],
    ['sach aur nahi jhooth', 'sach'],
    ['jhooth && 1 / 0 == 1', 'jhooth'],
    ['sach ya 1 / 0 == 1', 'sach'],
    ['bolo', '<kaam bolo>'],
    ['kaam () {}', '<kaam>'],
  ])('evaluates %s', (expression, expected) => {
    expect(outputOf(`bolo(${expression});`)).toBe(`${expected}\n`);
  });

  it('handles variables, assignment and compound operators', () => {
    const source = `rakho x; bolo(x); x = 10; x += 5; x -= 3; x *= 2; x /= 4; x %= 4; bolo(x);`;
    expect(outputOf(source)).toBe('khaali\n2\n');
  });

  it('runs loops with break and continue', () => {
    const source = `
      chalo (rakho i = 0; i < 10; i += 1) {
        agar (i == 1) { agla; }
        agar (i == 3) { ruko; }
        bolo(i);
      }
      rakho n = 0;
      jabtak (sach) { n += 1; agar (n < 3) agla; ruko; }
      bolo(n);`;
    expect(outputOf(source)).toBe('0\n2\n3\n');
  });

  it('keeps closures independent', () => {
    const source = `
      kaam counter() { rakho c = 0; wapas kaam () { c += 1; wapas c; }; }
      rakho a = counter(); rakho b = counter();
      a(); bolo(a(), b(), counter()());`;
    expect(outputOf(source)).toBe('2 1 1\n');
  });

  it('returns khaali without wapas and allows calls before declaration', () => {
    expect(outputOf('bolo(f()); kaam f() {}')).toBe('khaali\n');
  });

  it.each([
    ['bolo(1 - "a");', 'E0401'],
    ['bolo(sach + 1);', 'E0401'],
    ['bolo(1 < "a");', 'E0401'],
    ['bolo(-"a");', 'E0401'],
    ['bolo(1 / 0);', 'E0403'],
    ['bolo(1 % 0);', 'E0403'],
    ['rakho x = 1; x /= 0;', 'E0403'],
    ['rakho x = 1; x();', 'E0404'],
    ['agar (1) {}', 'E0405'],
    ['jabtak (khaali) {}', 'E0405'],
    ['chalo (; "x"; ) {}', 'E0405'],
    ['bolo(!0);', 'E0405'],
    ['bolo(sach && 1);', 'E0405'],
    ['f(); rakho x = 1; kaam f() { bolo(x); }', 'E0406'],
    ['f(); rakho x = 1; kaam f() { x = 2; }', 'E0406'],
    ['rakho f = kaam (a) {}; f();', 'E0407'],
    ['rakho s = "aaaaaaaa"; jabtak (sach) { s += s; }', 'E0409'],
  ])('fails %j with %s', (source, code) => {
    const { codes, result } = runProgram(source);
    expect(codes).toEqual([code]);
    expect(result.status).toBe('runtime-error');
  });

  it('keeps output written before an error and runs nothing after compile errors', () => {
    expect(runProgram('bolo(1); bolo(1 / 0);').output).toBe('1\n');
    const compile = runProgram('bolo(1); bolo(x);');
    expect(compile.result.status).toBe('compile-error');
    expect(compile.output).toBe('');
  });

  it('stops at the step budget', () => {
    for (const source of ['jabtak (sach) {}', 'chalo (;;) ;', 'kaam f() { f(); } f();']) {
      expect(runProgram(source, { maxSteps: 100 }).codes).toEqual(['E0408']);
    }
  });

  it('honours a custom call depth', () => {
    const source = 'kaam f(n) { agar (n > 1) { f(n - 1); } } f(5);';
    expect(runProgram(source, { maxDepth: 5 }).codes).toEqual([]);
    expect(runProgram(source, { maxDepth: 4 }).codes).toEqual(['E0402']);
  });

  it('turns host stack exhaustion into E0402', () => {
    const source = 'kaam f() { f(); } f();';
    expect(runProgram(source, { maxDepth: 10_000_000 }).codes).toEqual(['E0402']);
  });

  it('renders the call trace in Hinglish when asked', () => {
    const source = 'kaam a() { wapas 1 / 0; }\na();';
    const { result } = runProgram(source, { file: 't.hing' });
    if (result.status !== 'runtime-error') throw new Error('expected a runtime error');
    const lines = renderRuntimeError(result.error, source, { lang: 'hi' }).split('\n');
    expect(lines[0]).toContain('yahan: t.hing:1:');
    expect(lines.at(-1)).toBe('  a ke andar (t.hing:2:1)');
  });

  it('renders the call trace, innermost first', () => {
    const source = 'kaam a() { wapas 1 / 0; }\nkaam b() { a(); }\nb();';
    const { result } = runProgram(source, { file: 't.hing' });
    if (result.status !== 'runtime-error') throw new Error('expected a runtime error');
    const lines = renderRuntimeError(result.error, source).split('\n');
    expect(lines.slice(-2)).toEqual(['  at a (t.hing:2:12)', '  at b (t.hing:3:1)']);
  });
});
