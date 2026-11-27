/** Editor commands as pure text edits, so the textarea only has to apply them. */
export interface Edit {
  /** The range of the old text that `insert` replaces. */
  from: number;
  to: number;
  insert: string;
  /** Selection to set afterwards. */
  selection: [number, number];
}

export const INDENT = '    ';

const LEADING_INDENT = /^(\t| {1,4})/;

function lineStart(source: string, offset: number): number {
  return offset === 0 ? 0 : source.lastIndexOf('\n', offset - 1) + 1;
}

/** The whole lines touched by a selection. */
function block(source: string, start: number, end: number) {
  const from = lineStart(source, start);
  // A selection ending at the start of a line does not include that line.
  const last = end > start && source[end - 1] === '\n' ? end - 1 : end;
  const next = source.indexOf('\n', last);
  const to = next < 0 ? source.length : next;
  return { from, to, lines: source.slice(from, to).split('\n') };
}

/** Replaces whole lines, keeping a cursor in place or reselecting the block. */
function rewrite(source: string, start: number, end: number, change: (line: string) => string) {
  const { from, to, lines } = block(source, start, end);
  const insert = lines.map(change).join('\n');
  const cursor = Math.max(from, start + insert.length - (to - from));
  const selection: [number, number] =
    start === end ? [cursor, cursor] : [from, from + insert.length];
  return { from, to, insert, selection };
}

/** Tab: spaces at the cursor, or one more level on every selected line. */
export function indent(source: string, start: number, end: number): Edit {
  if (start === end) {
    const cursor = start + INDENT.length;
    return { from: start, to: end, insert: INDENT, selection: [cursor, cursor] };
  }
  return rewrite(source, start, end, (line) => (line === '' ? line : INDENT + line));
}

/** Shift+Tab: one level less on the current or selected lines. */
export function dedent(source: string, start: number, end: number): Edit {
  return rewrite(source, start, end, (line) => line.replace(LEADING_INDENT, ''));
}

/** Enter: keeps the indentation, and adds a level after an opening brace. */
export function newline(source: string, start: number, end: number): Edit {
  const before = source.slice(lineStart(source, start), start);
  const base = /^[ \t]*/.exec(before)?.[0] ?? '';
  const opens = /\{[ \t]*$/.test(before);
  const first = `\n${base}${opens ? INDENT : ''}`;
  // Between a pair of braces, the closing one moves to its own line.
  const insert = opens && source[end] === '}' ? `${first}\n${base}` : first;
  const cursor = start + first.length;
  return { from: start, to: end, insert, selection: [cursor, cursor] };
}

/** Ctrl+/: comments the lines out, or back in when all of them already are. */
export function toggleComment(source: string, start: number, end: number): Edit {
  const filled = block(source, start, end).lines.filter((line) => line.trim() !== '');
  const commented = filled.length > 0 && filled.every((line) => line.trimStart().startsWith('//'));
  const column = Math.min(...filled.map((line) => line.length - line.trimStart().length));
  return rewrite(source, start, end, (line) => {
    if (commented) return line.replace(/\/\/ ?/, '');
    if (line.trim() === '') return line;
    return `${line.slice(0, column)}// ${line.slice(column)}`;
  });
}
