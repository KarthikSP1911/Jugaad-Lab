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
