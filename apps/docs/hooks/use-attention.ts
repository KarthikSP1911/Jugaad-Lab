'use client';

import { useEffect, useState, type RefObject } from 'react';

const SLEEP_MS = 30_000;
/** How far a pupil can travel, in the drawing's own units. */
const REACH = 2.4;
/** Pointer distance in pixels at which the pupil is halfway there. */
const EASE = 80;

/**
 * Makes Mithu notice the visitor: his pupils follow the pointer, through CSS
 * variables on `target`, and he dozes off after a quiet spell. Returns whether he
 * is asleep. Does nothing for visitors who prefer reduced motion.
 */
export function useAttention(target: RefObject<HTMLElement | null>, flip: boolean, busy: boolean) {
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    let frame = 0;
    let pointer = { x: 0, y: 0 };

    function look() {
      frame = 0;
      const element = target.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      const x = pointer.x - (box.left + box.width / 2);
      const y = pointer.y - (box.top + box.height / 3);
      const scale = REACH / (Math.hypot(x, y) + EASE);
      // A flipped drawing mirrors the movement, so mirror it back.
      element.style.setProperty('--look-x', `${(flip ? -x : x) * scale}px`);
      element.style.setProperty('--look-y', `${y * scale}px`);
    }

    function wake() {
      setAsleep(false);
      window.clearTimeout(timer);
      if (!busy) timer = window.setTimeout(() => setAsleep(true), SLEEP_MS);
    }

    function move(event: PointerEvent) {
      pointer = { x: event.clientX, y: event.clientY };
      frame ||= window.requestAnimationFrame(look);
      wake();
    }

    wake();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, [target, flip, busy]);

  return asleep && !busy;
}
