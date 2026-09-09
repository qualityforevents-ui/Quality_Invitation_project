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
 * photograph in band three, and a patch of sky colour over a photograph is a smear; a
 * mask leaves the photograph showing through the gap, which is what "the horizon
 * continues through the photo" has to mean.
 *
 * The shoulders are feathered rather than square. A 1px rule that stops dead, leaves
 * fourteen empty pixels and starts again photographs as a rendering fault — it was read
 * as exactly that on a real device — so the rule now dissolves into the break over 19px
 * either side and a bead sits in the middle of it. Nothing about the mechanism changed:
 * it is still one mask on one element, and still transform-only under scroll.
 *
 * Neutral black is an alpha channel here, not a colour anybody sees.
 */
const GAP_MASK =
  'linear-gradient(to right, rgba(0,0,0,1) calc(50% - 30px), rgba(0,0,0,0) calc(50% - 11px), rgba(0,0,0,0) calc(50% + 11px), rgba(0,0,0,1) calc(50% + 30px))';

/**
 * One horizon rule: 1px, full bleed, dissolving into a 22px break where the content
 * column crosses it, with a single bead sitting in the break.
 *
 * The bead is not a second ornament. It is the same object as the rule — the point the
 * horizon breaks at — and it is drawn from the same colour and driven by the same motion
 * value, so it can never drift out of the gap it belongs to. Without it the break reads
 * as a line that failed to paint; with it the break reads as the one place on the page
 * where the horizon is being marked.
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
  markClassName = 'bg-inv-accent/45',
}: {
  /** Plain number when motion is off, so nothing subscribes to scroll at all. */
  x: MotionValue<number> | number;
  className?: string;
  lineClassName?: string;
  markClassName?: string;
}) {
  return (
    <div className={cn('pointer-events-none relative h-px', className)} aria-hidden="true">
      <motion.span
        className={cn('absolute top-0 left-[-50%] block h-px w-[200%]', lineClassName)}
        style={{ x, maskImage: GAP_MASK, WebkitMaskImage: GAP_MASK }}
      />
      {/* Centred on the parent, which is the same point the mask puts its hole at. */}
      <motion.span
        className={cn(
          'absolute top-0 left-1/2 -mt-[2px] -ml-[2.5px] block h-[5px] w-[5px] rounded-full',
          markClassName,
        )}
        style={{ x }}
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
 * EVERY BAR IS A CHORD. The lengths used to be free numbers, and three of them ran past
 * the circle on both sides — on the card only the top half of the sun is visible, so
 * what a guest actually saw was three loose strokes with a ring behind them. Each bar is
 * now inset inside the circle's own width at that height, by a different amount at each
 * end, so the fragments stay uneven and asymmetric while the drawing stays one object.
 * The half-widths are sqrt(72^2 - (y - 105)^2); nothing here may exceed them.
 *
 * Fixed at 210px rather than sized in ems. It is the one hero object in the theme and
 * it is composed against the horizon rule, not against a line of type.
 */
const HAZE_BARS = [
  { y: 44, x1: 72, x2: 141, opacity: 0.28 },
  { y: 68, x1: 46, x2: 158, opacity: 0.5 },
  { y: 90, x1: 36, x2: 174, opacity: 0.34 },
  { y: 108, x1: 40, x2: 170, opacity: 0.62 },
  { y: 126, x1: 50, x2: 172, opacity: 0.3 },
  { y: 148, x1: 49, x2: 148, opacity: 0.46 },
  { y: 170, x1: 76, x2: 134, opacity: 0.24 },
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
