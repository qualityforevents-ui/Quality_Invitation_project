'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
  CalendarHeaderBand,
  PULP_BOARD_TILE,
  TornEdge,
  formatNetigaDigits,
} from './NetigaOrnaments';
import { EASE_OUT as EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { formatEventDateParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * النتيجة, closed: the wall calendar showing today's date.
 *
 * OPEN: The top leaf tears off — rotating around its inline punch hole and translating
 * out of frame — revealing the wedding day leaf beneath it.
 */

const CONTAINER_VARIANTS: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.35, delay: 0.7, ease: EASE } },
};

/*
 * The tear, mirrored.
 *
 * The leaf pivots about the punch hole on its INLINE-START edge, so the hinge is on
 * the left of an English card and on the right of an Arabic one — and the free edge
 * has to swing away from that hinge, which means the rotation reverses with it. A
 * single physical `origin-top-left` plus a fixed +4° tears an Arabic card off its
 * bound edge, which is the one thing a calendar pad cannot do.
 */
const TEAR_LEAF_VARIANTS_LTR: Variants = {
  closed: { rotate: 0, y: 0, opacity: 1 },
  open: {
    rotate: 4,
    y: -80,
    opacity: 0,
    transition: { duration: 0.64, ease: EASE },
  },
};

const TEAR_LEAF_VARIANTS_RTL: Variants = {
  closed: { rotate: 0, y: 0, opacity: 1 },
  open: {
    rotate: -4,
    y: -80,
    opacity: 0,
    transition: { duration: 0.64, ease: EASE },
  },
};

export function NetigaCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);

  const isRtl = view.lang === 'AR';

  // Today's date for closed cover
  const todayParts = formatEventDateParts(new Date(), view.lang);
  const weddingParts = formatEventDateParts(view.eventDate, view.lang);

  const displayWeekday = opening ? weddingParts.weekday : todayParts.weekday;
  const displayDay = opening ? weddingParts.day : todayParts.day;
  const displayMonth = opening ? weddingParts.month : todayParts.month;
  const displayYear = opening ? weddingParts.year : todayParts.year;

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
      {/* Background pulp board texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: PULP_BOARD_TILE }}
        aria-hidden="true"
      />

      {/* Top hanger hole on wall board */}
      <div className="relative z-10 flex flex-col items-center pt-1">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-inv-line/80 bg-inv-ink/20 shadow-inner" />
        <div className="mt-0.5 h-2.5 w-0.5 bg-inv-line/60" />
      </div>

      {/* The Calendar Pad with tearing leaf */}
      <div className="relative z-10 my-auto w-full max-w-[310px]">
        {/* Underlying wedding leaf */}
        <div className="absolute inset-0 rounded-sm bg-inv-panel shadow-md border border-inv-line/40">
          <CalendarHeaderBand title={weddingParts.weekday} />
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <span className="font-inv-display text-7xl sm:text-8xl font-black leading-none text-inv-accent my-1 sm:my-2">
              {formatNetigaDigits(weddingParts.day, view.lang)}
            </span>
            <span className="mt-1 font-inv-display text-base sm:text-lg text-inv-ink">
              {weddingParts.month} {formatNetigaDigits(weddingParts.year, view.lang)}
            </span>
          </div>
        </div>

        {/* Active / Tearing top leaf */}
        <motion.div
          className={cn(
            'relative rounded-sm border border-inv-line/40 bg-inv-panel shadow-lg',
            isRtl ? 'origin-top-right' : 'origin-top-left',
          )}
          variants={isRtl ? TEAR_LEAF_VARIANTS_RTL : TEAR_LEAF_VARIANTS_LTR}
        >
          <TornEdge className="absolute -top-3 inset-x-0" />
          <CalendarHeaderBand title={displayWeekday} />

          <div className="flex flex-col items-center justify-center px-4 py-4 sm:py-6 text-center">
            {/* Letter-spacing is what makes a line of Latin small caps readable and what
                pulls an Arabic word apart at its joins, so it is applied by language. */}
            <p
              className={cn(
                'font-inv-body text-[11px] text-inv-muted',
                isRtl ? '' : 'uppercase tracking-widest',
              )}
            >
              {copy.eventName[view.eventType]}
            </p>

            {/* Day numeral */}
            <span className="font-inv-display text-7xl sm:text-8xl font-black leading-none text-inv-accent my-1 sm:my-2 select-none">
              {formatNetigaDigits(displayDay, view.lang)}
            </span>

            <p className="font-inv-display text-base sm:text-lg text-inv-ink">
              {displayMonth} <span className="numeric">{formatNetigaDigits(displayYear, view.lang)}</span>
            </p>

            <p className="mt-3 font-inv-body text-xs text-inv-muted">
              {view.name1} {copy.nameSeparator} {view.name2}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Open action */}
      <footer className="relative z-10 pb-1 pt-2">
        <button
          type="button"
          onClick={handleOpen}
          className="tap-target press rounded bg-inv-accent px-8 py-2.5 sm:py-3 font-inv-body text-xs sm:text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {copy.openButton}
        </button>
      </footer>
    </motion.div>
  );
}
