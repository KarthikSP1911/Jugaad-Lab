// Random input must produce diagnostics, never a crash or a hang.
import { describe, expect, it } from 'vitest';
import { check } from '../src/check.js';
import { hinglish } from '../src/packs/hinglish.js';
import { run } from '../src/run.js';

/** Mulberry32, so a failure can be reproduced from its seed. */
function random(seed: number) {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const below = (n: number) => Math.floor(next() * n);
  const pick = <T>(items: readonly T[]) => items[below(items.length)] as T;
  return { below, pick };
}

const CHARACTERS = [...'abz_019.+-*/%=!<>&|(){}[],;:"\'\\ \n\t\r', 'क', '😀', '\u0000', '\uD800'];

const TOKENS = [
  ...hinglish.keys(),
  ...'+ - * / % = += == != < <= > >= && || ! ( ) { } [ ] , ; :'.split(' '),
  ...['a', 'b', 'f', 'bolo', 'joro', 'lambai', '0', '1', '2.5', '"x"', "'y'"],
];

const ATOMS = ['a', 'b', 'c', '0', '1', '-1', '0.5', '"x"', '"😀"', 'sach', 'khaali', '[]', '{}'];
const NATIVES = ['lambai', 'nikalo', 'sankhya', 'shabd', 'prakar', 'suno'];
const OPERATORS = ['+', '-', '*', '/', '%', '==', '<', '>=', '&&', '||'];

/** Programs that pass the checks, so that the interpreter is exercised. */
function program(rng: ReturnType<typeof random>): string {
  const { below, pick } = rng;
  const expression = (depth: number): string => {
    if (depth > 2) return pick(ATOMS);
    const inner = () => expression(depth + 1);
    return pick([
      () => pick(ATOMS),
      () => `(${inner()} ${pick(OPERATORS)} ${inner()})`,
      () => `[${inner()}, ${inner()}]`,
      () => `{ k: ${inner()} }`,
      () => `${pick(['a', 'b', 'c'])}[${inner()}]`,
      () => `${pick(NATIVES)}(${inner()})`,
      () => `f(${inner()})`,
    ])();
  };
  const statement = (): string => {
    const name = pick(['a', 'b', 'c']);
    return pick([
      () => `${name} ${pick(['=', '+=', '*='])} ${expression(0)};`,
      () => `${name}[${expression(1)}] ${pick(['=', '+='])} ${expression(0)};`,
      () => `joro(${name}, ${expression(0)});`,
      () => `bolo(${expression(0)});`,
      () => `agar (${expression(0)}) { ${name} = ${expression(1)}; }`,
      () => `chalo (rakho i = 0; i < ${below(12)}; i += 1) { ${name} = [${name}, ${name}]; }`,
    ])();
  };
  const body = Array.from({ length: 1 + below(8) }, statement).join('\n');
  return `rakho a = [1]; rakho b = {}; rakho c = "s";
    kaam f(x) { agar (prakar(x) == "sankhya") { wapas f([x]); } wapas x; }
    ${body}`;
}

const host = { write: () => {}, readLine: () => '7' };

describe('fuzz', () => {
  it('checks 5,000 random character strings', { timeout: 60_000 }, () => {
    for (let seed = 0; seed < 5000; seed += 1) {
      const { below, pick } = random(seed);
      const source = Array.from({ length: below(80) }, () => pick(CHARACTERS)).join('');
      expect(() => check(source), `seed ${seed}`).not.toThrow();
    }
  });

  it('checks 10,000 random token streams', { timeout: 60_000 }, () => {
    for (let seed = 0; seed < 10_000; seed += 1) {
      const { below, pick } = random(seed);
      const source = Array.from({ length: below(60) }, () => pick(TOKENS)).join(' ');
      expect(() => check(source), `seed ${seed}`).not.toThrow();
    }
  });

  it('runs 3,000 random programs', { timeout: 60_000 }, () => {
    for (let seed = 0; seed < 3000; seed += 1) {
      const source = program(random(seed));
      expect(
        () => run(source, host, { maxSteps: 2000, maxDepth: 50 }),
        `seed ${seed}: ${source}`,
      ).not.toThrow();
    }
  });
});
