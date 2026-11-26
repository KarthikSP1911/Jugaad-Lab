// Defect 17: documentation that refers to files that do not exist.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const markdown = [
  'README.md',
  'CHANGELOG.md',
  ...readdirSync(new URL('docs/', root), { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => `docs/${file.replaceAll('\\', '/')}`),
];

describe('defect 17: links to missing files', () => {
  it.each(markdown)('%s links only to files that exist', (file) => {
    const url = new URL(file, root);
    const links = [...readFileSync(url, 'utf8').matchAll(/\]\(([^)#\s]+)[^)]*\)/g)]
      .map((match) => match[1] as string)
      .filter((link) => !/^[a-z]+:/i.test(link));
    expect(links.filter((link) => !existsSync(new URL(link, url)))).toEqual([]);
  });
});
