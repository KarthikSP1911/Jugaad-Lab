import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index.js';
import manifest from '../package.json' with { type: 'json' };

describe('core package', () => {
  it('exports the version declared in package.json', () => {
    expect(VERSION).toBe(manifest.version);
  });
});
