'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { MosqueLamp, PlumbLine } from './QandeelOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * قنديل, closed: deep petrol night, with three mosque lamps hanging at three depths.
 *
 * OPEN: The three lamps light in sequence from near to far (140ms stagger).
 * When the light catches, the hanging assembly rises upward as the card descends.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1, y: 0 },
  open: {
    opacity: 0,
    y: -80,
    transition: { duration: 0.5, delay: 0.75, ease: EASE },
  },
};

const LAMP_NEAR_VARIANTS: Variants = {
  closed: { opacity: 0.4 },
  open: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: EASE } },
};

const LAMP_MID_VARIANTS: Variants = {
  closed: { opacity: 0.3 },
  open: { opacity: 0.85, transition: { duration: 0.3, delay: 0.24, ease: EASE } },
};

const LAMP_FAR_VARIANTS: Variants = {
  closed: { opacity: 0.2 },
  open: { opacity: 0.65, transition: { duration: 0.3, delay: 0.38, ease: EASE } },
};

export function QandeelCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    onOpen();
  };

  return (
    <motion.div
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-6 pt-4 sm:pt-8 text-inv-ink"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      initial="closed"
      animate={opening ? 'open' : 'closed'}
      exit="open"
      variants={CONTAINER_VARIANTS}
    >
      {/* 3 Hung Lamps at 3 Depths: Far, Mid, Near */}
      <div className="relative w-full max-w-[380px] h-[180px] sm:h-[240px] flex justify-center items-start pt-1">
        {/* Far lamp (left, 60px drop) */}
        <motion.div
          className="absolute -start-2 top-0 flex flex-col items-center"
          variants={LAMP_FAR_VARIANTS}
        >
          <PlumbLine length={60} />
          <MosqueLamp size={60} lit={opening} />
        </motion.div>

        {/* Mid lamp (right, 80px drop) */}
        <motion.div
          className="absolute -end-2 top-0 flex flex-col items-center"
          variants={LAMP_MID_VARIANTS}
        >
          <PlumbLine length={80} />
          <MosqueLamp size={70} lit={opening} />
        </motion.div>

        {/* Near hero lamp (center, 20px drop) */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          variants={LAMP_NEAR_VARIANTS}
        >
          <PlumbLine length={20} />
          <MosqueLamp size={104} lit={opening} />
        </motion.div>
      </div>

      {/* Couple's names sitting in night silence */}
      <main className="relative z-10 my-auto text-center px-4">
        {copy.familiesPrefix ? (
          <p className="mb-2 sm:mb-3 font-inv-body text-xs text-inv-muted tracking-wider">
            {copy.familiesPrefix}
          </p>
        ) : null}

        <h1 className="font-inv-display text-3xl sm:text-4xl font-bold leading-tight text-inv-ink text-balance">
          <span className="block">{view.name1}</span>
          <span className="my-1 block text-xl sm:text-2xl text-inv-accent font-normal" aria-hidden="true">
            {copy.nameSeparator}
          </span>
          <span className="block">{view.name2}</span>
        </h1>

        <p className="mt-2 sm:mt-3 font-inv-body text-[11px] sm:text-xs uppercase tracking-widest text-inv-accent">
          {copy.eventName[view.eventType]}
        </p>

        <p className="mt-2 sm:mt-3 font-inv-body text-xs sm:text-sm text-inv-muted leading-relaxed text-pretty">
          {copy.inviteLine[view.eventType]}
        </p>
      </main>

      {/* Hairline-ruled accent bar open button */}
      <footer className="relative z-10 w-full max-w-[300px] pb-1 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press w-full rounded border border-inv-accent/70 bg-inv-panel/60 py-2.5 sm:py-3 font-inv-body text-xs sm:text-sm font-medium text-inv-accent transition hover:bg-inv-panel active:scale-95"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
