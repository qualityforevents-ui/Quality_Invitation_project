'use client';

import { useId } from 'react';
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
 *
 * Drawn in real pixels rather than through a `viewBox` with `preserveAspectRatio="none"`.
 * That box was 400 units wide and 4 tall stretched onto a 360-to-430px element three
 * pixels high, which scaled the stitch by a different factor on each axis: the dash
 * pitch drifted with the width of the phone and the 3px thread came out at 2.25. A seam
 * is the theme's one connective mark and it has to be the same stitch on every device.
 */
export function RunningStitchSeam({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-[3px] w-full overflow-hidden', className)} aria-hidden="true">
      <svg className="h-full w-full">
        <line
          x1="0"
          y1="1.5"
          x2="100%"
          y2="1.5"
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
 *
 * A TILE, repeated every 32px down the edge of the cloth. It used to be a `viewBox` of
 * 0 0 16 32 with `preserveAspectRatio="none"`, which meant the one stepped shape in the
 * pattern was stretched over the entire height of the field: a 400px-tall staircase with
 * three steps in it, which is why the tabs read as clipped rectangles rather than as
 * appliqué. With no viewBox the SVG user unit is the CSS pixel, so the pattern tiles at
 * the size it was drawn at and the battlement repeats the way cut cloth does.
 *
 * `side` is start/end, not physical: "left" is the inline start, which is the right hand
 * edge on the Arabic card. The end copy is mirrored so the two edges of a field are a
 * pair facing each other rather than the same profile twice.
 */
export function SteppedMerlonBorder({
  side = 'left',
  className,
}: {
  side?: 'left' | 'right';
  className?: string;
}) {
  /* One <pattern> per instance, and a field carries two. Sanitised because React's
     generated ids are not all valid inside a url(#…) reference. */
  const patternId = `merlon-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 w-4 overflow-hidden select-none',
        side === 'left' ? 'start-0' : 'end-0',
        className,
      )}
      style={side === 'left' ? undefined : { transform: 'scaleX(-1)' }}
      aria-hidden="true"
    >
      <svg className="h-full w-full text-inv-accent/40">
        <defs>
          <pattern id={patternId} width="16" height="32" patternUnits="userSpaceOnUse">
            {/* A stepped pyramid anchored on the cloth edge, symmetric about the middle
                of the tile, so the repeat reads as a row of merlons standing on a 6px
                selvedge. The earlier profile was a one-way staircase, which at a real
                repeat pitch would read as a sawtooth rather than as a battlement. */}
            <path
              d="M 0 0 L 6 0 L 6 6 L 11 6 L 11 12 L 16 12 L 16 20 L 11 20 L 11 26 L 6 26 L 6 32 L 0 32 Z"
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
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
