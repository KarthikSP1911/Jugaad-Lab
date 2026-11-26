'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Mood } from '../lib/mascot';
import { Parrot } from './parrot';
import { useSound } from './sound';

const TALK_MS = 900;

interface Props {
  mood: Mood;
  line: string;
  /** Said one after another on each click. */
  tips: readonly string[];
  size?: number;
}

export function Mascot({ mood, line, tips, size = 96 }: Props) {
  const { play } = useSound();
  const [tip, setTip] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const [seen, setSeen] = useState(line);
  const next = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  // A new line from the page replaces whatever Mithu was saying.
  if (seen !== line) {
    setSeen(line);
    setTip(null);
    setTalking(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function speak() {
    play('chirp');
    setTip(tips[next.current % tips.length] ?? null);
    next.current += 1;
    setTalking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTalking(false), TALK_MS);
  }

  const text = tip ?? line;

  return (
    <div className="mascot">
      <button type="button" className="mascot-button" onClick={speak} aria-label="Talk to Mithu">
        <Parrot mood={talking ? 'talking' : mood} size={size} />
      </button>
      <p className="bubble" aria-live="polite">
        <motion.span
          data-reveal
          key={text}
          className="block"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {text}
        </motion.span>
      </p>
    </div>
  );
}
