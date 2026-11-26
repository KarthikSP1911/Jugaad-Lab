import { hinglish, tokenize, type Token } from '@jugaad-hinglish/core';

export type SegmentKind =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'call'
  | 'operator';

export interface Segment {
  kind: SegmentKind;
  text: string;
}

const COMMENT = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))/;
const PUNCTUATION = /^[(){}[\],;:]$/;

function kindOf(token: Token, next: Token | undefined): SegmentKind {
  if (hinglish.has(token.lexeme)) return 'keyword';
  if (token.kind === 'String') return 'string';
  if (token.kind === 'Number') return 'number';
  if (token.kind === 'Identifier') return next?.kind === 'LeftParen' ? 'call' : 'plain';
  return PUNCTUATION.test(token.lexeme) ? 'plain' : 'operator';
}

/** Text between tokens is whitespace, comments, or input the lexer rejected. */
function gap(text: string): Segment[] {
  // Splitting on a capture group puts the comments at the odd positions.
  return text
    .split(COMMENT)
    .map((part, index): Segment => ({ kind: index % 2 ? 'comment' : 'plain', text: part }));
}

/** Splits source into coloured segments that join back to exactly the source. */
export function highlight(source: string): Segment[] {
  const { tokens } = tokenize(source);
  const segments: Segment[] = [];
  let end = 0;
  tokens.forEach((token, index) => {
    if (token.kind === 'EOF') return;
    segments.push(...gap(source.slice(end, token.start)));
    segments.push({
      kind: kindOf(token, tokens[index + 1]),
      text: source.slice(token.start, token.end),
    });
    end = token.end;
  });
  segments.push(...gap(source.slice(end)));
  return segments.filter((segment) => segment.text !== '');
}
