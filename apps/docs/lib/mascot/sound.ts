/** One syllable that slides from `from` to `to` hertz; `at` and `length` are in seconds. */
export interface Note {
  from: number;
  to: number;
  at: number;
  length: number;
  wave: OscillatorType;
  /** Wobbles the pitch `rate` times a second, by up to `depth` hertz: the parrot's warble. */
  vibrato?: { rate: number; depth: number };
  /** Centre of a band-pass filter, which gives a nasal, beak-like voice. */
  band?: number;
}

export const SOUNDS = {
  chirp: [
    { from: 1400, to: 2500, at: 0, length: 0.08, wave: 'sine' },
    { from: 2200, to: 1500, at: 0.1, length: 0.11, wave: 'sine' },
  ],
  whistle: [
    {
      from: 1100,
      to: 1900,
      at: 0,
      length: 0.28,
      wave: 'sine',
      vibrato: { rate: 18, depth: 70 },
    },
  ],
  tweet: [
    { from: 1900, to: 2400, at: 0, length: 0.06, wave: 'triangle', band: 2200 },
    { from: 1900, to: 2400, at: 0.09, length: 0.06, wave: 'triangle', band: 2200 },
    { from: 2300, to: 1700, at: 0.18, length: 0.1, wave: 'triangle', band: 2000 },
  ],
  success: [
    { from: 880, to: 990, at: 0, length: 0.1, wave: 'triangle', band: 1400 },
    { from: 1180, to: 1320, at: 0.12, length: 0.1, wave: 'triangle', band: 1700 },
    {
      from: 1500,
      to: 1980,
      at: 0.24,
      length: 0.26,
      wave: 'sine',
      vibrato: { rate: 22, depth: 90 },
    },
  ],
  error: [
    {
      from: 620,
      to: 430,
      at: 0,
      length: 0.18,
      wave: 'triangle',
      band: 900,
      vibrato: { rate: 34, depth: 60 },
    },
    {
      from: 480,
      to: 300,
      at: 0.2,
      length: 0.24,
      wave: 'triangle',
      band: 700,
      vibrato: { rate: 30, depth: 45 },
    },
  ],
  stop: [{ from: 1300, to: 620, at: 0, length: 0.22, wave: 'sine' }],
} satisfies Record<string, readonly Note[]>;

export type SoundName = keyof typeof SOUNDS;

/** What Mithu says when clicked, one after another. */
export const CHIRPS = ['chirp', 'whistle', 'tweet'] as const satisfies readonly SoundName[];

export const LEVELS = ['soft', 'loud', 'off'] as const;

export type Level = (typeof LEVELS)[number];

export const VOLUMES: Record<Exclude<Level, 'off'>, number> = { soft: 0.07, loud: 0.16 };

/** Reads a saved choice. Anything but `loud` or `off`, such as the older `on`, is soft. */
export function parseLevel(stored: string | null): Level {
  return stored === 'loud' || stored === 'off' ? stored : 'soft';
}

export function nextLevel(level: Level): Level {
  return LEVELS[(LEVELS.indexOf(level) + 1) % LEVELS.length] ?? 'soft';
}

/** How long a sound lasts, in seconds. */
export function duration(name: SoundName): number {
  return Math.max(...SOUNDS[name].map(({ at, length }) => at + length));
}

export type AudioTarget = Pick<
  AudioContext,
  | 'currentTime'
  | 'destination'
  | 'createOscillator'
  | 'createGain'
  | 'createBiquadFilter'
  | 'createDelay'
>;

const ATTACK = 0.02;
const SILENT = 0.0001;
/** A note settles to this share of its peak, then fades, which sounds less abrupt. */
const SUSTAIN = { level: 0.6, until: 0.7 };
/** A quiet, pure octave above makes a tone sound less like a beep. */
const HARMONIC = { ratio: 2, share: 0.12 };
const SHARPNESS = 1.4;
/** Takes the harsh top off every voice. */
const SOFTEN_ABOVE = 6000;
/** One faint, quick repeat, like a small room. */
const ECHO = { after: 0.075, share: 0.16 };

export function play(context: AudioTarget, name: SoundName, volume: number): void {
  const notes: readonly Note[] = SOUNDS[name];
  const output = context.createBiquadFilter();
  output.type = 'lowpass';
  output.frequency.setValueAtTime(SOFTEN_ABOVE, context.currentTime);
  output.connect(context.destination);

  for (const { from, to, at, length, wave, vibrato, band } of notes) {
    const start = context.currentTime + at;
    const end = start + length;

    const envelope = context.createGain();
    // Ramps at both ends avoid clicks.
    envelope.gain.setValueAtTime(SILENT, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + ATTACK);
    envelope.gain.exponentialRampToValueAtTime(
      volume * SUSTAIN.level,
      start + length * SUSTAIN.until,
    );
    envelope.gain.exponentialRampToValueAtTime(SILENT, end);
    envelope.connect(output);

    let input: AudioNode = envelope;
    if (band !== undefined) {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(band, start);
      filter.Q.setValueAtTime(SHARPNESS, start);
      filter.connect(envelope);
      input = filter;
    }

    const voice = (ratio: number, share: number, shape: OscillatorType) => {
      const oscillator = context.createOscillator();
      const mix = context.createGain();
      oscillator.type = shape;
      oscillator.frequency.setValueAtTime(from * ratio, start);
      oscillator.frequency.exponentialRampToValueAtTime(to * ratio, end);
      mix.gain.setValueAtTime(share, start);
      oscillator.connect(mix);
      mix.connect(input);
      oscillator.start(start);
      oscillator.stop(end);
      return oscillator;
    };

    const main = voice(1, 1, wave);
    voice(HARMONIC.ratio, HARMONIC.share, 'sine');

    if (vibrato) {
      const wobble = context.createOscillator();
      const depth = context.createGain();
      wobble.frequency.setValueAtTime(vibrato.rate, start);
      depth.gain.setValueAtTime(vibrato.depth, start);
      wobble.connect(depth);
      depth.connect(main.frequency);
      wobble.start(start);
      wobble.stop(end);
    }
  }

  const delay = context.createDelay();
  delay.delayTime.setValueAtTime(ECHO.after, context.currentTime);
  const echo = context.createGain();
  echo.gain.setValueAtTime(ECHO.share, context.currentTime);
  output.connect(delay);
  delay.connect(echo);
  echo.connect(context.destination);
}
