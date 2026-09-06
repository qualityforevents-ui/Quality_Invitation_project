'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
  EightPetalMedallion,
  SteppedMerlonBorder,
} from './KhayamiyaOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * خيامية, closed: the tent flap.
 *
 * Two madder applique panels meet on the center axis with a stitched seam.
 * OPEN: The panels part outward (translateX ±55%) like a real tent door pulled open.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.7, ease: EASE } },
};

const LEFT_FLAP_VARIANTS: Variants = {
  closed: { x: 0 },
  open: {
    x: '-55%',
    transition: { duration: 0.56, ease: EASE },
  },
};

const RIGHT_FLAP_VARIANTS: Variants = {
  closed: { x: 0 },
  open: {
    x: '55%',
    transition: { duration: 0.56, ease: EASE },
  },
};

export function KhayamiyaCover({
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
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg text-inv-ink pt-4 sm:pt-8"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      initial="closed"
      animate={opening ? 'open' : 'closed'}
      exit="open"
      variants={CONTAINER_VARIANTS}
    >
      {/* Outer Merlon edge borders */}
      <SteppedMerlonBorder side="left" />
      <SteppedMerlonBorder side="right" />

      {/* Two parting tent flap panels */}
      <div className="absolute inset-0 z-0 flex overflow-hidden">
        {/* Left Flap */}
        <motion.div
          className="relative h-full w-1/2 border-e border-dashed border-inv-ink/80 bg-inv-bg"
          variants={LEFT_FLAP_VARIANTS}
        >
          <div className="absolute top-[74%] -end-[90px] -translate-y-1/2 opacity-30">
            <EightPetalMedallion size={180} />
          </div>
        </motion.div>

        {/* Right Flap */}
        <motion.div
          className="relative h-full w-1/2 border-s border-dashed border-inv-ink/80 bg-inv-bg"
          variants={RIGHT_FLAP_VARIANTS}
        >
          <div className="absolute top-[74%] -start-[90px] -translate-y-1/2 opacity-30">
            <EightPetalMedallion size={180} />
          </div>
        </motion.div>
      </div>

      {/* Header banner */}
      <header className="relative z-10 w-full pt-4 sm:pt-6 text-center">
        <p className="font-inv-body text-xs font-semibold tracking-widest text-inv-accent uppercase">
          {copy.eventName[view.eventType]}
        </p>
      </header>

      {/* Central Names sitting across the tent join */}
      <main className="relative z-10 my-auto px-6 text-center">
        {copy.familiesPrefix ? (
          <p className="mb-2 sm:mb-3 font-inv-body text-xs text-inv-muted">
            {copy.familiesPrefix}
          </p>
        ) : null}

        <h1 className="font-inv-display text-3xl sm:text-4xl font-bold leading-tight text-inv-ink text-balance drop-shadow-sm">
          <span className="block">{view.name1}</span>
          <span className="my-1 block text-xl sm:text-2xl text-inv-accent" aria-hidden="true">
            {copy.nameSeparator}
          </span>
          <span className="block">{view.name2}</span>
        </h1>

        <p className="mt-3 sm:mt-5 font-inv-body text-xs sm:text-sm text-inv-muted leading-relaxed text-pretty">
          {copy.inviteLine[view.eventType]}
        </p>
      </main>

      {/* Footer with Solid Gold Open Bar */}
      <footer className="relative z-10 w-full pb-2 sm:pb-4 px-6 flex justify-center">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press w-full max-w-[280px] rounded bg-inv-accent py-3 sm:py-3.5 font-inv-body text-sm sm:text-base font-bold text-inv-bg shadow-md transition hover:brightness-105 active:scale-95"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
