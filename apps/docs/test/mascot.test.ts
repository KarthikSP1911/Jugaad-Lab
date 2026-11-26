import { describe, expect, it } from 'vitest';
import { REACTIONS, TIPS } from '../lib/mascot';
import { SOUNDS } from '../lib/sound';

describe('mascot', () => {
  it('has both languages for every line', () => {
    const lines = [...Object.values(REACTIONS).map(({ line }) => line), ...TIPS];
    for (const { hi, en } of lines) {
      expect(hi).not.toBe('');
      expect(en).not.toBe('');
    }
  });

  it('only asks for sounds that exist', () => {
    for (const { sound } of Object.values(REACTIONS)) {
      if (sound) expect(SOUNDS).toHaveProperty(sound);
    }
  });

  it('cheers on success and worries on every failure', () => {
    expect(REACTIONS.ok.mood).toBe('happy');
    for (const status of ['compile-error', 'runtime-error', 'stopped'] as const) {
      expect(REACTIONS[status].mood).toBe('worried');
    }
  });

  it('stays quiet before anything has run', () => {
    expect(REACTIONS.idle.sound).toBeNull();
  });
});
