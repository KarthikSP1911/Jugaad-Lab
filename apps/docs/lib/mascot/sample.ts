/** A recording of budgerigars, credited in `NOTICE`. */
export const CLIP = '/sounds/budgerigar-chirping.ogg';

/** Single calls within the recording, in seconds; Mithu says them one after another. */
export const CALLS = {
  chirp: { at: 0.52, length: 0.4 },
  whistle: { at: 2.88, length: 0.54 },
  tweet: { at: 1.4, length: 0.32 },
} as const;

export type CallName = keyof typeof CALLS;

export function isCall(name: string): name is CallName {
  return Object.hasOwn(CALLS, name);
}

/** The recording is quieter than full scale, so a synthesiser volume is raised to match. */
const BOOST = 5;
const FADE = 0.02;
const SILENT = 0.0001;

export type SampleTarget = Pick<
  AudioContext,
  'currentTime' | 'destination' | 'createBufferSource' | 'createGain'
>;

export function playCall(
  context: SampleTarget,
  recording: AudioBuffer,
  name: CallName,
  volume: number,
): void {
  const { at, length } = CALLS[name];
  const start = context.currentTime;
  const end = start + length;
  const peak = Math.min(1, volume * BOOST);

  const envelope = context.createGain();
  // Fades at both ends avoid clicks where the recording is cut.
  envelope.gain.setValueAtTime(SILENT, start);
  envelope.gain.exponentialRampToValueAtTime(peak, start + FADE);
  envelope.gain.setValueAtTime(peak, end - FADE);
  envelope.gain.exponentialRampToValueAtTime(SILENT, end);
  envelope.connect(context.destination);

  const source = context.createBufferSource();
  source.buffer = recording;
  source.connect(envelope);
  source.start(start, at, length);
}
