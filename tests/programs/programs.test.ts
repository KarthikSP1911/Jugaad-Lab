// Golden programs. `name.err` lists one `CODE line:column` per diagnostic.
// A program with a `.out` file is run, reading lines from `name.in`; any other
// program is only checked.
import { check, run } from '@jugaad-hinglish/core';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const directory = new URL('./', import.meta.url);
const programs = readdirSync(directory, { recursive: true, encoding: 'utf8' })
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file.endsWith('.hing'));

const sibling = (file: string, extension: string) =>
  new URL(file.replace(/\.hing$/, extension), directory);
const read = (url: URL) => (existsSync(url) ? readFileSync(url, 'utf8') : '');

describe('golden programs', () => {
  it.each(programs)('%s', (file) => {
    const source = read(new URL(file, directory));
    const outFile = sibling(file, '.out');
    let output = '';
    const input = read(sibling(file, '.in')).split('\n');
    const host = {
      write: (text: string) => {
        output += text;
      },
      readLine: (prompt: string) => {
        output += prompt;
        return input.shift() ?? '';
      },
    };
    const { diagnostics } = existsSync(outFile)
      ? run(source, host, { file, maxSteps: 1_000_000 })
      : check(source, { file });
    const errors = diagnostics.map((d) => `${d.code} ${d.span.line}:${d.span.column}\n`).join('');
    expect(errors).toBe(read(sibling(file, '.err')));
    expect(output).toBe(read(outFile));
  });
});
