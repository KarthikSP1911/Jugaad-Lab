// One block per audited defect that lists, dictionaries and strings cover.
import { describe, expect, it } from 'vitest';
import { outputOf } from '../run-program.js';

describe('defect 4: index assignment ignored', () => {
  it('stores into lists and dictionaries', () => {
    const source = 'rakho a = [1]; a[0] = 2; rakho d = {}; d["k"] = 3; bolo(a[0], d["k"]);';
    expect(outputOf(source)).toBe('2 3\n');
  });
});

describe('defect 5: elements limited to primary expressions', () => {
  it('evaluates full expressions as elements and values', () => {
    expect(outputOf('bolo([1 + 2, -1], { k: 2 * 3 });')).toBe('[3, -1] {"k": 6}\n');
  });
});

describe('defect 6: no string escapes', () => {
  it('prints the escaped characters', () => {
    expect(outputOf(String.raw`bolo("a\nb\t\\ \"c\" \'d\'");`)).toBe('a\nb\t\\ "c" \'d\'\n');
  });
});

describe('defect 18: dictionaries as plain objects', () => {
  it('has no inherited keys', () => {
    expect(outputOf('rakho d = {}; bolo(d["constructor"], d["__proto__"]);')).toBe(
      'khaali khaali\n',
    );
  });

  it('stores prototype names as ordinary keys', () => {
    const source = 'rakho d = {}; d["__proto__"] = 1; bolo(d["__proto__"], lambai(d));';
    expect(outputOf(source)).toBe('1 1\n');
  });
});
