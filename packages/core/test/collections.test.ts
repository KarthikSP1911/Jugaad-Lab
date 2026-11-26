import { describe, expect, it } from 'vitest';
import { outputOf, runProgram } from './run-program.js';

describe('lists, dictionaries and indexing', () => {
  it.each([
    ['[]', '[]'],
    ['{}', '{}'],
    ['[1, "a", sach, khaali,]', '[1, "a", sach, khaali]'],
    ['{ naam: "Asha", "umar": 25 }', '{"naam": "Asha", "umar": 25}'],
    ['[[1], { k: [bolo] }]', '[[1], {"k": [<kaam bolo>]}]'],
    ['["a\\"b\\n"]', '["a\\"b\\n"]'],
    ['"x" + [1]', 'x[1]'],
    ['{ k: 1, k: 2 }', '{"k": 2}'],
    ['[10, 20][1]', '20'],
    ['{ k: 1 }["nahi_hai"]', 'khaali'],
    ['"a😀b"[1]', '😀'],
    ['[1] == [1]', 'jhooth'],
  ])('evaluates %s', (expression, expected) => {
    expect(outputOf(`bolo(${expression});`)).toBe(`${expected}\n`);
  });

  it('marks cycles but repeats shared values', () => {
    expect(outputOf('rakho a = [1]; joro(a, a); bolo(a);')).toBe('[1, [...]]\n');
    expect(outputOf('rakho d = {}; d["d"] = d; bolo(d);')).toBe('{"d": {...}}\n');
    expect(outputOf('rakho a = [1]; bolo([a, a]);')).toBe('[[1], [1]]\n');
  });

  it('prints very deep nesting', () => {
    const source = `rakho a = []; chalo (rakho i = 0; i < 20000; i += 1) { a = [a]; }
      bolo(lambai(shabd(a)));`;
    expect(outputOf(source)).toBe('40002\n');
  });

  it('reports exponentially large text', () => {
    const source = `rakho a = [1]; chalo (rakho i = 0; i < 40; i += 1) { a = [a, a]; } bolo(a);`;
    expect(runProgram(source).codes).toEqual(['E0409']);
    // Filling a string to its limit takes seconds on a busy machine.
  }, 30_000);

  it('evaluates the object and index of a compound assignment once', () => {
    const source = `
      rakho a = [1, 2];
      kaam soochi() { bolo("soochi"); wapas a; }
      kaam index() { bolo("index"); wapas 1; }
      soochi()[index()] += 5;
      bolo(a);`;
    expect(outputOf(source)).toBe('soochi\nindex\n[1, 7]\n');
  });

  it('writes through constants, nesting and new keys', () => {
    const source = `
      pakka d = { a: [[0]] };
      d["a"][0][0] = 3;
      d["b"] = 4;
      bolo(d, lambai(d));`;
    expect(outputOf(source)).toBe('{"a": [[3]], "b": 4} 2\n');
  });

  it('measures and indexes a very long string', () => {
    const source = `rakho s = "a"; chalo (rakho i = 0; i < 24; i += 1) { s = s + s; }
      bolo(lambai(s), s[lambai(s) - 1]);`;
    expect(outputOf(source)).toBe('16777216 a\n');
  });

  it.each([
    ['bolo([1][1]);', 'E0410'],
    ['bolo([1][-1]);', 'E0410'],
    ['bolo("ab"[2]);', 'E0410'],
    ['rakho a = []; a[0] = 1;', 'E0410'],
    ['rakho a = [1]; a[nikalo(a) - 1] = 2;', 'E0410'],
    ['bolo([1][0.5]);', 'E0411'],
    ['bolo([1]["0"]);', 'E0411'],
    ['bolo({}[1]);', 'E0411'],
    ['rakho d = {}; d[sach] = 1;', 'E0411'],
    ['bolo(1[0]);', 'E0412'],
    ['rakho x; x[0] = 1;', 'E0412'],
    ['rakho s = "ab"; s[0] = "c";', 'E0413'],
    ['rakho d = {}; d["k"] += 1;', 'E0401'],
  ])('rejects %s with %s', (source, code) => {
    expect(runProgram(source).codes).toEqual([code]);
  });
});
