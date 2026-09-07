'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
  PITCH,
  REGISTER_LABELS,
  RuledSheet,
  Seal,
  entryNumber,
  registerDates,
} from './SijillOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * السجل, closed: the official marriage register open to its blank entry page.
 *
 * Quiet, exact and completely free of celebratory fluff — which is the entire brief
 * for an Egyptian عقد قران / كتب كتاب card.
 *
 * CLOSED: The ruled sheet is visible, the seal sits stamped in the lower inline-end
 * corner, the entry number and dates are filled in the header band, and the two name
 * rows are blank rules waiting to be signed.
 *
 * OPEN: The names write themselves along the inline axis onto their respective rules
 * (logical wipe in reading direction, 520ms with 180ms stagger), and the seal stamps down.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.8, ease: EASE } },
};

const NAME_1_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0.6, transition: { duration: 0.4, ease: EASE } },
};

const NAME_2_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0.6, transition: { duration: 0.4, ease: EASE } },
};

const SEAL_VARIANTS: Variants = {
  closed: { scale: 1, opacity: 1 },
  open: {
    scale: 0.95,
    opacity: 0.7,
    transition: { duration: 0.3, ease: EASE },
  },
};

export function SijillCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const labels = REGISTER_LABELS[view.lang];
  const dates = registerDates(view.eventDate, view.lang);
  const entryNo = entryNumber(view.name1, view.name2, view.eventDate);

  const handleOpen = () => {
    setOpening(true);
    onOpen();
  };

  return (
    <motion.div
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-4 sm:px-6 pt-3 sm:pt-6 text-inv-ink"
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
      <RuledSheet />

      {/* Header entry metadata: Entry Number & Hijri / Gregorian dates */}
      <header className="relative z-10 w-full max-w-[440px] border-b border-inv-line pb-2 sm:pb-3">
        <div className="flex flex-col items-center gap-1 font-inv-body text-[0.6875rem] text-inv-muted">
          <div className="flex items-center gap-1.5">
            <span>{labels.entry}</span>
            <span className="numeric font-inv-display text-sm font-bold text-inv-accent">
              #{entryNo}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
            {dates.hijri ? (
              <span>
                <span className="numeric">{dates.hijri}</span> {labels.hijri}
              </span>
            ) : null}
            <span>
              <span className="numeric">{dates.gregorian}</span> {labels.gregorian}
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-center font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent uppercase">
          {copy.eventName[view.eventType]}
        </p>
      </header>

      {/* Main Register Entry: The two lines waiting to be inscribed */}
      <main className="relative z-10 my-auto w-full max-w-[440px] py-4">
        <div className="space-y-4 sm:space-y-6">
          {/* Line 1: Groom */}
          <div className="relative border-b border-inv-accent/60 pb-1.5 sm:pb-2">
            <span className="absolute -top-3.5 start-0 font-inv-body text-[0.6875rem] tracking-wider text-inv-muted">
              {copy.roleGroom}
            </span>
            <motion.h1
              className="font-inv-display text-2xl sm:text-3xl font-bold leading-tight text-inv-ink rtl:text-right ltr:text-left"
              variants={NAME_1_VARIANTS}
              style={{ minHeight: `${PITCH}px` }}
            >
              {view.name1}
            </motion.h1>
          </div>

          {/* Line 2: Bride */}
          <div className="relative border-b border-inv-accent/60 pb-1.5 sm:pb-2">
            <span className="absolute -top-3.5 start-0 font-inv-body text-[0.6875rem] tracking-wider text-inv-muted">
              {copy.roleBride}
            </span>
            <motion.h2
              className="font-inv-display text-2xl sm:text-3xl font-bold leading-tight text-inv-ink rtl:text-right ltr:text-left"
              variants={NAME_2_VARIANTS}
              style={{ minHeight: `${PITCH}px` }}
            >
              {view.name2}
            </motion.h2>
          </div>
        </div>

        <p className="mt-4 sm:mt-6 font-inv-body text-xs sm:text-sm leading-relaxed text-inv-muted text-pretty text-center">
          {copy.inviteLine[view.eventType]}
        </p>
      </main>

      {/* Footer with Seal and Open Action */}
      <footer className="relative z-10 flex w-full max-w-[440px] items-center justify-between pt-2 sm:pt-4">
        <motion.button
          type="button"
          onClick={handleOpen}
          className="tap-target press rounded border border-inv-accent/70 bg-inv-panel/80 px-6 py-2.5 sm:px-7 sm:py-3 font-inv-body text-xs sm:text-sm font-medium text-inv-ink transition hover:bg-inv-panel"
        >
          {copy.openButton}
        </motion.button>

        <motion.div variants={SEAL_VARIANTS} className="h-[76px] w-[76px] sm:h-[90px] sm:w-[90px]">
          <Seal
            inscription={copy.eventName[view.eventType]}
            mark={`#${entryNo}`}
            className="h-full w-full"
          />
        </motion.div>
      </footer>
    </motion.div>
  );
}
