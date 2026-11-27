import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { CALLS, CLIP, isCall, playCall, type SampleTarget } from '../../lib/mascot/sample';
import { CHIRPS, VOLUMES } from '../../lib/mascot/sound';

/** Length of the recording, in seconds. */
const RECORDING = 4.75;

describe('recorded calls', () => {
  it('covers every chirp Mithu makes, and no other sound', () => {
    expect(CHIRPS.filter((name) => !isCall(name))).toEqual([]);
    expect(isCall('error')).toBe(false);
    expect(isCall('toString')).toBe(false);
  });

  it('ships the recording', () => {
    const file = readFileSync(new URL(`../../public${CLIP}`, import.meta.url));
    expect(file.subarray(0, 4).toString()).toBe('OggS');
  });

  it.each(Object.entries(CALLS))('%s stays within the recording', (_, { at, length }) => {
    expect(at).toBeGreaterThanOrEqual(0);
    expect(at + length).toBeLessThanOrEqual(RECORDING);
  });

  it('plays only its part, louder when asked', () => {
    const gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    const context = {
      currentTime: 1,
      destination: {},
      createGain: () => ({ gain, connect: vi.fn() }),
      createBufferSource: () => source,
    } as unknown as SampleTarget;
    const recording = {} as AudioBuffer;

    playCall(context, recording, 'tweet', VOLUMES.loud);

    expect(source.buffer).toBe(recording);
    expect(source.start).toHaveBeenCalledWith(1, CALLS.tweet.at, CALLS.tweet.length);
    expect(gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      VOLUMES.loud * 5,
      expect.any(Number),
    );
  });
});
