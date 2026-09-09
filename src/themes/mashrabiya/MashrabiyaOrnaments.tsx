'use client';

import { cn } from '@/lib/cn';

/**
 * مشربية ornaments: turned wood (خرط) bobbins, rosettes, and hexagonal aperture voids.
 */

/**
 * 22px turned-wood lattice tile.
 *
 * MUST be painted with `backgroundSize: LATTICE_TILE_SIZE`. A CSS gradient with no
 * background-size sizes itself to the whole element, so an untiled copy of this draws
 * one lone ring in the top corner of the viewport and two enormous diagonal bands —
 * which is exactly what shipped: the screen was invisible and the one ring read as a
 * stray circle clipped by the edge of the phone. The size constant lives beside the
 * tile so the two can no longer be separated.
 *
 * Even pixel size, authored never to be scaled: an odd or fractional tile behind the
 * 0.35x parallax layer is the interference pair that aliases on mid-range Android.
 */
export const LATTICE_TILE_SIZE = '22px 22px';

export const LATTICE_TILE =
  // The turned ring at the centre of every cell.
  'radial-gradient(circle at 11px 11px, transparent 5px, rgba(111,61,22,0.30) 6px, rgba(111,61,22,0.30) 8px, transparent 9px), ' +
  // One node at the cell corner; the repeat supplies the other three quarters of it.
  'radial-gradient(circle at 0 0, rgba(111,61,22,0.26) 2px, transparent 3px), ' +
  // The struts the nodes are pegged into.
  'linear-gradient(45deg, transparent 9px, rgba(111,61,22,0.18) 9px, rgba(111,61,22,0.18) 12px, transparent 12px), ' +
  'linear-gradient(-45deg, transparent 9px, rgba(111,61,22,0.18) 9px, rgba(111,61,22,0.18) 12px, transparent 12px)';

/**
 * THE BOBBIN: a vesica/lens turned on a lathe.
 * Upright viewBox is 0 0 16 40; 6px waist at mid-height.
 *
 * `horizontal` re-authors the viewBox rather than rotating the box. `rotate-90` on a
 * 16x40 drawing crammed into a wide box left the artwork letterboxed to a fraction of
 * its own footprint, which is why the divider read as three tiny lozenges adrift in a
 * band twice their width.
 */
export function Bobbin({
  className,
  horizontal = false,
}: {
  className?: string;
  horizontal?: boolean;
}) {
  return (
    <svg
      viewBox={horizontal ? '0 0 40 16' : '0 0 16 40'}
      fill="none"
      className={cn(
        'shrink-0 text-inv-accent',
        horizontal ? 'h-3 w-[30px]' : 'h-10 w-4',
        className,
      )}
      aria-hidden="true"
    >
      {/* (x,y) -> (40 - y, x): the upright drawing laid on its side, exactly filling the
          horizontal viewBox with no letterboxing. */}
      <g transform={horizontal ? 'translate(40 0) rotate(90)' : undefined}>
        <path
          d="M 8 0 C 1 12 5 20 8 20 C 11 20 15 12 8 0 Z"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M 8 40 C 1 28 5 20 8 20 C 11 20 15 28 8 40 Z"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <circle cx="8" cy="20" r="2.5" fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * CONNECTIVE: a run of bobbins laid end to end horizontally.
 *
 * `count` exists so the divider is not the same object every time it appears. A run of
 * three separates the two people in the roles void and lifts the couple's own line; a
 * single bobbin is the mark between the date and the time, which is a smaller seam and
 * should not be given the same weight.
 *
 * Carries no margin of its own — the caller states the gap from the card's rhythm scale.
 */
export function BobbinDivider({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-center gap-1.5 text-inv-accent', className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <Bobbin key={index} horizontal />
      ))}
    </div>
  );
}

/**
 * HERO: Six-lobed rosette (six bobbins radiating at 60°).
 * ViewBox 0 0 200 200. Used once per card, at the head of the names void.
 */
