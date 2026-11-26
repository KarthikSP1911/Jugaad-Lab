import { describe, expect, it } from 'vitest';
import { examples } from '../lib/examples';
import { execute, type ExecuteOptions } from '../lib/execute';

function capture(source: string, options?: ExecuteOptions) {
  let output = '';
  const result = execute(source, (text) => (output += text), options);
  return { ...result, output };
}

describe('execute', () => {
  it('collects output', () => {
    expect(capture('bolo(1 + 2);')).toMatchObject({ outcome: 'ok', output: '3\n', message: '' });
  });

  it('renders compile errors', () => {
    const result = capture('bolo(x);', { lang: 'en' });
    expect(result.outcome).toBe('compile-error');
    expect(result.message).toContain('E0301');
  });

  it('keeps output written before a runtime error', () => {
    const result = capture('bolo(1); bolo(1 / 0);');
    expect(result).toMatchObject({ outcome: 'runtime-error', output: '1\n' });
    expect(result.message).toContain('E0403');
  });

  it('stops at the step limit', () => {
    expect(capture('jabtak (sach) {}', { maxSteps: 100 }).outcome).toBe('runtime-error');
  });

  it('stops a program that prints too much', () => {
    expect(capture('jabtak (sach) { bolo(1); }').outcome).toBe('stopped');
  });

  it('feeds input lines to suno, then empty strings', () => {
    const source = 'bolo(suno("a? ") + "|" + suno("b? ") + "|");';
    expect(capture(source, { input: 'x' }).output).toBe('a? x\nb? \nx||\n');
  });
});

describe('examples', () => {
  it.each([...examples('en'), ...examples('hi')].filter(({ id }) => id !== 'errors'))('$id runs', ({ code, input }) => {
    expect(capture(code, input ? { input } : {})).toMatchObject({ outcome: 'ok' });
  });

  it('the error example fails as described', () => {
    const errors = [...examples('en'), ...examples('hi')].find(({ id }) => id === 'errors');
    expect(capture(errors?.code ?? '').outcome).toBe('compile-error');
  });
});
