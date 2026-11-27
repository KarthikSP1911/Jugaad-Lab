'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CLIP, isCall, playCall } from '../../lib/mascot/sample';
import {
  nextLevel,
  parseLevel,
  play,
  VOLUMES,
  type Level,
  type SoundName,
} from '../../lib/mascot/sound';
import { useDictionary } from '../ui/locale';

const STORAGE_KEY = 'sound';

interface Sound {
  level: Level;
  /** Moves to the next level: soft, loud, off. */
  cycle: () => void;
  /** Call from a click or key press first: browsers block audio before one. */
  play: (name: SoundName) => void;
}

const SoundContext = createContext<Sound>({ level: 'soft', cycle: () => {}, play: () => {} });

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Level>('soft');
  // A ref too, so callbacks captured before a change still see the new choice.
  const chosen = useRef<Level>('soft');
  const audio = useRef<AudioContext | null>(null);
  /** Fetched on the first chirp; `null` when it cannot be loaded or decoded. */
  const recording = useRef<Promise<AudioBuffer | null> | null>(null);

  const apply = useCallback((next: Level) => {
    chosen.current = next;
    setLevel(next);
  }, []);

  const emit = useCallback((name: SoundName) => {
    const current = chosen.current;
    // Automatic callers can run before the visitor has clicked or typed.
    if (current === 'off' || navigator.userActivation?.hasBeenActive === false) return;
    try {
      audio.current ??= new AudioContext();
      if (audio.current.state === 'suspended') void audio.current.resume();
      const context = audio.current;
      const volume = VOLUMES[current];
      if (!isCall(name)) {
        play(context, name, volume);
        return;
      }
      recording.current ??= fetch(CLIP)
        .then((response) => response.arrayBuffer())
        .then((data) => context.decodeAudioData(data))
        .catch(() => null);
      void recording.current.then((buffer) => {
        // The synthesised chirp stands in where the recording will not play.
        if (buffer) playCall(context, buffer, name, volume);
        else play(context, name, volume);
      });
    } catch {
      // Sound is decoration, so a browser without audio stays silent.
    }
  }, []);

  const cycle = useCallback(() => {
    const next = nextLevel(chosen.current);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice then lasts for this visit only.
    }
    // Lets the visitor hear the new level.
    emit('chirp');
  }, [apply, emit]);

  useEffect(() => {
    function load() {
      try {
        apply(parseLevel(localStorage.getItem(STORAGE_KEY)));
      } catch {
        // Without storage, sound stays soft.
      }
    }
    load();
    return () => {
      void audio.current?.close();
      audio.current = null;
      recording.current = null;
    };
  }, [apply]);

  return <SoundContext value={{ level, cycle, play: emit }}>{children}</SoundContext>;
}

const WAVES: Record<Level, string> = {
  soft: 'M16 9a4 4 0 0 1 0 6',
  loud: 'M16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12',
  off: 'm16 9 6 6m0-6-6 6',
};

export function SoundToggle() {
  const { level, cycle } = useSound();
  const { header } = useDictionary();
  const label = header.soundLevel[level];
  return (
    <button type="button" className="icon-button" onClick={cycle} aria-label={label} title={label}>
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
        <path d={WAVES[level]} />
      </svg>
    </button>
  );
}
