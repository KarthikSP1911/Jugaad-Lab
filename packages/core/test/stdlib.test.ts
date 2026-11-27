import { describe, expect, it } from 'vitest';
import { run } from '../src/run.js';
import { outputOf, runProgram } from './run-program.js';

describe('standard library', () => {
  it.each([
    // maths
    ['mod(-4.5)', '4.5'],
    ['vargmool(49)', '7'],
    ['ghaat(2, 10)', '1024'],
    ['ghaat(2, -1)', '0.5'],
    ['gol(2.5)', '3'],
    ['gol(-2.5)', '-3'],
    ['gol(2.4)', '2'],
    ['neeche(-1.5)', '-2'],
    ['upar(1.2)', '2'],
    ['adhiktam(3, 9, 4)', '9'],
    ['adhiktam([3, 9, 4])', '9'],
    ['nyuntam(3, -9, 4)', '-9'],
    ['nyuntam([7])', '7'],
    // text
    ['todo("a,b,,c", ",")', '["a", "b", "", "c"]'],
    ['todo("a😀b", "")', '["a", "😀", "b"]'],
    ['milao([1, "do", sach], "-")', '1-do-sach'],
    ['milao([], ",")', ''],
    ['bade("Namaste")', 'NAMASTE'],
    ['chhote("NaMaStE")', 'namaste'],
    ['"[" + saaf("  hi \\t") + "]"', '[hi]'],
    ['badlo("aa-bb-aa", "aa", "x")', 'x-bb-x'],
    // strings and lists
    ['hai("namaste", "mas")', 'sach'],
    ['hai([1, "2", 3], 2)', 'jhooth'],
    ['hai([1, "2", 3], "2")', 'sach'],
    ['hai({ a: 1 }, "a")', 'sach'],
    ['hai({ a: 1 }, "b")', 'jhooth'],
    ['kahan("a😀bc", "bc")', '2'],
    ['kahan("abc", "z")', '-1'],
    ['kahan([5, 6, 7], 7)', '2'],
    ['kahan([5, 6, 7], 8)', '-1'],
    ['kaato([1, 2, 3, 4], 1, 3)', '[2, 3]'],
    ['kaato([1, 2], 2, 2)', '[]'],
    ['kaato("a😀bcd", 1, 3)', '😀b'],
    ['ulta([1, 2, 3])', '[3, 2, 1]'],
    ['ulta("a😀b")', 'b😀a'],
    ['chhanto([10, 2, -1, 2])', '[-1, 2, 2, 10]'],
    ['chhanto(["kela", "aam", "seb"])', '["aam", "kela", "seb"]'],
    ['chhanto([])', '[]'],
    ['har([1, 2, 3], kaam (x) { wapas x * x; })', '[1, 4, 9]'],
    ['har([1, 2], shabd)', '["1", "2"]'],
    ['chuno([1, 2, 3, 4], kaam (x) { wapas x % 2 == 0; })', '[2, 4]'],
    ['chaabiyan({ b: 1, a: 2 })', '["b", "a"]'],
  ])('evaluates %s', (expression, expected) => {
    expect(outputOf(`bolo(${expression});`)).toBe(`${expected}\n`);
  });

  it('leaves the original list alone in chhanto, ulta, har and chuno', () => {
    const source = `rakho a = [3, 1, 2];
      chhanto(a); ulta(a); har(a, shabd); chuno(a, kaam (x) { wapas sach; });
      bolo(a);`;
    expect(outputOf(source)).toBe('[3, 1, 2]\n');
  });

  it('inserts and removes at a position', () => {
    const source = `rakho a = [1, 3];
      daalo(a, 1, 2); daalo(a, 3, 4); daalo(a, 0, 0);
      bolo(a); bolo(hatao(a, 2), a);`;
    expect(outputOf(source)).toBe('[0, 1, 2, 3, 4]\n2 [0, 1, 3, 4]\n');
  });

  it('lets a closure passed to har see its surroundings', () => {
    const source = 'rakho guna = 10; bolo(har([1, 2], kaam (x) { wapas x * guna; }));';
    expect(outputOf(source)).toBe('[10, 20]\n');
  });

  it('draws kismat numbers from the host, inclusive at both ends', () => {
    const draws = [0, 0.999999, 0.5];
    let output = '';
    run('bolo(kismat(1, 6), kismat(1, 6), kismat(5, 5));', {
      write: (text) => {
        output += text;
      },
      readLine: () => '',
      random: () => draws.shift() ?? 0,
    });
    expect(output).toBe('1 6 5\n');
  });

  it('keeps kismat in range with the default random source', () => {
    const output = outputOf('chalo (rakho i = 0; i < 200; i += 1) { bolo(kismat(-2, 2)); }');
    const values = new Set(output.trim().split('\n'));
    for (const value of values) expect(['-2', '-1', '0', '1', '2']).toContain(value);
  });

  it.each([
    ['mod("1");', 'E0416'],
    ['vargmool(-1);', 'E0417'],
    ['ghaat(-8, 0.5);', 'E0417'],
    ['adhiktam();', 'E0414'],
    ['nyuntam([]);', 'E0414'],
    ['adhiktam(1, "2");', 'E0416'],
    ['kismat(6, 1);', 'E0417'],
    ['kismat(1.5, 2);', 'E0416'],
    ['todo(1, ",");', 'E0416'],
    ['milao("abc", ",");', 'E0416'],
    ['badlo("abc", "", "x");', 'E0417'],
    ['hai(5, 1);', 'E0416'],
    ['hai("abc", 1);', 'E0416'],
    ['kahan({}, "a");', 'E0416'],
    ['kaato([1, 2], 0, 3);', 'E0410'],
    ['kaato([1, 2], 2, 1);', 'E0417'],
    ['kaato("ab", 0.5, 1);', 'E0411'],
    ['chhanto([1, "a"]);', 'E0416'],
    ['har([1], 5);', 'E0416'],
    ['har([1], kaam (a, b) { wapas a; });', 'E0407'],
    ['chuno([1], kaam (x) { wapas 1; });', 'E0405'],
    ['daalo([1], 2, 0);', 'E0410'],
    ['hatao([], 0);', 'E0410'],
    ['chaabiyan([]);', 'E0416'],
    ['har([1, 2]);', 'E0307'],
  ])('rejects %s with %s', (source, code) => {
    expect(runProgram(source).codes).toEqual([code]);
  });

  it('counts steps inside har callbacks', () => {
    const source = 'har([1, 2, 3], kaam (x) { jabtak (sach) { } });';
    expect(runProgram(source, { maxSteps: 1000 }).codes).toEqual(['E0408']);
  });

  it('lets a program reuse a built-in name for its own variable', () => {
    expect(outputOf('rakho ulta = 5; bolo(ulta);')).toBe('5\n');
  });
});
