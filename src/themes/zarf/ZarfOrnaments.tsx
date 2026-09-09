'use client';

import { motion, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * الظرف ornaments: the crease, the wax seal, the wax-drip rules, and the laid-paper tile.
 *
 * All geometry is authored as fixed path data — never randomised at runtime —
 * to ensure absolute server/client hydration fidelity.
 *
 * Every ornament here OCCUPIES the space it needs rather than hanging out of its box on
 * an absolute offset. An ornament that overlays its neighbour is how the seal came to
 * read as clipped by the fold; the crease now owns a 32px band of its own and nothing
 * else has to leave room for it.
 */

/** Laid paper background tile: chain-and-laid lines of handmade stationery. */
export const LAID_PAPER_TILE =
  'repeating-linear-gradient(0deg, rgba(46,43,36,0.035) 0px, rgba(46,43,36,0.035) 1px, transparent 1px, transparent 4px), ' +
  'repeating-linear-gradient(90deg, rgba(46,43,36,0.02) 0px, rgba(46,43,36,0.02) 1px, transparent 1px, transparent 26px)';

/**
 * 24-point wobbled seal perimeter (fixed authored path data).
 * Centered at (66, 66) in a 132x132 viewBox.
 */
export const WAX_SEAL_PATH =
  'M 124 66 ' +
  'C 124 79.5 119.2 92.4 110.1 101.8 ' +
  'C 100.8 111.2 88.2 116.5 75 116.2 ' +
  'C 61.5 115.8 48.7 110.4 39.5 101.1 ' +
  'C 30.2 91.8 24.8 79 25.2 65.5 ' +
  'C 25.5 52.2 31.1 39.7 40.4 30.4 ' +
  'C 49.8 21.2 62.4 15.8 75.8 16.2 ' +
  'C 89.2 16.5 101.8 22.1 111.1 31.4 ' +
  'C 120.2 40.6 124 53 124 66 Z';

/** Left half of the seal when cracked open */
export const WAX_SEAL_LEFT =
  'M 66 16.2 C 49.8 21.2 30.2 39.7 25.2 65.5 C 24.8 79 39.5 101.1 66 116.2 ' +
  'L 66 94 L 64 82 L 67 70 L 64 56 L 68 42 L 65 28 Z';

/** Right half of the seal when cracked open */
export const WAX_SEAL_RIGHT =
  'M 66 16.2 L 65 28 L 68 42 L 64 56 L 67 70 L 64 82 L 66 94 L 66 116.2 ' +
  'C 88.2 116.5 110.1 101.8 124 66 C 124 40.6 101.8 22.1 66 16.2 Z';

/**
 * THE WAX SEAL.
 *
 * Authored wobbled perimeter with initial monogram and upper rim highlight.
 */
export function WaxSeal({
  monogram,
  className,
  size = 132,
}: {
  monogram?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 132 132"
        fill="none"
        className="h-full w-full drop-shadow-[0_2px_4px_rgba(46,43,36,0.18)]"
      >
        {/* Main wax body */}
        <path d={WAX_SEAL_PATH} fill="var(--inv-accent)" />

        {/* Soft highlight arc along upper-inline rim */}
        <path
          d="M 40 34 C 54 22 78 20 96 28"
          stroke="var(--inv-accent-soft)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Inner debossed ring */}
        <circle
          cx="66"
          cy="66"
          r="40"
          stroke="var(--inv-line)"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/*
        The monogram is sized off the seal, not off the viewport.

        It used to be min(2.5rem, 28cqw) with no container-query ancestor anywhere above
        it, so the cqw term resolved against the viewport and the clamp always yielded
        40px — wider than the debossed ring at any seal under about 150px. Two initials
        and a separator then spilled past the wax onto the paper, which is what read as
        the seal being cut off. A ratio of the seal's own size is the only version of
        this that cannot come apart at a different `size`.
      */}
      {monogram ? (
        <span
          className="absolute font-inv-display font-semibold leading-none whitespace-nowrap text-inv-panel select-none"
          style={{ fontSize: `${Math.round(size * 0.21)}px` }}
        >
          {monogram}
        </span>
      ) : null}
    </div>
  );
}

/**
 * CONNECTIVE: Wax-drip divider rule.
 *
 * Spans the card's one text measure so its ends land on the same column as every text
 * edge — it used to stop 40px short on each side, which made it a third measure on a
 * card that should have one.
 *
 * Two variants, because the same mark twice in one card reads as a template. `section`
 * is the full rule with the sealing-wax drip at its centre and introduces the couple's
 * own line; `close` is a short centred wax dot with no rule, and is the last mark on
 * the page.
 */
export function WaxDripRule({
  className,
  variant = 'section',
}: {
  className?: string;
  variant?: 'section' | 'close';
}) {
  if (variant === 'close') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)} aria-hidden="true">
        <span className="h-px w-6 bg-inv-line/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-inv-accent/70" />
        <span className="h-px w-6 bg-inv-line/60" />
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-center justify-center', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-inv-line/60" />
      <span className="mx-3 h-2 w-2 rotate-45 rounded-[1px] bg-inv-accent/80 shadow-xs" />
      <span className="h-px flex-1 bg-inv-line/60" />
    </div>
  );
}

/**
 * The light and shade of a sheet that has been folded and pressed flat: the paper
 * curving away above the crease, and catching the light again just below it.
 *
 * A single hairline was never going to carry this theme's whole axis on a phone. The
 * pair is what makes it read as a fold rather than as a divider rule.
 */
const FOLD_SHADING =
  'linear-gradient(to bottom, ' +
  'rgba(46,43,36,0) 0%, ' +
  'rgba(46,43,36,0.03) 26%, ' +
  'rgba(46,43,36,0.09) 42%, ' +
  'rgba(46,43,36,0.17) 49%, ' +
  'rgba(252,247,237,0.95) 52%, ' +
  'rgba(252,247,237,0.55) 62%, ' +
  'rgba(252,247,237,0) 100%)';

/**
 * CREASE: the boundary where two panels of the sheet meet.
 *
 * The band is 32px tall and is laid out in normal flow, so it holds its own space and
 * can never overlay the block above it.
 *
 * `shadowOpacity` takes a MotionValue so the fold can relax as the reader scrolls past
 * — but it drives the SHADING ONLY. The crease line itself never fades: this used to be
 * a plain opacity on the whole divider, which relaxed the theme's one structural device
 * down to an invisible hairline by the time the reader had it on screen.
 */
export function CreaseDivider({
  shadowOpacity = 1,
  className,
}: {
  shadowOpacity?: number | MotionValue<number>;
  className?: string;
}) {
  return (
    <div className={cn('relative h-8 w-full', className)} aria-hidden="true">
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: shadowOpacity, backgroundImage: FOLD_SHADING }}
      />

      {/* The crease itself, pressed flat. Always at full strength. */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-inv-ink/30" />
    </div>
  );
}
