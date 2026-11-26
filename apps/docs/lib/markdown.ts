import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Reads a file from the repository's `docs/` at build time. */
export function readDoc(file: string): string {
  return readFileSync(join(process.cwd(), '..', '..', 'docs', file), 'utf8');
}

export interface Heading {
  id: string;
  text: string;
}

/** Second-level headings, with the ids `rehype-slug` gives plain-text titles. */
export function headings(markdown: string): Heading[] {
  return [...markdown.matchAll(/^## (.+?)\r?$/gm)].map((match) => {
    const text = match[1] ?? '';
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');
    return { id, text: text.replaceAll('`', '') };
  });
}
