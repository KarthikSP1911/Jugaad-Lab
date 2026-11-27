import { describe, expect, it } from 'vitest';
import { highlight } from '../../lib/editor/highlight';
import { decodeShare, encodeShare } from '../../lib/playground/share';

const join = (source: string) =>
  highlight(source)
    .map((segment) => segment.text)
    .join('');

describe('highlight', () => {
  it('colours keywords, calls, literals and comments', () => {
    const segments = highlight('rakho x = jodo(1, "a"); // note');
    const find = (text: string) => segments.find((segment) => segment.text === text)?.kind;
    expect(find('rakho')).toBe('keyword');
    expect(find('jodo')).toBe('call');
    expect(find('1')).toBe('number');
    expect(find('"a"')).toBe('string');
    expect(find('// note')).toBe('comment');
  });

  it.each(['', 'bolo("open', '/* open', '@ rakho', 'a /* b */ c\r\n', 'rakho नाम = "😀";'])(
    'keeps the source intact: %j',
    (source) => {
      expect(join(source)).toBe(source);
    },
  );
});

describe('share links', () => {
  it('restores unicode source and input', () => {
    const source = 'bolo("नमस्ते 😀 >>> ???");\n';
    expect(decodeShare(encodeShare(source))).toEqual({ code: source, input: '' });
    expect(decodeShare(encodeShare(source, 'आशा\n2'))).toEqual({ code: source, input: 'आशा\n2' });
  });

  it('ignores other or damaged fragments', () => {
    expect(decodeShare('#section')).toBeNull();
    expect(decodeShare('#code=%%%')).toBeNull();
  });
});
