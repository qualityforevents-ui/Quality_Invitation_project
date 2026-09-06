'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { COTTON_TABLE_TILE, CardTopRule } from './RizmaOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * الرزمة, closed: 5 insert cards fanned by 3° tied with an accent belly band.
 *
 * OPEN: The band slides off diagonally, and the stack deals out in sequence.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.8, ease: EASE } },
};

const BAND_VARIANTS: Variants = {
  closed: { x: 0, y: 0, opacity: 1 },
  open: {
    x: 120,
    y: -90,
    opacity: 0,
    transition: { duration: 0.38, ease: EASE },
  },
};

export function RizmaCover({
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
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-4 pt-4 sm:pt-8 text-inv-ink"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      initial="closed"
      animate={opening ? 'open' : 'closed'}
      exit="open"
      variants={CONTAINER_VARIANTS}
    >
      {/* Table cloth texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: COTTON_TABLE_TILE }}
        aria-hidden="true"
      />

      <header className="relative z-10 text-center pt-1">
        <p className="font-inv-body text-xs font-semibold uppercase tracking-widest text-inv-accent">
          {copy.eventName[view.eventType]}
        </p>
      </header>

      {/* The 5 fanned insert cards sitting on table */}
      <div className="relative z-10 my-auto flex h-[260px] sm:h-[300px] w-full max-w-[300px] items-center justify-center">
        {/* Card 5 (bottom) */}
        <div className="absolute h-[230px] w-[240px] -rotate-6 rounded border border-inv-line/50 bg-inv-panel shadow-[2px_2px_0px_rgba(38,36,31,0.18)]" />
        {/* Card 4 */}
        <div className="absolute h-[230px] w-[250px] -rotate-3 rounded border border-inv-line/50 bg-inv-panel shadow-[2px_2px_0px_rgba(38,36,31,0.18)]" />
        {/* Card 3 */}
        <div className="absolute h-[230px] w-[260px] rotate-3 rounded border border-inv-line/50 bg-inv-panel shadow-[2px_2px_0px_rgba(38,36,31,0.18)]" />
        {/* Card 2 */}
        <div className="absolute h-[230px] w-[270px] rotate-6 rounded border border-inv-line/50 bg-inv-panel shadow-[2px_2px_0px_rgba(38,36,31,0.18)]" />

        {/* Card 1 (top announcement card) */}
        <div className="relative z-10 flex h-[240px] sm:h-[260px] w-[260px] sm:w-[280px] flex-col items-center justify-center rounded border border-inv-line/60 bg-inv-panel p-4 sm:p-5 text-center shadow-[3px_3px_0px_rgba(38,36,31,0.22)]">
          <CardTopRule />

          {copy.familiesPrefix ? (
            <p className="mt-1 font-inv-body text-[11px] text-inv-muted tracking-wider">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="mt-2 font-inv-display text-2xl sm:text-3xl font-bold leading-tight text-inv-ink text-balance">
            <span className="block">{view.name1}</span>
            <span className="my-0.5 block text-base text-inv-accent font-normal" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-2 sm:mt-3 font-inv-body text-[11px] sm:text-xs text-inv-muted leading-relaxed text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          {/* Belly Band crossing diagonally */}
          <motion.div
            className="pointer-events-none absolute -inset-x-3 top-1/2 -translate-y-1/2 -rotate-12 bg-inv-accent py-2 shadow-sm text-center select-none"
            variants={BAND_VARIANTS}
          >
            <span className="font-inv-body text-[10px] font-bold tracking-widest text-inv-panel uppercase">
              {copy.eventName[view.eventType]}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Footer Open button */}
      <footer className="relative z-10 w-full max-w-[260px] pb-1 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press w-full rounded border border-inv-accent/60 bg-inv-panel py-2.5 sm:py-3 font-inv-body text-xs sm:text-sm font-semibold text-inv-accent shadow-[2px_2px_0px_rgba(38,36,31,0.18)] transition hover:bg-white active:scale-95"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
