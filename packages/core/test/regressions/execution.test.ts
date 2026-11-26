// One block per audited defect the resolver and interpreter cover.
import { describe, expect, it } from 'vitest';
import { run } from '../../src/run.js';
import { outputOf, runProgram } from '../run-program.js';

describe('defect 2: dynamic scoping', () => {
  it('reads variables where the function is defined, not where it is called', () => {
    const source = `
      rakho x = "bahar";
      kaam f() { wapas x; }
      kaam g() { rakho x = "andar"; wapas f(); }
      bolo(g());`;
    expect(outputOf(source)).toBe('bahar\n');
  });

  it('is not affected by a later declaration in the defining block', () => {
    const source = 'rakho x = 1; { kaam f() { wapas x; } rakho x = 2; bolo(f()); }';
    expect(outputOf(source)).toBe('1\n');
  });
});

describe('defect 3: functions surviving between runs', () => {
  it('forgets functions after a run', () => {
    runProgram('kaam purana() {}');
    expect(runProgram('purana();').codes).toEqual(['E0301']);
  });
});

describe('defect 7: null printed two ways', () => {
  it('prints khaali for a variable and a call result alike', () => {
    expect(outputOf('rakho x; kaam f() {} bolo(x); bolo(f());')).toBe('khaali\nkhaali\n');
  });
});

describe('defect 8: the string "sach" accepted as true', () => {
  it('rejects a string condition', () => {
    expect(runProgram('rakho s = "sach"; agar (s) {}').codes).toEqual(['E0405']);
  });
});

describe('defect 12: return through exceptions', () => {
  it('returns from inside nested loops and blocks', () => {
    const source = `
      kaam f() { jabtak (sach) { chalo (;;) { { wapas 7; } } } }
      bolo(f()); bolo("baad");`;
    expect(outputOf(source)).toBe('7\nbaad\n');
  });
});

describe('defect 13: global singletons', () => {
  it('allows a run inside another run', () => {
    let output = '';
    run('rakho x = 1; bolo(x); bolo(x);', {
      write: (text) => {
        output += text + outputOf('rakho x = 2; bolo(x);');
      },
      readLine: () => '',
    });
    expect(output).toBe('1\n2\n1\n2\n');
  });
});

describe('defect 14: break and continue as scope flags', () => {
  it('affects only the nearest loop', () => {
    const source = `
      chalo (rakho i = 0; i < 2; i += 1) {
        chalo (rakho j = 0; j < 3; j += 1) { agar (j == 1) { { ruko; } } bolo(i, j); }
        bolo("bahar", i);
      }`;
    expect(outputOf(source)).toBe('0 0\nbahar 0\n1 0\nbahar 1\n');
  });
});

describe('defect 15: type checks on AST kinds', () => {
  it('checks the value, whatever expression produced it', () => {
    expect(outputOf('rakho a = 2; kaam f() { wapas 3; } bolo(a * f());')).toBe('6\n');
    expect(runProgram('rakho a = "x"; bolo(a * 2);').codes).toEqual(['E0401']);
  });
});

describe('defect 19: recursion limited by the host stack', () => {
  const sum = 'kaam sum(n) { agar (n <= 1) { wapas 1; } wapas n + sum(n - 1); }';

  it('supports the full default depth', () => {
    expect(outputOf(`${sum} bolo(sum(1000));`)).toBe('500500\n');
  });

  it('reports E0402 beyond it', () => {
    expect(runProgram(`${sum} bolo(sum(2000));`).codes).toEqual(['E0402']);
  });
});
