import { describe, expect, it, vi } from 'vitest';
import { play, SOUNDS, type AudioTarget, type SoundName } from '../lib/sound';

const names = Object.keys(SOUNDS) as SoundName[];

function fakeAudio() {
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const oscillators: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
  const context = {
    currentTime: 2,
    destination: {},
    createGain: () => ({ gain: param(), connect: vi.fn() }),
    createOscillator: () => {
      const oscillator = { frequency: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      oscillators.push(oscillator);
      return oscillator;
    },
  };
  return { context: context as unknown as AudioTarget, oscillators };
}

describe('sound', () => {
  it.each(names)('%s has playable notes', (name) => {
    for (const { from, to, at, length } of SOUNDS[name]) {
      // Exponential ramps need positive values.
      expect(Math.min(from, to, length)).toBeGreaterThan(0);
      expect(at).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(names)('%s schedules each note from the current time', (name) => {
    const { context, oscillators } = fakeAudio();
    play(context, name);
    expect(oscillators).toHaveLength(SOUNDS[name].length);
    SOUNDS[name].forEach(({ at, length }, index) => {
      expect(oscillators[index]?.start).toHaveBeenCalledWith(2 + at);
      expect(oscillators[index]?.stop).toHaveBeenCalledWith(2 + at + length);
    });
  });
});
