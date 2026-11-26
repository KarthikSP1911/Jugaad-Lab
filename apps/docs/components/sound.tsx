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
import { play, type SoundName } from '../lib/sound';
import { useDictionary } from './locale';

const STORAGE_KEY = 'sound';

interface Sound {
  muted: boolean;
  toggle: () => void;
  /** Call from a click or key press first: browsers block audio before one. */
  play: (name: SoundName) => void;
}

const SoundContext = createContext<Sound>({ muted: false, toggle: () => {}, play: () => {} });

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  // A ref too, so callbacks captured before a toggle still see the new choice.
  const silenced = useRef(false);
  const audio = useRef<AudioContext | null>(null);

  const apply = useCallback((next: boolean) => {
    silenced.current = next;
    setMuted(next);
  }, []);

  const emit = useCallback((name: SoundName) => {
    // Automatic callers can run before the visitor has clicked or typed.
    if (silenced.current || navigator.userActivation?.hasBeenActive === false) return;
    try {
      audio.current ??= new AudioContext();
      if (audio.current.state === 'suspended') void audio.current.resume();
      play(audio.current, name);
    } catch {
      // Sound is decoration, so a browser without audio stays silent.
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !silenced.current;
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'off' : 'on');
    } catch {
      // Storage can be blocked; the choice then lasts for this visit only.
    }
    if (!next) emit('chirp');
  }, [apply, emit]);

  useEffect(() => {
    function load() {
      try {
        apply(localStorage.getItem(STORAGE_KEY) === 'off');
      } catch {
        // Without storage, sound stays on.
      }
    }
    load();
    return () => {
      void audio.current?.close();
      audio.current = null;
    };
  }, [apply]);

  return <SoundContext value={{ muted, toggle, play: emit }}>{children}</SoundContext>;
}

export function SoundToggle() {
  const { muted, toggle } = useSound();
  const { header } = useDictionary();
  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggle}
      aria-label={header.sound}
      aria-pressed={!muted}
      title={muted ? header.soundOff : header.soundOn}
    >
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
        {muted ? <path d="m16 9 6 6m0-6-6 6" /> : <path d="M16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />}
      </svg>
    </button>
  );
}
