// Golden programs. `name.err` lists one `CODE line:column` per diagnostic.
// A program without a `.err` file must pass `check`.
import { check } from '@jugaad-hinglish/core';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const directory = new URL('./', import.meta.url);
const programs = readdirSync(directory).filter((file) => file.endsWith('.hing'));

describe('golden programs', () => {
  it.each(programs)('%s', (file) => {
    const source = readFileSync(new URL(file, directory), 'utf8');
    const errorFile = new URL(file.replace(/\.hing$/, '.err'), directory);
    const expected = existsSync(errorFile) ? readFileSync(errorFile, 'utf8') : '';
    const actual = check(source, { file })
      .diagnostics.map((d) => `${d.code} ${d.span.line}:${d.span.column}\n`)
      .join('');
    expect(actual).toBe(expected);
  });
});
