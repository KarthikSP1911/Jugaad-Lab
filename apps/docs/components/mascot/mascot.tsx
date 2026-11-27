'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useAttention } from '../../hooks/use-attention';
import type { Mood } from '../../lib/mascot/mascot';
import { CHIRPS, duration } from '../../lib/mascot/sound';
import { useDictionary } from '../ui/locale';
import { Parrot } from './parrot';
import { useSound } from './sound';

/** The beak keeps moving at least this long, so a short chirp is still seen. */
const MIN_TALK_MS = 900;

interface Props {
  mood: Mood;
  line: string;
  /** Shown under the line until Mithu is clicked. */
  advice?: string;
  /** Said one after another on each click. */
  tips: readonly string[];
  size?: number;
  /** Faces left instead of right. */
  flip?: boolean;
  /** Never announces its lines, where the page already announces the same news. */
  quiet?: boolean;
  /** Offers a button that hides the bubble until Mithu is clicked again. */
  dismissible?: boolean;
}

export function Mascot(props: Props) {
  const {
    mood,
    line,
    advice,
    tips,
    size = 96,
    flip = false,
    quiet = false,
    dismissible = false,
  } = props;
  const { play } = useSound();
  const { mascot } = useDictionary();
  const [tip, setTip] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const current = `${line}\n${advice ?? ''}`;
  const [seen, setSeen] = useState(current);
  const next = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const button = useRef<HTMLButtonElement>(null);
  const asleep = useAttention(button, flip, mood === 'thinking');
  const [closed, setClosed] = useState(false);
  const [opened, setOpened] = useState(false);

  // A new line from the page replaces whatever Mithu was saying.
  if (seen !== current) {
    setSeen(current);
    setTip(null);
    setTalking(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function speak() {
    const chirp = CHIRPS[next.current % CHIRPS.length] ?? 'chirp';
    play(chirp);
    setClosed(false);
    setOpened(true);
    setTip(tips[next.current % tips.length] ?? null);
    next.current += 1;
    setTalking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setTalking(false),
      Math.max(MIN_TALK_MS, duration(chirp) * 1000),
    );
  }

  const text = tip ?? line;

  return (
    <div className="mascot" data-opened={opened || undefined}>
      <button
        ref={button}
        type="button"
        className="mascot-button"
        onClick={speak}
        aria-label={mascot.talk}
      >
        <Parrot pose={talking ? 'talking' : asleep ? 'sleeping' : mood} size={size} flip={flip} />
      </button>
      <AnimatePresence initial={false}>
        {!closed && (
          <motion.div
            className="bubble"
            aria-live={quiet ? 'off' : 'polite'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.span
              data-reveal
              key={text}
              className="block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {text}
              {!tip && advice && (
                <span className="bubble-tip">
                  {mascot.tip} {advice}
                </span>
              )}
            </motion.span>
            {dismissible && (
              <button
                type="button"
                className="bubble-close"
                aria-label={mascot.dismiss}
                onClick={() => {
                  setClosed(true);
                  setOpened(false);
                }}
              >
                ×
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
