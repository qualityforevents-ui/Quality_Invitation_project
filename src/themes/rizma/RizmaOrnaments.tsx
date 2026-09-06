'use client';

import { cn } from '@/lib/cn';

/**
 * الرزمة ornaments: cotton table ground, blind-embossed crest, and letterpress deckle.
 *
 * HARD RULE: Hard 2px offset shadow with ZERO blur. No soft Material shadows.
 * Ivory insert cards carry zero background pattern.
 */

/** 12% cotton tile on table only */
export const COTTON_TABLE_TILE =
  'repeating-linear-gradient(45deg, rgba(38,36,31,0.04) 0px, rgba(38,36,31,0.04) 1px, transparent 1px, transparent 6px), ' +
  'repeating-linear-gradient(-45deg, rgba(38,36,31,0.04) 0px, rgba(38,36,31,0.04) 1px, transparent 1px, transparent 6px)';

/**
 * HERO: Blind-embossed crest (140px girih rosette skeleton).
 * Rendered with a double stroke (1px shadow + 1px highlight) so it looks pressed into paper.
 */
export function BlindEmbossedCrest({
  size = 140,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const arcs = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      <g transform="translate(70, 70)">
        {/* Outer hexagon */}
        <polygon
          points="0,-54 46.7,-27 46.7,27 0,54 -46.7,27 -46.7,-27"
          stroke="var(--inv-line)"
          strokeWidth="1.2"
        />
        <polygon
          points="1,-53 47.7,-26 47.7,28 1,55 -45.7,28 -45.7,-26"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
        />

        {/* 6 overlapping arcs creating girih rosette */}
        {arcs.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            {/* Highlight pass */}
            <path
              d="M 0 -48 C 24 -48 40 -24 40 0"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.2"
              fill="none"
              transform="translate(1, 1)"
            />
            {/* Deboss shadow pass */}
            <path
              d="M 0 -48 C 24 -48 40 -24 40 0"
              stroke="var(--inv-line)"
              strokeWidth="1.2"
              fill="none"
            />
          </g>
        ))}

        {/* Central embossed ring */}
        <circle cx="1" cy="1" r="14" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="14" stroke="var(--inv-line)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/**
 * Card top-edge rule with centered 3px 45°-rotated diamond.
 */
export function CardTopRule({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center py-2 px-6', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-inv-accent/40" />
      <span className="mx-2.5 h-1.5 w-1.5 rotate-45 bg-inv-accent" />
      <span className="h-px flex-1 bg-inv-accent/40" />
    </div>
  );
}
