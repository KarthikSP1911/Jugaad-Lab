import { describe, expect, it, vi } from 'vitest';
import {
  CHIRPS,
  duration,
  LEVELS,
  nextLevel,
  parseLevel,
  play,
  SOUNDS,
  VOLUMES,
  type AudioTarget,
  type Note,
  type SoundName,
} from '../../lib/mascot/sound';

const names = Object.keys(SOUNDS) as SoundName[];

function fakeAudio() {
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const oscillators: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
  const gains: ReturnType<typeof param>[] = [];
  const context = {
    currentTime: 2,
    destination: {},
    createGain: () => {
      const gain = param();
      gains.push(gain);
      return { gain, connect: vi.fn() };
    },
    createBiquadFilter: () => ({ frequency: param(), Q: param(), connect: vi.fn() }),
    createDelay: () => ({ delayTime: param(), connect: vi.fn() }),
    createOscillator: () => {
      const oscillator = { frequency: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      oscillators.push(oscillator);
      return oscillator;
    },
  };
  return { context: context as unknown as AudioTarget, oscillators, gains };
}

describe('sound', () => {
  it.each(names)('%s has playable notes', (name) => {
    for (const { from, to, at, length } of SOUNDS[name]) {
      // Exponential ramps need positive values.
      expect(Math.min(from, to, length)).toBeGreaterThan(0);
      expect(at).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(names)('%s starts and stops every voice within its duration', (name) => {
    const { context, oscillators } = fakeAudio();
    play(context, name, VOLUMES.soft);
    const notes: readonly Note[] = SOUNDS[name];
    const voices = notes.reduce((count, note) => count + (note.vibrato ? 3 : 2), 0);
    expect(oscillators).toHaveLength(voices);
    for (const { start, stop } of oscillators) {
      expect(start.mock.calls[0]?.[0]).toBeGreaterThanOrEqual(2);
      expect(stop.mock.calls[0]?.[0]).toBeLessThanOrEqual(2 + duration(name) + 1e-9);
    }
  });

  it('peaks at the volume it is given', () => {
    const { context, gains } = fakeAudio();
    play(context, 'stop', VOLUMES.loud);
    expect(gains[0]?.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      VOLUMES.loud,
      expect.any(Number),
    );
  });

  it('is quieter when soft', () => {
    expect(VOLUMES.soft).toBeLessThan(VOLUMES.loud);
  });

  it('chirps in more than one way', () => {
    expect(new Set(CHIRPS).size).toBeGreaterThan(1);
  });

  it('reads saved choices, including the older on and off', () => {
    expect(parseLevel(null)).toBe('soft');
    expect(parseLevel('on')).toBe('soft');
    expect(parseLevel('off')).toBe('off');
    expect(parseLevel('loud')).toBe('loud');
  });

  it('cycles through every level', () => {
    expect(LEVELS.map(nextLevel)).toEqual(['loud', 'off', 'soft']);
  });
});
