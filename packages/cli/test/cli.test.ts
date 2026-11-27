import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';

function invoke(argv: string[], files: Record<string, string> = {}, input: string[] = []) {
  let out = '';
  let err = '';
  const code = runCli(argv, {
    out: (text) => {
      out += text;
    },
    err: (text) => {
      err += text;
    },
    readLine: () => input.shift() ?? null,
    readFile: (path) => {
      const source = files[path];
      if (source === undefined) throw new Error('no such file');
      return source;
    },
  });
  return { code, out, err };
}

describe('cli', () => {
  it('runs a program that has a byte order mark and reads input', () => {
    const files = { 'a.hing': '\uFEFFbolo(suno("? "));' };
    expect(invoke(['run', 'a.hing'], files, ['haan'])).toEqual({
      code: 0,
      out: '? haan\n',
      err: '',
    });
  });

  it.each([
    ['run', 'bolo(x);', 65, 'E0301'],
    ['check', 'bolo(x);', 65, 'E0301'],
    ['run', 'bolo(1 / 0);', 70, 'E0403'],
  ])('%s of %s exits %i', (command, source, code, diagnostic) => {
    const result = invoke([command, 'a.hing', '--lang=en'], { 'a.hing': source });
    expect(result.code).toBe(code);
    expect(result.err).toContain(`Error ${diagnostic}`);
  });

  it('checks without running', () => {
    expect(invoke(['check', 'a.hing'], { 'a.hing': 'bolo(1 / 0);' })).toEqual({
      code: 0,
      out: '',
      err: '',
    });
  });

  it.each([[['run']], [['udao', 'a.hing']], [['run', 'a', 'b']], [['--lang=fr']]])(
    'rejects %j',
    (argv) => {
      expect(invoke(argv).code).toBe(64);
    },
  );

  it('stops an infinite loop with the default step limit', () => {
    const result = invoke(['run', 'a.hing', '--lang=en'], { 'a.hing': 'jabtak (sach) { }' });
    expect(result.code).toBe(70);
    expect(result.err).toContain('Error E0408');
    expect(result.err).toContain('5000000 steps');
  });

  it('honours --max-steps, with 0 meaning no limit', () => {
    const files = { 'a.hing': 'rakho i = 0; jabtak (i < 10) { i = i + 1; } bolo(i);' };
    expect(invoke(['run', 'a.hing', '--max-steps=5'], files).code).toBe(70);
    expect(invoke(['run', 'a.hing', '--max-steps=0'], files)).toEqual({
      code: 0,
      out: '10\n',
      err: '',
    });
  });

  it.each([['--max-steps='], ['--max-steps=-1'], ['--max-steps=abc']])('rejects %s', (flag) => {
    expect(invoke(['run', 'a.hing', flag]).code).toBe(64);
  });

  it('stops an infinite loop in the REPL and keeps going', () => {
    const result = invoke(['repl', '--max-steps=100'], {}, ['jabtak (sach) { }', '1 + 1;']);
    expect(result.err).toContain('E0408');
    expect(result.out).toContain('2\n');
  });

  it('reports a missing file', () => {
    expect(invoke(['run', 'nahi.hing']).code).toBe(66);
  });

  it('prints the version and help', () => {
    expect(invoke(['--version']).out).toMatch(/^\d+\.\d+\.\d+\n$/);
    expect(invoke(['--help']).out).toContain('hinglish run');
  });

  it('keeps state in the REPL across multi-line entries and errors', () => {
    const input = ['kaam f() {', 'wapas 7;', '}', 'bolo(1 / 0);', 'f();', '.exit'];
    const result = invoke([], {}, input);
    expect(result.code).toBe(0);
    expect(result.out).toContain('. . > > 7\n');
    expect(result.err).toContain('E0403');
  });

  it('leaves the REPL at end of input', () => {
    expect(invoke(['repl']).code).toBe(0);
  });
});
