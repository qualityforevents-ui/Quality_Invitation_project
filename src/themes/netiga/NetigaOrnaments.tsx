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
 * The red calendar header band with punch holes and reversed text.
 */
export function CalendarHeaderBand({
  title,
  showPunchHoles = true,
  className,
}: {
  title?: string;
  showPunchHoles?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex h-8 w-full items-center justify-between bg-inv-accent px-4 text-inv-panel select-none',
        className,
      )}
    >
      {showPunchHoles ? (
        <span className="h-3 w-3 rounded-full bg-inv-bg shadow-inner border border-inv-line/30" />
      ) : <span className="w-3" />}

      {title ? (
        <span className="font-inv-display text-xs font-bold tracking-wider text-white">
          {title}
        </span>
      ) : null}

      {showPunchHoles ? (
        <span className="h-3 w-3 rounded-full bg-inv-bg shadow-inner border border-inv-line/30" />
      ) : <span className="w-3" />}
    </div>
  );
}
