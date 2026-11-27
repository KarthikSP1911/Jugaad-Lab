import { describe, expect, it } from 'vitest';
import { execute } from '../../lib/playground/execute';
import { search } from '../../lib/search/search';

const entries = [
  { title: 'Reference', section: 'Page', href: '/a', keywords: 'loops' },
  { title: 'Loops', section: 'Language tour', href: '/b' },
];

describe('search', () => {
  it('puts title matches first', () => {
    expect(search(entries, 'loops').map((entry) => entry.href)).toEqual(['/b', '/a']);
  });

  it('needs every word', () => {
    expect(search(entries, 'loops tour').map((entry) => entry.href)).toEqual(['/b']);
    expect(search(entries, 'classes')).toEqual([]);
  });
});

describe('playground messages', () => {
  it('stops in Hinglish only when asked', () => {
    const { message } = execute('jabtak (sach) { bolo(1); }', () => {}, { lang: 'hi' });
    expect(message).toMatch(/^Roka gaya/);
    expect(message).not.toContain('Stopped');
  });
});
