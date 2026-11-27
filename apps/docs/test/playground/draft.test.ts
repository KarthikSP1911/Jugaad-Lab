import { describe, expect, it } from 'vitest';
import { parseDraft, startingProgram } from '../../lib/playground/draft';
import { encodeShare } from '../../lib/playground/share';

const draft = { code: 'bolo(1);', input: '' };

describe('parseDraft', () => {
  it('reads a saved program', () => {
    expect(parseDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it.each([null, '', '{', 'null', '[]', '{"code":1,"input":""}'])('ignores %j', (raw) => {
    expect(parseDraft(raw)).toBeNull();
  });
});

describe('startingProgram', () => {
  it('restores the draft', () => {
    expect(startingProgram('', draft)).toEqual({ program: draft, replaced: null, badLink: false });
  });

  it('prefers a shared link, keeping the draft for undo', () => {
    const found = startingProgram(encodeShare('bolo(2);'), draft);
    expect(found.program?.code).toBe('bolo(2);');
    expect(found.replaced).toEqual(draft);
  });

  it('offers no undo when the link holds the draft', () => {
    expect(startingProgram(encodeShare(draft.code), draft).replaced).toBeNull();
  });

  it('reports a broken link and keeps the draft', () => {
    expect(startingProgram('#code=%%%', draft)).toMatchObject({ program: draft, badLink: true });
  });

  it('does not call a heading fragment broken', () => {
    expect(startingProgram('#content', null).badLink).toBe(false);
  });
});
