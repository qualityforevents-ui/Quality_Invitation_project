'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { LATTICE_TILE } from './MashrabiyaOrnaments';
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
      animate={opening ? 'open' : 'closed'}
      exit="open"
      variants={CONTAINER_VARIANTS}
    >
      {/* 1. Behind the screen: faint silhouette of couple's names (system fallback safe) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none opacity-[0.12]">
        <span className="block text-4xl sm:text-5xl font-bold font-sans">
          {view.name1}
        </span>
        <span className="my-2 block text-2xl font-sans">&</span>
        <span className="block text-4xl sm:text-5xl font-bold font-sans">
          {view.name2}
        </span>
      </div>

      {/* 2. Opaque turned-wood lattice screen with scaling aperture mask on open */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 bg-inv-panel/95 will-change-transform"
        style={{ backgroundImage: LATTICE_TILE }}
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
