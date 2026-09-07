'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
  CHAMFER_STYLE,
  CUT_BEVEL_CLASS,
  Cartouche,
  LIMESTONE_TILE,
} from './LawhOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * اللوح, closed: the uncut stone slab.
 *
 * CLOSED: The 130px cartouche sits in the limestone field without names.
 * OPEN: The inscription cuts itself — color darkens from panel to ink and
 * the carved bevel emerges with zero translational movement.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.9, ease: EASE } },
};

export function LawhCover({
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

  const initials = `${view.name1[0] || ''} · ${view.name2[0] || ''}`;

  return (
    <motion.div
      className="relative flex h-full max-h-full w-full flex-col items-center justify-center overflow-hidden bg-inv-bg p-3 sm:p-6 text-inv-ink"
      style={{ paddingBottom: 'calc(1rem + var(--inv-toggle-offset, 0px))' }}
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
      {/* Stone slab container with chamfered bevel border */}
      <div
        className="relative flex h-full max-h-full w-full max-w-[420px] flex-col items-center justify-between rounded-lg bg-inv-panel p-5 sm:p-8 text-center"
        style={CHAMFER_STYLE}
      >
        {/* Limestone tooth texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: LIMESTONE_TILE }}
          aria-hidden="true"
        />

        {/* Header with event tag */}
        <header className="relative z-10 pt-1 sm:pt-2">
          <p className="font-inv-body text-xs uppercase tracking-[0.25em] text-inv-accent font-semibold">
            {copy.eventName[view.eventType]}
          </p>
        </header>

        {/* Center: Cartouche with initials, and names that carve themselves on open */}
        <main className="relative z-10 my-auto flex flex-col items-center py-2 sm:py-4">
          <Cartouche initials={initials} size={104} />

          {/* Carving inscription animation */}
          <div className="mt-4 sm:mt-6">
            <motion.h1
              className={cn(
                'font-inv-display text-3xl sm:text-4xl font-bold leading-tight transition-colors duration-700',
                /*
                 * Cut into the stone, not absent from it. This used to be text-inv-panel
                 * until the card opened, which meant the one state a customer actually
                 * chooses from — the closed cover in the picker — carried no names at
                 * all. The closed state is the shallow cut and the open state is the
                 * same letterform brought to full depth.
                 */
                opening ? 'text-inv-ink' : 'text-inv-ink/45',
                CUT_BEVEL_CLASS,
              )}
            >
              <span className="block">{view.name1}</span>
              <span className="my-1 sm:my-1.5 block text-xl sm:text-2xl text-inv-accent font-normal" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </motion.h1>
          </div>
        </main>

        {/* Footer with chamfered open button */}
        <footer className="relative z-10 pb-1 w-full max-w-[280px]">
          <button
            type="button"
            onClick={handleOpen}
            className="tap-target press w-full rounded bg-inv-accent py-3 sm:py-3.5 font-inv-body text-xs sm:text-sm font-semibold text-inv-panel transition hover:opacity-95 active:scale-95"
            style={CHAMFER_STYLE}
          >
            {copy.openButton}
          </button>
        </footer>
      </div>
    </motion.div>
  );
}
