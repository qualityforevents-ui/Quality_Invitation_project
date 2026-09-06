'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/**
 * اللوح ornaments: carved limestone slab, 45° chamfered cartouche, and stone bevels.
 *
 * HARD RULE: ZERO SECTION BREAKS. No rules, no dividers, no borders between sections.
 * All hierarchy is carried by size and interval.
 */

/** 11% Limestone tooth tile (CSS radial dots) */
export const LIMESTONE_TILE =
  'radial-gradient(circle at 3px 3px, rgba(30,28,23,0.06) 1px, transparent 1px), ' +
  'radial-gradient(circle at 8px 8px, rgba(30,28,23,0.045) 1px, transparent 1px)';

/** Chamfered edge style (inset highlight on top-left, shadow on bottom-right) */
export const CHAMFER_STYLE: CSSProperties = {
  boxShadow:
    'inset 2px 2px 0px rgba(255,255,255,0.45), inset -2px -2px 0px rgba(30,28,23,0.3)',
};

/** Recessed panel chamfer (reversed: dark on top-left, highlight on bottom-right) */
export const RECESSED_STYLE: CSSProperties = {
  boxShadow:
    'inset 2px 2px 0px rgba(30,28,23,0.35), inset -2px -2px 0px rgba(255,255,255,0.45)',
};

/**
 * Cut into stone text bevel style:
 * Highlight offset 1px down, shadow offset 1px up.
 */
export const CUT_BEVEL_CLASS =
  '[text-shadow:1px_1px_0px_rgba(255,255,255,0.4),-1px_-1px_0px_rgba(30,28,23,0.45)]';

/**
 * HERO: 130px Chamfered Cartouche holding couple's initials.
 * Rectangle with 45° cut corners and 2px accent inner keyline.
 */
export function Cartouche({
  initials,
  size = 130,
  className,
}: {
  initials?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center select-none', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 130 130" fill="none" className="h-full w-full">
        {/* Outer chamfered polygon */}
        <polygon
          points="20,4 110,4 126,20 126,110 110,126 20,126 4,110 4,20"
          fill="var(--inv-panel)"
          stroke="var(--inv-line)"
          strokeWidth="1.5"
        />
        {/* Inner keyline */}
        <polygon
          points="23,10 107,10 120,23 120,107 107,120 23,120 10,107 10,23"
          stroke="var(--inv-accent)"
          strokeWidth="2"
        />
      </svg>

      {initials ? (
        <span
          className={cn(
            'absolute font-inv-display text-2xl font-bold text-inv-ink',
            CUT_BEVEL_CLASS,
          )}
        >
          {initials}
        </span>
      ) : null}
    </div>
  );
}
