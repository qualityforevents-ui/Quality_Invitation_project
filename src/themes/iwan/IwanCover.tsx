'use client';

import { motion, type Variants } from 'framer-motion';
import { useId } from 'react';
import {
  AblaqCourses,
  CROWN_HEIGHT_CSS,
  CROWN_OPENING_CLIP,
  CROWN_WIDTH_CSS,
  FRAME_STYLE,
  IwanCrown,
  JAMB_TOP_CSS,
  LEAF,
} from './IwanOrnaments';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * الإيوان, shut. A portal seen straight on, and the tap opens it.
 *
 * The other covers in this set get out of the card's way — a fade, a sun setting, a bud
 * unfurling into the page behind it. This one is a door, and a door is not a transition
 * effect: the arch drawn here is the same arch, at the same width, that frames every
 * line of the card behind it. Nothing about the frame moves when the cover leaves. Only
 * the two leaves standing in the opening do, and what they were hiding is the hall.
 *
 * That is why the geometry is imported rather than composed. The crown, the jamb line,
 * the doorway's silhouette and the frame's own width all come from IwanOrnaments, so the
 * portal cannot drift out of agreement with the card between the two files.
 */

/**
 * The three states, named to match the muqarnas cells inside IwanCrown.
 *
 * `hidden` → `closed` → `open`, because a variant name is the only channel a parent has
 * to the apex cells: they are motion paths several components down, and framer routes
 * variants through React context rather than through props. Rename a state here and the
 * apex silently stops settling when the doors swing, with nothing to show for it in a
 * type check.
 */
const PORTAL: Variants = {
  hidden: { opacity: 0 },
  closed: { opacity: 1, transition: { duration: 1, ease: EASE } },
  /*
   * AnimatePresence runs in `wait` mode upstream, so this delay is the whole budget the
   * doors get: the cover is not allowed to leave until the swing has finished, and
   * without the delay the card would rise through a half open door.
   */
  open: { opacity: 0, transition: { duration: 0.34, delay: 0.66, ease: EASE } },
};

/**
 * One leaf swinging inward on its own jamb.
 *
 * `rotateY` is positive on the leaf hinged at the start edge and negative on the other,
 * which is what sends both free edges AWAY from the reader rather than out at them: a
 * door into a hall opens inward, and the two leaves have to disagree about the sign to
 * agree about the direction. Under perspective that also keeps each leaf inside the
 * opening it belongs to, so nothing has to be clipped mid-swing.
 *
 * The opacity leg is not decoration and is not a fade dressed up as a swing. framer is
 * wrapped in `MotionConfig reducedMotion="user"` upstream, which drops the transform and
 * keeps the opacity — so a guest who asked for stillness gets a door that dissolves and
 * ends where the full version ends, instead of a door frozen shut over a card that has
 * already been dealt. It is delayed past the middle of the swing so that for everybody
 * else the leaf is solid stone for as long as it is moving.
 */
function leafVariants(swing: number): Variants {
  return {
    hidden: { rotateY: 0, opacity: 1 },
    closed: { rotateY: 0, opacity: 1 },
    open: {
      rotateY: swing,
      opacity: 0,
      transition: {
        rotateY: { duration: 0.7, ease: EASE },
        opacity: { duration: 0.26, delay: 0.44, ease: EASE },
      },
    },
  };
}

/** The inscription lifts off the door before the door moves. */
const INSCRIPTION: Variants = {
  hidden: { opacity: 0, y: 10 },
  closed: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.22, ease: EASE } },
  open: { opacity: 0, transition: { duration: 0.28, ease: EASE } },
};

const BAR: Variants = {
  hidden: { opacity: 0, y: 8 },
  closed: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5, ease: EASE } },
  open: { opacity: 0, transition: { duration: 0.24, ease: EASE } },
};

/**
 * Physical sides, deliberately.
 *
 * A door is symmetric about the vertical and its two halves are not a start and an end —
 * they are a left and a right, and they are the same left and right in Arabic as in
 * English. Logical properties here would mirror the hinges under RTL and buy nothing.
 */
const LEAVES = [
  { key: 'left', half: 'inset(0 50% 0 0)', origin: `${LEAF.inset} center`, swing: 78 },
  { key: 'right', half: 'inset(0 0 0 50%)', origin: `calc(100% - ${LEAF.inset}) center`, swing: -78 },
] as const;

