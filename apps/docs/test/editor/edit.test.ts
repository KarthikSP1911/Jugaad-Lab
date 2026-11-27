import { describe, expect, it } from 'vitest';
import { dedent, indent, newline, toggleComment, type Edit } from '../../lib/editor/edit';

/** Applies a command to text where `|` marks the cursor or both ends of a selection. */
function run(command: (source: string, start: number, end: number) => Edit, marked: string) {
  const start = marked.indexOf('|');
  const second = marked.indexOf('|', start + 1);
  const end = second < 0 ? start : second - 1;
  const source = marked.replaceAll('|', '');
  const { from, to, insert, selection } = command(source, start, end);
  const result = source.slice(0, from) + insert + source.slice(to);
  const [a, b] = selection;
  if (a === b) return `${result.slice(0, a)}|${result.slice(a)}`;
  return `${result.slice(0, a)}|${result.slice(a, b)}|${result.slice(b)}`;
}

describe('indent', () => {
  it('inserts spaces at the cursor', () => {
    expect(run(indent, 'a|b')).toBe('a    |b');
  });

  it('keeps selected text, indenting each line', () => {
    expect(run(indent, 'a|a;\n\nbb;|\ncc;')).toBe('|    aa;\n\n    bb;|\ncc;');
  });

  it('leaves out a line the selection only reaches the start of', () => {
    expect(run(indent, '|aa;\n|bb;')).toBe('|    aa;|\nbb;');
  });
});

describe('dedent', () => {
  it('removes one level and keeps the cursor on its text', () => {
    expect(run(dedent, '      a|b')).toBe('  a|b');
  });

  it('stops at the start of the line', () => {
    expect(run(dedent, ' | a')).toBe('|a');
  });

  it('handles a first line that is empty', () => {
    expect(run(dedent, '|\n    a')).toBe('|\n    a');
  });
});

describe('newline', () => {
  it('keeps the indentation', () => {
    expect(run(newline, '    a;|')).toBe('    a;\n    |');
  });

  it('adds a level after a brace, moving the closing one down', () => {
    expect(run(newline, '  kaam f() {|}')).toBe('  kaam f() {\n      |\n  }');
  });
});

describe('toggleComment', () => {
  it('comments lines at their shared indentation, and back', () => {
    const commented = '|    // a;\n    //     b;|';
    expect(run(toggleComment, '|    a;\n        b;|')).toBe(commented);
    expect(run(toggleComment, commented)).toBe('|    a;\n        b;|');
  });
});
