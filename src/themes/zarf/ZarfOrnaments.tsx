'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * الظرف ornaments: wax seal, wax drip connective rule, and laid-paper tile.
 *
 * All geometry is authored as fixed path data — never randomised at runtime —
 * to ensure absolute server/client hydration fidelity.
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

      {monogram ? (
        <span className="absolute font-inv-display text-[length:min(2.5rem,28cqw)] font-semibold text-inv-panel select-none">
          {monogram}
        </span>
      ) : null}
    </div>
  );
}

/**
 * CONNECTIVE: Wax-drip divider rule.
 *
 * A 1px rule stopping 40px short of both margins with an 8px lozenge (sealing-wax drip) at center.
 */
export function WaxDripRule({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative flex items-center justify-center py-5 px-10', className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-inv-line/60" />
      <span className="mx-3 h-2 w-2 rotate-45 rounded-[1px] bg-inv-accent/80 shadow-xs" />
      <span className="h-px flex-1 bg-inv-line/60" />
    </div>
  );
}

/**
 * CREASE: A boundary where two panels meet with folded paper shadow relaxation.
 */
export function CreaseDivider({
  shadowOpacity = 0.35,
  className,
}: {
  shadowOpacity?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative my-8 w-full', className)} aria-hidden="true">
      {/* 3px crease band with central hairline */}
      <div className="h-[3px] w-full border-b border-inv-line/40 bg-inv-panel/60" />

      {/* Crease shadow that relaxes flat as user scrolls past */}
      <div
        className="pointer-events-none absolute -top-3 inset-x-0 h-3 bg-gradient-to-t from-[rgba(46,43,36,0.12)] to-transparent transition-opacity duration-300"
        style={{ opacity: shadowOpacity }}
      />
    </div>
  );
}
