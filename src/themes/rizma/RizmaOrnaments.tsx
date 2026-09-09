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
 * The two passes that make a mark look pressed into paper rather than printed on it:
 * a tonal shadow, and a highlight offset one pixel down-right of it.
 *
 * The shadow used to be --inv-line, which is rgba(38,36,31,0.18) in this theme. On an
 * ivory card at 1.2px that is roughly nothing, and the flagship no-photo state — a card
 * carrying only this crest — was photographing as an empty rectangle with a faint
 * octagon in it. A deboss is a shadow, so it is written as one here and it is dark
 * enough to survive a phone screen in daylight. Still tonal, still not the accent: the
 * moment this takes a colour it is printed, and the theme's whole claim is that it is not.
 */
const DEBOSS = 'rgba(38,36,31,0.34)';
const EMBOSS_HIGHLIGHT = 'rgba(255,255,255,0.95)';

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
          points="1,-53 47.7,-26 47.7,28 1,55 -45.7,28 -45.7,-26"
          stroke={EMBOSS_HIGHLIGHT}
          strokeWidth="1.4"
        />
        <polygon
          points="0,-54 46.7,-27 46.7,27 0,54 -46.7,27 -46.7,-27"
          stroke={DEBOSS}
          strokeWidth="1.4"
        />

        {/* Inner hexagon, turned 30°, so the rosette has a girih lattice to sit in
            rather than one lonely outline. */}
        <polygon
          points="35,1 17.5,31.3 -17.5,31.3 -35,1 -17.5,-29.3 17.5,-29.3"
          stroke={EMBOSS_HIGHLIGHT}
          strokeWidth="1.4"
        />
        <polygon
          points="34,0 17,30.3 -17,30.3 -34,0 -17,-30.3 17,-30.3"
          stroke={DEBOSS}
          strokeWidth="1.4"
        />

        {/* 6 overlapping arcs creating girih rosette */}
        {arcs.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            {/* Highlight pass */}
            <path
              d="M 0 -48 C 24 -48 40 -24 40 0"
              stroke={EMBOSS_HIGHLIGHT}
              strokeWidth="1.4"
              fill="none"
              transform="translate(1, 1)"
            />
            {/* Deboss shadow pass */}
            <path
              d="M 0 -48 C 24 -48 40 -24 40 0"
              stroke={DEBOSS}
              strokeWidth="1.4"
              fill="none"
            />
          </g>
        ))}

        {/* Central embossed ring */}
        <circle cx="1" cy="1" r="14" stroke={EMBOSS_HIGHLIGHT} strokeWidth="1.4" />
        <circle cx="0" cy="0" r="14" stroke={DEBOSS} strokeWidth="1.4" />
        <circle cx="0" cy="0" r="4" stroke={DEBOSS} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/**
 * The card's top-edge rule, carrying that card's INDEX MARK: one 6px accent diamond per
 * card position, so card three shows three.
 *
 * It drew a single diamond on every card, which put the identical ornament on the page
 * four and five times over — the one thing an ornament may not do. Counting is the fix
 * that costs nothing and gains something: the connective ornament becomes the object's
 * number in the bundle, which is what the theme is about. The row is symmetric, so it
 * needs no mirroring in RTL.
 */
export function CardTopRule({
  index = 1,
  className,
}: {
  index?: number;
  className?: string;
}) {
  const marks = Array.from({ length: Math.min(Math.max(index, 1), 5) }, (_, i) => i);

  return (
    <div className={cn('relative flex items-center justify-center py-2 px-6', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-inv-accent/40" />
      <span className="mx-2.5 flex shrink-0 items-center gap-1.5">
        {marks.map((mark) => (
          <span key={mark} className="h-1.5 w-1.5 rotate-45 bg-inv-accent" />
        ))}
      </span>
      <span className="h-px flex-1 bg-inv-accent/40" />
    </div>
  );
}
