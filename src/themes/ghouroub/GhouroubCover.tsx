'use client';

import { motion, type Variants } from 'framer-motion';
import { GhouroubSun, HAZE_IMAGE, Horizon } from './GhouroubOrnaments';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * The closed state: a pale sky, one sun high in it, one rule low, the names under the
 * line. Nothing else, because the card behind it is five fields of colour and a line,
 * and a cover carrying a monogram and a frame would be advertising a different theme.
 *
 * The composition is the same two-row grid the card is built from — sky above the rule,
 * content below it — so this is not a separate design that happens to share a palette.
 * It is band one, before the sun goes down.
 *
 * Opening it sets the sun. The circle accelerates on an ease-in, which is the one place
 * in this product where an ease-in is right: a falling thing speeds up, and the ban on
 * ease-in in lib/motion is about interface responding to a tap, not about a sunset
 * compressed into nine hundred milliseconds. The rule clips it — the sky row owns the
 * overflow, so the sun is cut at the horizon and at no other boundary — while the
 * ground warms from the pale token toward the deep one and the haze comes up. Four
 * transforms and one opacity ramp: no filters, no loops, nothing still repainting after
 * it lands.
 */

const SKY: Variants = {
  enter: { opacity: 0 },
  idle: { opacity: 1, transition: { duration: 1.1, ease: EASE } },
  /*
   * The cover leaves only once the sun is down. AnimatePresence runs in `wait` mode, so
   * this delay is what buys the descent its full nine hundred milliseconds before the
   * card is allowed to rise.
   */
  set: { opacity: 0, transition: { duration: 0.4, delay: 0.74, ease: EASE } },
};

const SUN: Variants = {
  enter: { opacity: 0, y: -20 },
  idle: { opacity: 1, y: 0, transition: { duration: 1.2, ease: EASE } },
  /*
   * The opacity leg is not decoration. Under reduced motion framer drops the transform
   * and keeps the fade, so the reduced version ends where the full one ends — sun gone,
   * sky warm — instead of freezing with a sun stranded above the horizon.
   */
  set: {
    y: 260,
    opacity: 0,
    transition: {
      y: { duration: 0.9, ease: 'easeIn' },
      opacity: { duration: 0.3, delay: 0.62, ease: EASE },
    },
  },
};

const GROUND: Variants = {
  enter: { opacity: 0 },
  idle: { opacity: 0 },
  set: { opacity: 1, transition: { duration: 0.9, ease: 'easeIn' } },
};

const HAZE: Variants = {
  enter: { opacity: 0 },
  idle: { opacity: 0 },
  set: { opacity: 0.045, transition: { duration: 0.9, ease: EASE } },
};

const CONTENT: Variants = {
  enter: { opacity: 0, y: 16 },
  idle: { opacity: 1, y: 0, transition: { duration: 1.1, delay: 0.18, ease: EASE } },
  set: { opacity: 0, y: 12, transition: { duration: 0.45, ease: EASE } },
};

const BUTTON: Variants = {
  enter: { opacity: 0, y: 12 },
  idle: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.5, ease: EASE } },
  set: { opacity: 0, transition: { duration: 0.35, ease: EASE } },
};

export function GhouroubCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  return (
    <motion.div
      className="relative grid h-full max-h-full w-full grid-rows-[46fr_54fr] overflow-hidden bg-inv-bg"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      variants={SKY}
      initial="enter"
      animate="idle"
      exit="set"
    >
      {/* The sky deepening as the sun goes. A stop on the card's own ground ramp — see
          GROUND in GhouroubInvitation.tsx — rather than a colour invented for one
          animation, so the sky the cover leaves on is a sky the card actually contains. */}
      <motion.span
        className="pointer-events-none absolute inset-0 bg-inv-accent-soft/30"
        variants={GROUND}
        aria-hidden="true"
      />
      <motion.span
        className="pointer-events-none absolute inset-0 text-inv-accent"
        style={{ backgroundImage: HAZE_IMAGE }}
        variants={HAZE}
        aria-hidden="true"
      />

      {/* The sky row. Its lower edge is the horizon, which is why it is also the clip. */}
      <div className="relative col-start-1 row-start-1 overflow-hidden">
        <motion.div
          className="absolute bottom-[36px] sm:bottom-[46px] left-1/2 -ml-[105px]"
          variants={SUN}
          aria-hidden="true"
        >
          <GhouroubSun />
        </motion.div>
      </div>

      <Horizon x={0} className="col-start-1 row-start-2 z-10 self-start" />

      {/* Everything below the line shares one grid cell, because two items placed in the
          same cell would sit on top of each other rather than in sequence. */}
      {/*
        `min-w-0` and a measure written as w-full-then-capped, not as a fixed 342 that
        gives way: this is a single implicit grid column, so the column is sized from its
        item's min-content, and a hard 342px plus 48px of padding sized it to 390 inside a
        360px phone. The column overflowed 30px past the start edge, which in RTL is the
        left one, and the open button lost 6px of its own rule off the side of the screen.
        Same measure as the card now — 342, or the column less its margins, whichever is
        smaller.
      */}
      <div className="relative z-10 col-start-1 row-start-2 flex min-w-0 flex-col justify-between px-6 pt-5 pb-6 sm:pt-8 sm:pb-8 text-center">
        <motion.div className="mx-auto my-auto w-full max-w-[342px]" variants={CONTENT}>
          <h1 className="font-inv-display font-bold text-inv-ink">
            {/* Stacked rather than joined on one line: these are free text in any
                script, and "Abdelrahman" beside "Yasmine" at this size does not fit a
                390px screen. */}
            <span className="block text-3xl sm:text-[2.5rem] leading-[1.2] text-balance">{view.name1}</span>
            <span className="my-1 sm:my-2 block font-inv-body text-[0.875rem] sm:text-[1.0625rem] text-inv-accent">
              {copy.nameSeparator}
            </span>
            <span className="block text-3xl sm:text-[2.5rem] leading-[1.2] text-balance">{view.name2}</span>
          </h1>

          {/*
            No left to right isolation. The line mixes a month name with digits and the
            bidi algorithm already orders that correctly; forcing a direction onto the
            whole string is what puts an Arabic date the wrong way round.
          */}
          <p className="mt-3 sm:mt-5 font-inv-body text-[0.875rem] text-inv-muted">
            {formatEventDate(view.eventDate, view.lang)}
          </p>
        </motion.div>

        {/*
          Structural, not decorative: this tap is the gesture the browser needs before it
          will start the music, so it is the only thing to press here and it has to be
          reachable without scrolling on a 390x844 screen.

          Ruled top and bottom and open at the sides — the same control the card uses for
          the map link, and the reasoning is in CONTROL in GhouroubInvitation.tsx: a
          four-sided outline with square corners was the only hard edge on either screen,
          in a theme whose whole argument is that it has none. It spans the measure, so
          two rules read as one control rather than as a stray pair of dividers. No shadow
          pulse to draw the eye — an infinite box-shadow loop repaints for as long as the
          cover is open, on the one device class that cannot spare it.
        */}
        <motion.button
          type="button"
          onClick={onOpen}
          className="tap-target press mx-auto mt-6 flex min-h-[52px] w-full max-w-[342px] items-center justify-center border-y border-inv-accent/45 px-4 font-inv-body text-[0.9375rem] text-inv-ink"
          variants={BUTTON}
        >
          {copy.openButton}
        </motion.button>
      </div>
    </motion.div>
  );
}
