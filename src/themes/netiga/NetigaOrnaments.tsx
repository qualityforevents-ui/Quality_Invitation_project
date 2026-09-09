'use client';

import { cn } from '@/lib/cn';
import type { Lang } from '@/lib/types';

/**
 * النتيجة ornaments: the torn calendar page edge, pulp board tile, and header punch bands.
 */

/** Coarse cardboard backing tile */
export const PULP_BOARD_TILE =
  'repeating-linear-gradient(30deg, rgba(31,29,26,0.05) 0px, rgba(31,29,26,0.05) 1px, transparent 1px, transparent 5px)';

/**
 * 40-step irregular torn top edge (fixed authored path data).
 * ViewBox 0 0 342 24.
 */
export const TORN_EDGE_PATH =
  'M 0 24 ' +
  'L 0 10 L 8 12 L 17 9 L 26 14 L 34 8 L 43 11 L 52 7 L 60 13 L 69 9 L 77 12 ' +
  'L 86 8 L 94 13 L 103 9 L 112 11 L 120 7 L 129 12 L 137 9 L 146 14 L 154 8 ' +
  'L 163 11 L 171 7 L 180 13 L 189 9 L 197 12 L 206 8 L 214 13 L 223 9 L 231 11 ' +
  'L 240 7 L 249 12 L 257 9 L 266 14 L 274 8 L 283 11 L 291 7 L 300 13 L 309 9 ' +
  'L 317 12 L 326 8 L 334 11 L 342 10 L 342 24 Z';

/**
 * Format digits as Arabic-Indic for Arabic netiga, or standard Latin for English.
 *
 * Every numeral on the card goes through here — the day, the year, the clock, the
 * countdown AND the verse citation. A نتيجة that mixes ٢٤ with 21 is not a نتيجة.
 */
export function formatNetigaDigits(val: number | string, lang: Lang): string {
  if (lang !== 'AR') return String(val);
  const arabicIndicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(val).replace(/\d/g, (d) => arabicIndicDigits[Number(d)]);
}

/**
 * The torn edge SVG element at the top of a ripped leaf.
 */
export function TornEdge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 342 24"
      fill="currentColor"
      preserveAspectRatio="none"
      className={cn('h-3.5 w-full text-inv-panel', className)}
      aria-hidden="true"
    >
      <path d={TORN_EDGE_PATH} />
      {/* 1px boundary line */}
      <path
        d="M 0 10 L 8 12 L 17 9 L 26 14 L 34 8 L 43 11 L 52 7 L 60 13 L 69 9 L 77 12 L 86 8 L 94 13 L 103 9 L 112 11 L 120 7 L 129 12 L 137 9 L 146 14 L 154 8 L 163 11 L 171 7 L 180 13 L 189 9 L 197 12 L 206 8 L 214 13 L 223 9 L 231 11 L 240 7 L 249 12 L 257 9 L 266 14 L 274 8 L 283 11 L 291 7 L 300 13 L 309 9 L 317 12 L 326 8 L 334 11 L 342 10"
        fill="none"
        stroke="var(--inv-line)"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * The red calendar header band: the binding strip at the top of every leaf.
 *
 * Three fixed slots, so the band is the same object on every leaf of the pad rather
 * than a bar that appears on some of them. The punch holes are pinned to the inline
 * edges with logical `start`/`end` so the pad binds on the correct side in both
 * directions; the leaf's index sits beside the start hole, reversed out of the red;
 * the title sits optically centred between them.
 *
 * The index is the leaf number and nothing else — it is deliberately NOT zero padded,
 * because ٠٢ sets the Arabic-Indic zero as a low dot and a guest reads the result as a
 * stray full stop rather than as a page number.
 */
export function CalendarHeaderBand({
  title,
  index,
  showPunchHoles = true,
  className,
}: {
  title?: string;
  index?: string;
  showPunchHoles?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-9 w-full items-center justify-center rounded-t-sm bg-inv-accent px-12 py-1.5 text-white select-none',
        className,
      )}
    >
      {/* Binding hardware, pinned to the inline start: the hole and the leaf's number. */}
      <span className="absolute start-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        {showPunchHoles ? (
          <span className="h-3 w-3 rounded-full border border-inv-line/30 bg-inv-bg shadow-inner" />
        ) : null}
        {index ? (
          <span className="numeric font-inv-body text-[0.6875rem] font-semibold text-white/80">
            {index}
          </span>
        ) : null}
      </span>

      {title ? (
        <span className="text-center font-inv-display text-[0.8125rem] font-bold leading-snug text-white">
          {title}
        </span>
      ) : null}

      {showPunchHoles ? (
        <span className="absolute end-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-inv-line/30 bg-inv-bg shadow-inner" />
      ) : null}
    </div>
  );
}
