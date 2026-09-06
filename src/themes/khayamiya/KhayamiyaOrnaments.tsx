'use client';

import { cn } from '@/lib/cn';

/**
 * خيامية ornaments: flat cut cloth, running stitch seams, lotus palmettes,
 * stepped merlons, and the eight-petal tentmaker medallion.
 *
 * HARD RULE: ZERO GRADIENTS ANYWHERE, NO STROKE UNDER 2px.
 * The entire craft relies on looking stitched and cut, never printed or blended.
 */

/**
 * CONNECTIVE: Running stitch seam between two cloths.
 * A 3px dashed stroke with round caps in cream.
 */
export function RunningStitchSeam({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-[3px] w-full overflow-hidden', className)} aria-hidden="true">
      <svg viewBox="0 0 400 4" preserveAspectRatio="none" className="h-full w-full">
        <line
          x1="0"
          y1="2"
          x2="400"
          y2="2"
          stroke="var(--inv-ink)"
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Stepped merlon (شرافة) border for field edges.
 */
export function SteppedMerlonBorder({
  side = 'left',
  className,
}: {
  side?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 w-4 overflow-hidden select-none',
        side === 'left' ? 'start-0' : 'end-0',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 32"
        preserveAspectRatio="none"
        className="h-full w-full text-inv-accent/40"
      >
        <pattern id={`merlon-${side}`} width="16" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 0 0 L 16 0 L 16 8 L 10 8 L 10 16 L 4 16 L 4 24 L 0 24 Z"
            fill="currentColor"
          />
        </pattern>
        <rect width="16" height="100%" fill={`url(#merlon-${side})`} />
      </svg>
    </div>
  );
}

/**
 * HERO: Eight-petal mosque floor medallion.
 * ViewBox 0 0 200 200. Alternating gold (accent) and teal (accentSoft).
 */
export function EightPetalMedallion({
  size = 200,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={cn('shrink-0', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      {/* 8 radiating teardrop petals */}
      <g transform="translate(100, 100)">
        {petals.map((angle, idx) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path
              d="M 0 -22 C -14 -40 -18 -68 0 -92 C 18 -68 14 -40 0 -22 Z"
              fill={idx % 2 === 0 ? 'var(--inv-accent)' : 'var(--inv-accent-soft)'}
            />
            {/* Inner appliqué stitch */}
            <path
              d="M 0 -30 C -9 -45 -11 -65 0 -82 C 11 -65 9 -45 0 -30 Z"
              stroke="var(--inv-ink)"
              strokeWidth="2"
              strokeDasharray="4 3"
              fill="none"
              opacity="0.8"
            />
          </g>
        ))}
        {/* Central disc */}
        <circle cx="0" cy="0" r="22" fill="var(--inv-accent)" />
        <circle cx="0" cy="0" r="16" fill="var(--inv-panel)" />
        <circle
          cx="0"
          cy="0"
          r="16"
          stroke="var(--inv-ink)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      </g>
    </svg>
  );
}

/**
 * CONNECTIVE: The lotus palmette (five-lobed fan on stem).
 * ViewBox 0 0 60 80.
 */
export function LotusPalmette({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 60 80"
      fill="none"
      className={cn('inline-block', className)}
      style={{ width: `${size}px`, height: `${size * 1.33}px` }}
      aria-hidden="true"
    >
      {/* 5-lobed fan */}
      <path
        d="M 30 70 C 30 50 10 50 8 36 C 6 22 20 20 20 12 C 20 4 30 2 30 2 C 30 2 40 4 40 12 C 40 20 54 22 52 36 C 50 50 30 50 30 70 Z"
        fill="var(--inv-accent)"
      />
      <path
        d="M 30 62 C 30 46 16 46 15 35 C 14 24 24 22 24 16 C 24 10 30 8 30 8 C 30 8 36 10 36 16 C 36 22 46 24 45 35 C 44 46 30 46 30 62 Z"
        stroke="var(--inv-ink)"
        strokeWidth="2"
        strokeDasharray="4 3"
        fill="var(--inv-panel)"
      />
      {/* Stem */}
      <path d="M 30 70 L 30 78" stroke="var(--inv-ink)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
