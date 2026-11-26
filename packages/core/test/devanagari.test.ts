import { describe, expect, it } from 'vitest';
import { check } from '../src/check.js';
import { TITLES } from '../src/diagnostics/codes.js';
import { renderDiagnostic, renderRuntimeError } from '../src/diagnostics/render.js';
import { runProgram } from './run-program.js';

const DEVANAGARI = /\p{Script=Devanagari}/u;

function renderFirst(source: string): string[] {
  const [diagnostic] = check(source, { file: 'a.hing' }).diagnostics;
  if (!diagnostic) throw new Error('expected a diagnostic');
  return renderDiagnostic(diagnostic, source, { lang: 'deva' }).split('\n');
}

describe('Devanagari diagnostics', () => {
  it('has a title in Devanagari for every code', () => {
    for (const { deva } of Object.values(TITLES)) expect(deva).toMatch(DEVANAGARI);
  });

  it('renders a compile error', () => {
    const lines = renderFirst('bolo(x);');
    expect(lines[0]).toBe('गलती E0301 [नाम नहीं मिला] यहाँ: a.hing:1:6');
    expect(lines[3]).toMatch(DEVANAGARI);
  });

  it('renders a runtime trace', () => {
    const source = 'kaam f() { wapas 1 / 0; }\nf();';
    const { result } = runProgram(source);
    if (result.status !== 'runtime-error') throw new Error('expected a runtime error');
    const text = renderRuntimeError(result.error, source, { lang: 'deva' });
    expect(text).toContain('f के अंदर (');
  });

  it('gives combining marks no caret column', () => {
    const source = 'bolo("के", x);';
    const caret = renderFirst(source)[2];
    expect(caret).toBe(`    ${' '.repeat(source.indexOf('x') - 1)}^`);
  });
});
