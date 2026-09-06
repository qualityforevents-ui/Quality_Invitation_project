'use client';

import { motion, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * غروب has two marks and no third.
 *
 * A sun and a line. There is no divider glyph, no corner, no frame and no seal,
 * because the horizon rule is already doing the work a divider would do: it appears in
 * every band and it is the only object that persists down the page. Adding a second
 * connective mark would give the theme two organising ideas and therefore none.
 *
 * Everything here is drawn on the horizontal, which is why the theme needs no mirroring
 * work at all. A sun is symmetric, a rule has no direction, and the gap that travels
 * along the rule is centred and moves both ways. The Arabic and English cards are the
 * same drawing, not two drawings that were kept in step by hand.
 *
 * No SVG ids anywhere, deliberately: the sun is strokes and nothing else, so there is
 * no gradient or mask to name. That matters because the builder preview renders a card
 * twice on one page, and a literal id would silently resolve to whichever copy came
 * first.
 */

/**
 * The break in the horizon.
 *
 * A true hole rather than a patch painted in the band's colour. The rule crosses a
 * photograph in band four, and a 14px patch of sky colour over a photograph is a smear;
 * a mask leaves the photograph showing through the gap, which is what "the horizon
 * continues through the photo" has to mean.
 *
 * Neutral black is an alpha channel here, not a colour anybody sees.
 */
const GAP_MASK =
  'linear-gradient(to right, rgba(0,0,0,1) calc(50% - 7px), transparent calc(50% - 7px), transparent calc(50% + 7px), rgba(0,0,0,1) calc(50% + 7px))';

/**
 * One horizon rule: 1px, full bleed, with a 14px gap where the content column crosses.
 *
 * The line is drawn at twice the band's width and offset half a width to the start, so
 * translating it sideways moves the gap without ever uncovering an end. That is the
 * whole reason the signature motion can be a transform: the alternative, animating the
 * gap's inset or the gradient's position, is a layout or paint change on every scroll
 * frame, which is exactly what a mid-range Android cannot afford.
 *
 * `left` rather than `start` on purpose. The line is symmetric decoration and must sit
 * identically in both directions; a logical offset here would mirror the drawing for no
 * gain. See the same note on OrnateFrame in components/invitation/Ornaments.tsx.
 */
export function Horizon({
  x,
  className,
  lineClassName = 'bg-inv-line',
}: {
  /** Plain number when motion is off, so nothing subscribes to scroll at all. */
  x: MotionValue<number> | number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div className={cn('pointer-events-none relative h-px', className)} aria-hidden="true">
      <motion.span
        className={cn('absolute top-0 left-[-50%] block h-px w-[200%]', lineClassName)}
        style={{ x, maskImage: GAP_MASK, WebkitMaskImage: GAP_MASK }}
      />
    </div>
  );
}

/**
 * Haze: 1px rules at a 5px pitch, laid over the two deepest bands.
 *
 * Written as a repeating gradient on currentColor rather than the data URI tile the
 * design called for, because a data URI has to carry a baked colour value and this
 * theme's colours are not the component's to know. Same picture, one token, and no
 * second copy of the palette to go stale.
 */
export const HAZE_IMAGE =
  'repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 5px)';

export function Haze({ opacity, className }: { opacity: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 text-inv-accent', className)}
      style={{ opacity, backgroundImage: HAZE_IMAGE }}
    />
  );
}

/**
 * Seven horizontal fragments of uneven length at uneven spacing, crossing one thin
 * circle. Even spacing would read as a target and even lengths as a logo; the point is
 * a sun half dissolved into the haze over the sea, which is a thing you can only just
 * still see the edge of.
 *
 * Fixed at 210px rather than sized in ems. It is the one hero object in the theme and
 * it is composed against the horizon rule, not against a line of type.
 */
const HAZE_BARS = [
  { y: 44, x1: 30, x2: 122, opacity: 0.28 },
  { y: 68, x1: 66, x2: 198, opacity: 0.5 },
  { y: 90, x1: 6, x2: 138, opacity: 0.34 },
  { y: 108, x1: 44, x2: 186, opacity: 0.62 },
  { y: 126, x1: 90, x2: 172, opacity: 0.3 },
  { y: 148, x1: 16, x2: 152, opacity: 0.46 },
  { y: 170, x1: 70, x2: 128, opacity: 0.24 },
];

export function GhouroubSun({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 210 210"
      fill="none"
      className={cn('h-[210px] w-[210px] text-inv-accent', className)}
      aria-hidden="true"
      role="presentation"
    >
      <circle cx="105" cy="105" r="72" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      {HAZE_BARS.map((bar) => (
        <line
          key={bar.y}
          x1={bar.x1}
          y1={bar.y}
          x2={bar.x2}
          y2={bar.y}
          stroke="currentColor"
          strokeWidth="1"
          opacity={bar.opacity}
        />
      ))}
    </svg>
  );
}
