'use client';

import { motion } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Mood } from '../lib/mascot';
import { Parrot } from './parrot';
import { useSound } from './sound';

const TALK_MS = 900;
const AUTO_MS = 4_500;

interface Props {
  mood: Mood;
  line: string;
  /** Shown under the line until Mithu is clicked. */
  advice?: string;
  /** Said one after another on each click. */
  tips: readonly string[];
  size?: number;
  /** Says the tips on its own, pausing while pointed at or focused. */
  auto?: boolean;
  /** Puts the parrot on the right, facing its speech bubble. */
  reverse?: boolean;
}

export function Mascot(props: Props) {
  const { mood, line, advice, tips, size = 96, auto = false, reverse = false } = props;
  const { play } = useSound();
  const [tip, setTip] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const current = `${line}\n${advice ?? ''}`;
  const [seen, setSeen] = useState(current);
  const next = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const [held, setHeld] = useState(false);

  // A new line from the page replaces whatever Mithu was saying.
  if (seen !== current) {
    setSeen(current);
    setTip(null);
    setTalking(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function speak(aloud: boolean) {
    if (aloud) play('chirp');
    setTip(tips[next.current % tips.length] ?? null);
    next.current += 1;
    setTalking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTalking(false), TALK_MS);
  }

  const autoSpeak = useEffectEvent(() => {
    // Chirps for one round of tips only, so a page left open goes quiet.
    if (!held && !document.hidden) speak(next.current < tips.length);
  });

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => autoSpeak(), AUTO_MS);
    return () => window.clearInterval(interval);
  }, [auto]);

  const text = tip ?? line;

  return (
    <div
      className={`mascot${auto ? ' mascot-auto' : ''}${reverse ? ' mascot-reverse' : ''}`}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <button
        type="button"
        className="mascot-button"
        onClick={() => speak(true)}
        aria-label="Talk to Mithu"
      >
        <Parrot mood={talking ? 'talking' : mood} size={size} />
      </button>
      {/* Unprompted lines are not announced, so screen readers are not interrupted. */}
      <p className="bubble" aria-live={auto && !held ? 'off' : 'polite'}>
        <motion.span
          data-reveal
          key={text}
          className="block"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {text}
          {!tip && advice && <span className="bubble-tip">Tip: {advice}</span>}
        </motion.span>
      </p>
    </div>
  );
}
