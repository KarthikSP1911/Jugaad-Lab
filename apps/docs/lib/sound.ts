/** One tone that slides from `from` to `to` hertz; `at` and `length` are in seconds. */
export interface Note {
  from: number;
  to: number;
  at: number;
  length: number;
  wave: OscillatorType;
}

export const SOUNDS = {
  chirp: [
    { from: 1500, to: 2600, at: 0, length: 0.08, wave: 'sine' },
    { from: 2100, to: 1400, at: 0.1, length: 0.12, wave: 'sine' },
  ],
  run: [{ from: 420, to: 880, at: 0, length: 0.14, wave: 'triangle' }],
  success: [
    { from: 660, to: 660, at: 0, length: 0.1, wave: 'triangle' },
    { from: 880, to: 880, at: 0.1, length: 0.1, wave: 'triangle' },
    { from: 1320, to: 1320, at: 0.2, length: 0.22, wave: 'triangle' },
  ],
  error: [
    { from: 330, to: 250, at: 0, length: 0.16, wave: 'square' },
    { from: 240, to: 160, at: 0.18, length: 0.26, wave: 'square' },
  ],
  stop: [{ from: 520, to: 220, at: 0, length: 0.22, wave: 'triangle' }],
} satisfies Record<string, readonly Note[]>;

export type SoundName = keyof typeof SOUNDS;

export type AudioTarget = Pick<
  AudioContext,
  'currentTime' | 'destination' | 'createOscillator' | 'createGain'
>;

const VOLUME = 0.08;
/** Square waves sound much louder than the others at the same gain. */
const SQUARE_VOLUME = 0.04;
const ATTACK = 0.01;
const SILENT = 0.0001;

export function play(context: AudioTarget, name: SoundName): void {
  for (const { from, to, at, length, wave } of SOUNDS[name]) {
    const start = context.currentTime + at;
    const end = start + length;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, end);
    // Ramps at both ends avoid clicks.
    gain.gain.setValueAtTime(SILENT, start);
    gain.gain.exponentialRampToValueAtTime(
      wave === 'square' ? SQUARE_VOLUME : VOLUME,
      start + ATTACK,
    );
    gain.gain.exponentialRampToValueAtTime(SILENT, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end);
  }
}
