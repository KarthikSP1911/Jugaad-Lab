'use client';

import { MotionConfig, motion } from 'motion/react';
import type { ReactNode } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Turns movement off for people who ask their system for reduced motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Fades content up the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