export function IwanCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  const clipId = useId();

  return (
    <motion.div
      className="flex h-full max-h-full w-full flex-col items-center justify-center overflow-hidden bg-inv-bg px-4 sm:px-7 pt-4 sm:pt-8"
      style={{ ...FRAME_STYLE, paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      variants={PORTAL}
      initial="hidden"
      animate="closed"
      exit="open"
    >
      {/* The portal. Its width IS the frame token, so the arch standing here is the arch
          the card is written inside — not a larger cover version of it. */}
      <div className="relative" style={{ width: 'var(--iwan-frame)' }}>
        {/* The doorway: everything between the threshold and the crown. */}
        <div className="relative">
          <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={CROWN_OPENING_CLIP} />
            </clipPath>
          </svg>

          {/*
            The two leaves.
            
            `perspective` sits on this wrapper rather than on the leaves, because a
            perspective declared on the element that is itself rotating has no depth to
            resolve against and the swing flattens into a horizontal squash. 900px is
            shallow enough that the far edge of a 340px door recedes visibly.
          */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ perspective: '900px', transformStyle: 'preserve-3d' }}
            aria-hidden="true"
          >
            {LEAVES.map((leaf) => (
              <motion.div
                key={leaf.key}
                className="absolute inset-0"
                style={{ clipPath: leaf.half, transformOrigin: leaf.origin }}
                variants={leafVariants(leaf.swing)}
              >
                {/*
                  A leaf is two elements and one transform, and it has to be, because the
                  doorway is an arch on top of a rectangle and only the arch has a fixed
                  proportion. The head is pinned to the crown's own box and clipped to the
                  opening; the shaft below it is a plain rectangle between the jambs and
                  can be any height the names turn out to need. Both are children of the
                  one rotating element, so they swing as a single slab of wood.

                  The nesting is what makes the halving work: this leaf clips to its own
                  side of the centre line, and the head clips to the arch, and a clip
                  inside a clip is their intersection. There is no way to say that in one
                  clip-path without hand-writing half a horseshoe.
                */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-inv-panel"
                  style={{
                    width: CROWN_WIDTH_CSS,
                    height: CROWN_HEIGHT_CSS,
                    clipPath: `url(#${clipId})`,
                  }}
                >
                  <AblaqCourses />
                </div>

                <div
                  className="absolute bg-inv-panel"
                  style={{ top: CROWN_HEIGHT_CSS, bottom: 0, left: LEAF.inset, right: LEAF.inset }}
                >
                  <AblaqCourses />
                </div>
              </motion.div>
            ))}
          </div>

          {/*
            The stone, in front of the door it holds.

            The crown is drawn unfilled here even though this is the closed state: the
            leaves are supplying the panel now, and a filled crown would paint over them
            and leave the arch head solid after the doors had already opened.
          */}
          <IwanCrown filled={false} animatedCells className="z-10" />

          {/* The jambs, continuing the intrados down to the threshold. They start at the
              horseshoe's overhang rather than at the springing line — see JAMB_TOP_CSS. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 w-0.5 bg-inv-accent"
            style={{ top: JAMB_TOP_CSS, bottom: 0, left: `calc(${LEAF.inset} - 1px)` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 w-0.5 bg-inv-accent"
            style={{ top: JAMB_TOP_CSS, bottom: 0, right: `calc(${LEAF.inset} - 1px)` }}
          />

          {/*
            The piers. Three pixels of overlap with the crown's own, not a butt joint:
            the crown's height is a rounded multiple of the frame and these are not, so
            meeting them exactly would leave a one pixel hole in a two pixel wall on some
            screen widths and nowhere else.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 z-10 w-0.5 bg-inv-accent"
            style={{ top: `calc(${CROWN_HEIGHT_CSS} - 3px)`, bottom: 0 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 z-10 w-0.5 bg-inv-accent"
            style={{ top: `calc(${CROWN_HEIGHT_CSS} - 3px)`, bottom: 0 }}
          />

          {/*
            The inscription, cut into the door at the springing line.

            Padded in from the jambs rather than centred in a container of its own, which
            is the same rule the card obeys: in this theme the arch is the measure, and
            nothing is allowed a width the stonework did not give it.
          */}
          <motion.div
            className="relative z-20 pb-4 sm:pb-6 text-center"
            style={{
              paddingTop: 'calc(var(--iwan-frame) * 0.40)',
              paddingInline: `calc(${LEAF.inset} + 16px)`,
            }}
            variants={INSCRIPTION}
          >
            {/* Word-spacing, never letter-spacing: tracking is a silent no-op in Arabic,
                so a rhythm built on it exists on the English card alone. */}
            <p className="font-inv-body text-[0.6875rem] text-inv-muted [word-spacing:0.3em]">
              {copy.eventName[view.eventType]}
            </p>

            {/*
              Stacked, and not because two Arabic names would not fit. These are free text
              in any script, and "Abdelrahman" beside "Yasmine" at this size does not fit
              a 390px phone in either language. Qahiri is a single weight display Kufi
              with nowhere to go but size, so the block wraps downward and never shrinks.
            */}
            <h1 className="mt-3 sm:mt-5 font-inv-display text-inv-ink">
              <span className="block text-[2rem] sm:text-[2.5rem] leading-[1.2] text-balance">{view.name1}</span>
              <span className="my-1 sm:my-2 block font-inv-body text-sm sm:text-base text-inv-accent" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block text-[2rem] sm:text-[2.5rem] leading-[1.2] text-balance">{view.name2}</span>
            </h1>

            {/* No left to right isolation. The line mixes a month name with digits and
                bidi already orders that correctly; forcing a direction onto the whole
                string is what puts an Arabic date the wrong way round. */}
            <p className="mt-3 sm:mt-5 font-inv-body text-xs sm:text-[0.8125rem] text-inv-muted">
              {formatEventDate(view.eventDate, view.lang)}
            </p>
          </motion.div>
        </div>

        {/*
          The threshold, and the only control on the screen.

          Structural rather than decorative: this tap is the gesture the browser needs
          before it will start the music, so it has to be reachable without scrolling on a
          390x844 screen. A square bar across the full width of the frame, because the
          theme has no round shapes anywhere — not in the ornament, not in the confetti,
          and not here. No pulsing shadow either: an infinite box-shadow loop repaints for
          as long as the cover sits open, on the one device class that cannot spare it.
        */}
        <motion.button
          type="button"
          onClick={onOpen}
          className="tap-target press block w-full bg-inv-accent px-6 py-3.5 font-inv-body text-sm sm:text-[0.9375rem] text-inv-bg"
          variants={BAR}
        >
          {copy.openButton}
        </motion.button>
      </div>
    </motion.div>
  );
}
