'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
  WaxSeal,
  LAID_PAPER_TILE,
  WAX_SEAL_LEFT,
  WAX_SEAL_RIGHT,
} from './ZarfOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * الظرف, closed: the envelope back side up.
 *
 * Flap diagonals meet at the center under an authentic wax seal, with the family
 * address written across the envelope face as if inscribed by hand.
 *
 * OPEN: The seal breaks and parts, the four envelope flaps swing outward,
 * revealing the folded letter underneath.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.4, delay: 0.75, ease: EASE } },
};

const FLAP_TOP_VARIANTS: Variants = {
  closed: { rotateX: 0, opacity: 1 },
  open: {
    rotateX: -110,
    opacity: 0,
    transition: { duration: 0.52, delay: 0.1, ease: EASE },
  },
};

const FLAP_BOTTOM_VARIANTS: Variants = {
  closed: { rotateX: 0, opacity: 1 },
  open: {
    rotateX: 110,
    opacity: 0,
    transition: { duration: 0.52, delay: 0.16, ease: EASE },
  },
};

const FLAP_LEFT_VARIANTS: Variants = {
  closed: { rotateY: 0, opacity: 1 },
  open: {
    rotateY: -110,
    opacity: 0,
    transition: { duration: 0.52, delay: 0.22, ease: EASE },
  },
};

const FLAP_RIGHT_VARIANTS: Variants = {
  closed: { rotateY: 0, opacity: 1 },
  open: {
    rotateY: 110,
    opacity: 0,
    transition: { duration: 0.52, delay: 0.28, ease: EASE },
  },
};

/**
 * The two halves are mounted from the first paint but invisible until the break, and the
 * intact seal above them carries the resting look — its highlight arc, its debossed ring
 * and the monogram. Mounting them only when the card opens is what used to deadlock the
 * exit, so nothing here may appear or disappear from the tree; it only changes opacity.
 */
const WHOLE_SEAL_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.01 } },
};

const SEAL_LEFT_VARIANTS: Variants = {
  closed: { x: 0, y: 0, rotate: 0, opacity: 0 },
  open: {
    x: -24,
    y: 35,
    rotate: -14,
    opacity: [1, 1, 0],
    transition: { duration: 0.5, ease: EASE },
  },
};

const SEAL_RIGHT_VARIANTS: Variants = {
  closed: { x: 0, y: 0, rotate: 0, opacity: 0 },
  open: {
    x: 24,
    y: 35,
    rotate: 14,
    opacity: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function ZarfCover({
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

  const monogram = `${view.name1[0] || ''}\u00b7${view.name2[0] || ''}`;

  return (
    <motion.div
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-4 pt-4 sm:pt-8 text-inv-ink"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      initial="closed"
      /*
        `animate` must not chase the same variant `exit` uses.

        This was animate={opening ? 'open' : 'closed'} beside exit="open". Tapping the
        button set `opening`, so the cover animated itself all the way to the open
        variant; AnimatePresence then marked it exiting and asked for that same variant,
        found the element already sitting on it, and never received a completion for an
        animation that had nothing left to do. In `wait` mode that means the card is
        never mounted, so the invitation could be tapped but never opened.

        The exit prop is the whole mechanism. `opening` stays because it still drives the
        content swap, but it no longer touches the animation.
      */
      animate="closed"
      exit="open"
      variants={CONTAINER_VARIANTS}
    >
      {/* Background laid-paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: LAID_PAPER_TILE }}
        aria-hidden="true"
      />

      {/* Hand-addressed envelope face header */}
      <header className="relative z-10 w-full max-w-[420px] text-center pt-1">
        {copy.familiesPrefix ? (
          <p className="font-inv-body text-xs tracking-wider text-inv-muted">
            {copy.familiesPrefix}
          </p>
        ) : null}
        <h1 className="mt-1.5 font-inv-display text-xl sm:text-2xl text-inv-ink text-balance font-medium">
          {view.name1} {copy.nameSeparator} {view.name2}
        </h1>
        <p className="mt-1 font-inv-body text-[11px] uppercase tracking-widest text-inv-accent">
          {copy.eventName[view.eventType]}
        </p>
      </header>

      {/* Main Envelope Body with 4 folding flap diagonals and wax seal */}
      <div
        className="relative z-10 my-auto flex h-[240px] sm:h-[300px] w-full max-w-[380px] items-center justify-center rounded border border-inv-line/50 bg-inv-panel shadow-md"
        style={{ perspective: 1000 }}
      >
        {/* Flap lines (4 diagonals meeting at center) */}
        <svg
          viewBox="0 0 420 340"
          fill="none"
          className="pointer-events-none absolute inset-0 h-full w-full stroke-inv-line/60"
        >
          <line x1="0" y1="0" x2="210" y2="170" strokeWidth="1.2" />
          <line x1="420" y1="0" x2="210" y2="170" strokeWidth="1.2" />
          <line x1="0" y1="340" x2="210" y2="170" strokeWidth="1.2" />
          <line x1="420" y1="340" x2="210" y2="170" strokeWidth="1.2" />
        </svg>

        {/* Animated Flap panels */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 origin-top bg-inv-panel/40"
          variants={FLAP_TOP_VARIANTS}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-inv-panel/40"
          variants={FLAP_BOTTOM_VARIANTS}
        />
        <motion.div
          className="absolute inset-y-0 start-0 w-1/2 origin-left bg-inv-panel/30"
          variants={FLAP_LEFT_VARIANTS}
        />
        <motion.div
          className="absolute inset-y-0 end-0 w-1/2 origin-right bg-inv-panel/30"
          variants={FLAP_RIGHT_VARIANTS}
        />

        {/*
          The wax seal, in two halves that are always mounted.

          This used to render a whole WaxSeal while closed and swap it for the two halves
          the moment `opening` went true — which is to say it mounted new motion children
          into a subtree that AnimatePresence had already begun exiting. Those children
          have no closed state to leave, so the exit never resolved and the card was never
          mounted: this design could be tapped but not opened.

          Both halves are here from the first paint instead. At rest they meet on the
          centre fold and read as one seal; on exit they break apart and fall, which is
          the moment the theme is built around. The monogram sits over the join and goes
          with them.
        */}
        <div className="relative z-20 flex items-center justify-center">
          <div className="relative h-[104px] w-[104px]">
            <motion.svg
              viewBox="0 0 132 132"
              fill="none"
              className="absolute inset-0 h-full w-full drop-shadow-[0_2px_4px_rgba(46,43,36,0.18)]"
              variants={SEAL_LEFT_VARIANTS}
              aria-hidden="true"
            >
              <path d={WAX_SEAL_LEFT} fill="var(--inv-accent)" />
            </motion.svg>
            <motion.svg
              viewBox="0 0 132 132"
              fill="none"
              className="absolute inset-0 h-full w-full drop-shadow-[0_2px_4px_rgba(46,43,36,0.18)]"
              variants={SEAL_RIGHT_VARIANTS}
              aria-hidden="true"
            >
              <path d={WAX_SEAL_RIGHT} fill="var(--inv-accent)" />
            </motion.svg>

            <motion.div
              className="absolute inset-0"
              variants={WHOLE_SEAL_VARIANTS}
              aria-hidden="true"
            >
              <WaxSeal monogram={monogram} size={104} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer with Open Button */}
      <footer className="relative z-10 pb-1 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press rounded-full border border-inv-accent/70 bg-inv-panel px-7 py-2.5 sm:px-8 sm:py-3 font-inv-body text-xs sm:text-sm font-medium text-inv-ink shadow-sm transition hover:bg-inv-panel/80 active:scale-95"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
