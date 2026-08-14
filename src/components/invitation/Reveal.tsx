'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Slow and unhurried. A card that snaps into place reads as a web page, not a card. */
const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /**
   * True for the sections already on screen when the card opens, which animate at
   * once. Everything further down waits until it is scrolled to, which doubles as the
   * lazy reveal the spec asks for below the fold.
   */
  immediate?: boolean;
}) {
  const animation = {
    initial: { opacity: 0, y: 18 },
    transition: { duration: 0.75, delay, ease: EASE },
  };

  if (immediate) {
    return (
      <motion.div className={className} {...animation} animate={{ opacity: 1, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      {...animation}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
