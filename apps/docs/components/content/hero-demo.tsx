'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useDictionary } from '../ui/locale';
import { EASE } from '../ui/motion';

/** The sample program, followed by its output arriving line by line. */
export function HeroDemo({ code, output }: { code: ReactNode; output: string[] }) {
  const t = useDictionary();
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
    >
      {code}
      <div className="demo-output" aria-label={t.code.sampleOutput}>
        <span className="text-muted">{t.code.output}</span>
        {output.map((line, index) => (
          <motion.span
            data-reveal
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.35, ease: EASE }}
          >
            {line}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
