'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { LATTICE_TILE, LATTICE_TILE_SIZE } from './MashrabiyaOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * مشربية, closed: an opaque turned-wood window screen edge to edge.
 *
 * The couple's names sit as a faint 12% silhouette behind the lattice (rendered in
 * system fallback so webfont latency never shows an empty card).
 *
 * OPEN: The aperture opens from the center via a scaled radial CSS mask over 900ms,
 * dissolving the screen outward like opening a wooden window.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.85, ease: EASE } },
};

const APERTURE_VARIANTS: Variants = {
  closed: { scale: 1 },
  open: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.88, ease: EASE },
  },
};

export function MashrabiyaCover({
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
      {/* 1. Behind the screen: faint silhouette of couple's names (system fallback safe) */}
      <div className="pointer-events-none absolute inset-x-0 top-[12%] z-[5] flex flex-col items-center p-6 text-center select-none opacity-[0.16]">
        <span className="block font-inv-display text-4xl leading-tight sm:text-5xl text-balance">
          {view.name1}
        </span>
        <span className="my-2 block font-inv-display text-2xl">&</span>
        <span className="block font-inv-display text-4xl leading-tight sm:text-5xl text-balance">
          {view.name2}
        </span>
      </div>

      {/* 2. Opaque turned-wood lattice screen with scaling aperture mask on open */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 bg-inv-panel/95 will-change-transform"
        style={{ backgroundImage: LATTICE_TILE, backgroundSize: LATTICE_TILE_SIZE }}
        variants={APERTURE_VARIANTS}
      />

      {/* 3. Header on the lattice */}
      <header className="relative z-10 pt-1 text-center">
        <p className="font-inv-body text-xs font-semibold uppercase tracking-widest text-inv-accent">
          {copy.eventName[view.eventType]}
        </p>
      </header>

      {/* 4. Central Aperture Preview Hint */}
      <main className="relative z-10 my-auto text-center px-4">
        <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 border-inv-accent/60 bg-inv-bg/90 shadow-lg">
          <span className="font-inv-display text-lg sm:text-xl font-bold text-inv-accent">
            {view.name1[0]} & {view.name2[0]}
          </span>
        </div>
        <p className="mt-4 sm:mt-6 font-inv-body text-xs sm:text-sm leading-relaxed text-inv-ink/80 text-pretty max-w-[260px] mx-auto">
          {copy.inviteLine[view.eventType]}
        </p>
      </main>

      {/* 5. Solid accent bar open button sitting firmly on the lattice */}
      <footer className="relative z-10 w-full max-w-[280px] pb-1 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press w-full rounded bg-inv-accent py-3 sm:py-3.5 font-inv-body text-xs sm:text-sm font-semibold text-inv-bg shadow-md transition hover:opacity-95 active:scale-95"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
