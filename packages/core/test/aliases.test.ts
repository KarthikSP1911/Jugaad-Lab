import { describe, expect, it } from 'vitest';
import { tokenize } from '../src/lexer/lexer.js';
import { ALIASES, hinglish, KEYWORDS } from '../src/packs/hinglish.js';
import { outputOf, runProgram } from './run-program.js';

const kindOf = (word: string) => tokenize(word).tokens[0]?.kind;

describe('keyword spelling aliases', () => {
  it.each([...ALIASES])('reads %s as %s', (alias, main) => {
    expect(kindOf(alias)).toBe(kindOf(main));
    expect(kindOf(alias)).not.toBe('Identifier');
  });

  it('points every alias at a main spelling, never at another alias', () => {
    for (const [alias, main] of ALIASES) {
      expect(KEYWORDS.has(main), main).toBe(true);
      expect(KEYWORDS.has(alias), alias).toBe(false);
    }
    expect(hinglish.size).toBe(KEYWORDS.size + ALIASES.size);
  });

  it('runs a program written with the other spellings', () => {
    const source = `
      kaam bada_hai(n) {
        agar (n > 10) { vapas sachh; } varna { vapas jhoot; }
      }
      rakho x = khali;
      pukka limit = 3;
      agar (nahin bada_hai(5) yaa jhuth) { bolo("chhota"); }
      bolo(bada_hai(50), x, limit, jhut == jhooth);
    `;
    expect(outputOf(source)).toBe('chhota\nsach khaali 3 sach\n');
  });

  it('prints the main spelling, whichever spelling the program used', () => {
    expect(outputOf('bolo(shabd(jhoot), shabd(khali), prakar(nhi sacch));')).toBe(
      'jhooth khaali bool\n',
    );
  });

  it('reserves aliases, so they cannot be variable names', () => {
    expect(runProgram('rakho jhoot = 1;').codes.length).toBeGreaterThan(0);
  });

  it('leaves aliases inside strings alone', () => {
    expect(outputOf('bolo("jhoot mat bolo");')).toBe('jhoot mat bolo\n');
  });
});
