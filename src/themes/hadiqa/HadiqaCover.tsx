'use client';

import { motion, type Variants } from 'framer-motion';
import { BUD_ANGLES, PETAL_ANGLES, JasminePetal } from './HadiqaOrnaments';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * حديقة, closed. One jasmine bud, and it opens.
 *
 * Every other cover in this set reveals the card by getting out of its way — a fade, a
 * screen dissolving, a curtain parting. This one performs the thing the theme is about:
 * the flower that is furled on the closed card is the same flower that sits at the head
 * of the vine on the open one, and the tap is what opens it. The animation is therefore
 * not decoration over the transition, it IS the transition, which is why it lives in
 * `exit` rather than in a click handler.
 *
 * The stem below the bud stops after eighty pixels on the closed card. On exit it shoots
 * down past the bottom edge, and the card that follows is what the vine has grown into.
 */

/**
 * The bud opening.
 *
 * Each petal rotates from its furled angle to its splayed one and scales up from a
 * mostly-closed 0.42, staggered so the flower unwraps rather than snapping open like a
 * parasol. The `times` array is what puts the overshoot in: the petal reaches 1.06 at
 * three quarters of the way and settles back, which is the small elastic recoil a real
 * petal has when it releases.
 *
 * Rotation and scale only. Nothing here touches layout, so the whole burst is one
 * composited transform per petal on a single promoted layer.
 */
function petalVariants(index: number): Variants {
  return {
    closed: {
      rotate: BUD_ANGLES[index],
      scale: 0.42,
    },
    open: {
      rotate: PETAL_ANGLES[index],
      scale: [0.42, 1.06, 1],
      transition: {
        duration: 0.56,
        delay: index * 0.08,
        times: [0, 0.75, 1],
        ease: EASE,
      },
    },
  };
}

/**
 * The stem's descent, drawn rather than moved.
 *
 * `pathLength` is set to 1 on the path itself, which normalises the dash units so the
 * offset is a fraction rather than a pixel count nobody can reason about. Animating
 * `strokeDashoffset` on an eighty-pixel hairline is a trivial repaint; it is only the
 * document-length version of this in the card that has to be split up.
 */
const STEM: Variants = {
  closed: { strokeDashoffset: 1 },
  open: {
    strokeDashoffset: 0,
    transition: { duration: 0.4, delay: 0.42, ease: EASE },
  },
};

const CONTENT: Variants = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.3, delay: 0.5, ease: EASE } },
};

export function HadiqaCover({
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
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-6 pt-4 sm:pt-8 text-center"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      initial="closed"
      animate="closed"
      exit="open"
    >
      <motion.div
        className="relative my-auto flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        {/*
          The bud, and the stem it sits on, in one SVG so the two share a coordinate
          system and the stem meets the calyx exactly rather than approximately.
        */}
        <svg
          viewBox="0 0 200 290"
          fill="none"
          className="h-28 sm:h-36 w-auto text-inv-accent"
          aria-hidden="true"
        >
          <motion.path
            d="M100 107 C100 150, 99 174, 96 205"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            variants={STEM}
          />

          <g stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
            {PETAL_ANGLES.map((angle, index) => (
              <motion.g
                key={angle}
                variants={petalVariants(index)}
                style={{ transformOrigin: '100px 100px', transformBox: 'view-box' }}
              >
                <JasminePetal />
              </motion.g>
            ))}
            <circle cx="100" cy="100" r="7" />
          </g>
        </svg>

        <motion.div variants={CONTENT}>
          <p className="font-inv-body text-[0.6875rem] text-inv-muted [word-spacing:0.3em]">
            {copy.eventName[view.eventType]}
          </p>

          {/*
            Stacked rather than on one line, and not because two Arabic names would not
            fit. This field takes any script, and "Abdelrahman" beside "Yasmine" at this
            size does not fit a 390 pixel screen in either language.
          */}
          <h1 className="mt-3 sm:mt-5 font-inv-display text-inv-ink">
            <span className="block text-3xl sm:text-4xl leading-[1.3] text-balance">{view.name1}</span>
            <span className="my-0.5 block text-lg sm:text-xl text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block text-3xl sm:text-4xl leading-[1.3] text-balance">{view.name2}</span>
          </h1>

          <p className="mt-4 sm:mt-6 max-w-[19rem] font-inv-body text-xs sm:text-[0.9375rem] leading-relaxed text-inv-muted text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          {/*
            No left-to-right isolation. The string mixes a month name with digits and the
            bidi algorithm already orders that correctly in both languages; forcing a
            direction onto the whole line is what puts an Arabic date in the wrong order.
          */}
          <p className="mt-2 sm:mt-4 font-inv-body text-xs sm:text-sm text-inv-accent">
            {formatEventDate(view.eventDate, view.lang)}
          </p>
        </motion.div>
      </motion.div>

      {/*
        The tap that opens the card is also the gesture that lets the browser start the
        audio, so this is the only control on the screen and it has to be reachable
        without scrolling.

        It breathes on opacity rather than on a box-shadow. A repeating shadow is a
        repaint of the button and its surroundings on every frame, forever, on a page
        that may sit open on a slow phone for minutes before anyone taps it.
      */}
      <motion.button
        type="button"
        onClick={onOpen}
        className="tap-target press mt-6 rounded-full border border-inv-accent/60 bg-inv-panel/60 px-8 py-3.5 font-inv-body text-sm sm:text-base text-inv-ink"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 0.72, 1], y: 0 }}
        transition={{
          y: { duration: 0.8, delay: 0.6, ease: EASE },
          /*
            One keyframe track, not two. Written as a delayed loop starting at 1 it left
            the button sitting at its initial zero opacity for the whole delay, which on
            the one control the card has is a second and a half of the page looking
            broken. The entrance is the first keyframe of the breath instead.
          */
          opacity: {
            duration: 3.4,
            times: [0, 0.24, 0.62, 1],
            repeat: Infinity,
            repeatDelay: 0.6,
            delay: 0.6,
            ease: 'easeInOut',
          },
        }}
      >
        {copy.openButton}
      </motion.button>
    </motion.div>
  );
}
