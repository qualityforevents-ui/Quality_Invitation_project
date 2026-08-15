/**
 * The motion vocabulary, defined once.
 *
 * Curves and durations were being invented per file: the same easing array copied into
 * five components, and every builder control falling back to Tailwind's default
 * transition, which is a weak curve at a duration nobody chose. Motion is part of the
 * design system in the same way colour is, so it lives beside the colours.
 *
 * The curves are strong on purpose. The browser's built in `ease-out` barely bends, and
 * the difference between it and a real ease-out is most of what separates motion that
 * feels designed from motion that feels default.
 *
 * Two rules run through everything here:
 *
 *   Never ease-in on interface. It starts slow, which delays the exact moment the user
 *   is watching for. An ease-out at 200ms feels faster than an ease-in at 200ms even
 *   though they take the same time.
 *
 *   Interface motion stays under 300ms. The invitation is the exception and has its own
 *   budget below, because it is a card being opened rather than a control responding.
 */

/** Entering, exiting, and anything responding to a tap. The default. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Something already on screen moving or changing shape. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** Sheets and panels sliding from an edge. The iOS drawer feel. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** The same curves as CSS strings, for transitions written in Tailwind or plain CSS. */
export const CSS_EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const CSS_EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

/**
 * Durations in milliseconds, named by what they are for rather than by length, so
 * picking one is a decision about the element and not a guess at a number.
 */
export const DURATION = {
  /** A press acknowledging itself. Long enough to see, short enough to feel instant. */
  press: 160,
  /** Small things appearing in place: hints, counters, inline errors. */
  quick: 180,
  /** Panels and notices entering or leaving. */
  panel: 240,
  /** The largest an interface animation should ever be. */
  max: 300,
} as const;

/** Seconds, because framer-motion measures in seconds and CSS in milliseconds. */
export const SECONDS = {
  press: DURATION.press / 1000,
  quick: DURATION.quick / 1000,
  panel: DURATION.panel / 1000,
} as const;

/**
 * Between items in a group entrance. Below about 30ms the stagger is invisible, above
 * about 80ms the last item feels like it is lagging behind the first.
 */
export const STAGGER_STEP = 0.05;

/**
 * The invitation's own budget.
 *
 * Deliberately outside the interface limits above. A guest opens one of these once,
 * having been sent it by somebody they love, and the reveal is the product rather than
 * a control getting out of the way. The frequency table that caps interface motion at
 * 300ms puts first time and celebratory moments in the opposite column.
 */
export const INVITATION = {
  ease: EASE_OUT,
  /** A section arriving as it scrolls into view. */
  reveal: 0.7,
  /** The cover assembling itself before the tap. */
  cover: 1.1,
} as const;

/**
 * Standard entrance for a small panel or notice.
 *
 * Starts at 0.98 rather than 0, because nothing in the physical world appears out of
 * nothing, and a panel that scales up from a point reads as a special effect instead of
 * a thing arriving.
 */
export const PANEL_ENTRANCE = {
  initial: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
  animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
  exit: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
  transition: { duration: SECONDS.panel, ease: EASE_OUT },
} as const;