export function SixLobedRosette({
  size = 180,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn('shrink-0 text-inv-accent', className)}
      aria-hidden="true"
    >
      <g transform="translate(100, 100)">
        {angles.map((deg) => (
          <g key={deg} transform={`rotate(${deg}) translate(-8, -80)`}>
            {/* Stroke and fill are heavier than the 1.5px the ornament was authored at:
                a 200-unit drawing shown at ~108px puts a 1.5px stroke below one device
                pixel, which is what left the crest reading as a thin asterisk rather
                than six turned bobbins. */}
            <path
              d="M 8 0 C 1 20 4 38 8 45 C 12 38 15 20 8 0 Z"
              stroke="currentColor"
              strokeWidth="2.4"
              fill="currentColor"
              fillOpacity="0.28"
            />
            <circle cx="8" cy="45" r="4" fill="currentColor" />
          </g>
        ))}
        {/* Central hub */}
        <circle cx="0" cy="0" r="14" stroke="currentColor" strokeWidth="1.5" fill="var(--inv-bg)" />
        <circle cx="0" cy="0" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Flat-top hexagon on a honeycomb pitch of 1.5r horizontally, 1.732r vertically. */
function hexagonPoints(cx: number, cy: number, r: number) {
  return [0, 60, 120, 180, 240, 300]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return `${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`;
    })
    .join(' ');
}

const GRILLE_RADIUS = 26;

/** Seven cells of the screen: one centre and its six neighbours. */
const GRILLE_CELLS: Array<[number, number]> = [
  [80, 70],
  [80, 25],
  [80, 115],
  [41, 47.5],
  [41, 92.5],
  [119, 47.5],
  [119, 92.5],
];

/**
 * THE GRILLE: the ground tile drawn at hero scale — a قمرية, seven cells of the screen
 * itself. Not a fourth ornament; it is the lattice, enlarged.
 *
 * It exists because the card has one photo void and that void is empty on most
 * invitations. Filling it with the same six-lobed rosette that already crowns the names
 * printed the identical shape twice in one card and left the void carrying nothing. A
 * fragment of the screen is the honest answer to "what do you see where the photograph
 * would be" on a card whose whole idea is a window: you see the window.
 */
export function TurnedGrille({ size = 150, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      style={{ width: `${size}px`, height: `${(size * 140) / 160}px` }}
      className={cn('shrink-0 text-inv-accent', className)}
      aria-hidden="true"
    >
      {GRILLE_CELLS.map(([cx, cy], index) => (
        <g key={`${cx}-${cy}`}>
          <polygon
            points={hexagonPoints(cx, cy, GRILLE_RADIUS)}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity={index === 0 ? 0.14 : 0.06}
          />
          <circle cx={cx} cy={cy} r={index === 0 ? 5 : 3} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

/**
 * HEXAGONAL VOID: a clear aperture cut into the turned-wood screen.
 *
 * POSITION. The three alignments are auto inline margins, not `self-*`. Flex alignment
 * was the original mechanism and it never ran: every void is wrapped in a Reveal, so
 * the void is a block child of a block, `align-self` applied to nothing, and the
 * left/right edges that shipped came from the CSS over-constrained-margin rule instead.
 * That is how both the start-hung and the end-hung voids ended up hanging off the same
 * side of the card, 8px apart, and why the stagger read as misalignment. Auto margins
 * resolve identically whether the parent is a block or a flex container.
 *
 * MEASURE. The void is the column less one stagger step, so the three positions are
 * inline-start / centred / inline-end of one 28px offset: every void is the same width,
 * every inline-start edge is one of two values, and every inline-end edge is one of the
 * same two. The reading measure is the void less its 24px side padding — 244px at a
 * 360px viewport, which is the number the whole theme was authored from.
 */
export function HexagonalVoid({
  align = 'center',
  children,
  className,
}: {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  className?: string;
}) {
  const alignClass = align === 'start' ? 'me-auto' : align === 'end' ? 'ms-auto' : 'mx-auto';

  return (
    <div
      className={cn(
        /*
         * Three shadows, and each is doing structural work rather than decoration: a
         * 6px band of darker wood outside the rim is the thickness of the screen seen
         * at the cut, the gold hairline inside it is the moulding on the opening, and
         * the drop is what tells you the ground continues behind. Without them an
         * opaque rounded rectangle on a pattern reads as a card lying on top of the
         * pattern, which is the one thing this theme must never look like.
         */
        'relative w-[calc(100%_-_28px)] rounded-[28px] border-2 border-inv-accent/55 bg-inv-bg px-6 py-7 shadow-[0_0_0_6px_rgba(111,61,22,0.09),inset_0_0_0_1px_rgba(200,160,106,0.55),0_18px_30px_-22px_rgba(36,28,20,0.6)]',
        alignClass,
        className,
      )}
    >
      {/* A container, so the Bismillah ligature can be sized against the measure it has
          to fit rather than against the viewport. */}
      <div className="@container text-center">{children}</div>
    </div>
  );
}
