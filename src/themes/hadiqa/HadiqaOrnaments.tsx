'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * One species, drawn correctly, at three scales.
 *
 * The whole ornament vocabulary of this theme is jasmine — الفل — and nothing else. That
 * restriction is the point rather than a limitation: the retired floral theme reached for
 * a generic botanical set, sprigs and leaves and dots that belong to no particular plant,
 * and a generic plant reads as clip art no matter how well it is drawn. Jasmine is sold
 * on every street in Cairo, threaded on cotton and hung from a mirror, and it carries
 * real affection here in a way that a nameless sprig cannot.
 *
 * Everything below is stroke work in currentColor, so a wrapper's `text-inv-accent`
 * colours the whole vine and the theme's palette stays the single source of truth.
 */

/* ------------------------------------------------------------------ the stem */

/**
 * The serpentine, authored by hand.
 *
 * Fifteen points on an alternating axis, joined by cubics whose control handles are all
 * vertical, so every junction is smooth and the stem climbs rather than zig-zags. It was
 * placed by eye and then written down; a procedurally wiggled path — a sine, a random
 * walk, anything generated — is recognisably synthetic within about a second of looking
 * at it, and that recognition is the entire difference between a botanical plate and a
 * decorative border.
 *
 * The viewBox is 56 wide and the SVG is drawn with `preserveAspectRatio="none"`, so the
 * stem stretches to whatever height the card turns out to be. Stretching is safe for this
 * shape and only this shape: a smooth serpentine under vertical scale stays a smooth
 * serpentine, it merely becomes gentler on a long card and tighter on a short one, which
 * is what a real climbing stem does when it has more or less wall to cover. Nothing else
 * in this file is ever put inside that stretched box — every leaf, bud and blossom is its
 * own fixed-aspect SVG positioned over the top, because a stretched leaf is instantly
 * wrong.
 *
 * HOW MANY POINTS IS A CORRECTNESS QUESTION, NOT A TASTE ONE. The viewBox height is what
 * gets stretched onto the finished card, so the number of waves in it is the number of
 * waves the guest sees, whatever the card's length. Nine points over a 1000-tall box put
 * eight waves on a ~2000px card: one wave every 250px, carrying eighteen pixels of
 * sideways travel. At that ratio the curve is under five degrees off vertical and the
 * vine renders as a straight line with a slight lean — which is exactly what it did.
 * Fifteen points hold the authored proportion (roughly one wave per 150px of real card)
 * so the serpentine survives the stretch, and the shorter sub-paths also bound each
 * scroll repaint more tightly than the eight did.
 *
 * The x values are placed by eye and irregular on purpose. A vine whose every wave has
 * the same amplitude is a sine, and a sine is recognisably synthetic within a second of
 * looking at it.
 */
const STEM_X = [30, 18, 37, 21, 34, 17, 36, 22, 38, 19, 33, 20, 37, 24, 30];
const STEM_SEGMENT_HEIGHT = 125;

/** The vertical pull on each control handle. Tuned by eye against the 125px segment. */
const HANDLE = 46;

/**
 * Fourteen sub-paths with shared endpoints, and not one long path.
 *
 * The vine is drawn by scroll, which means a `stroke-dashoffset` that changes every
 * frame. On one path spanning the whole document that is a repaint of a region as tall
 * as the card on every frame of every scroll, and it is the single thing in this theme
 * that genuinely stutters on a mid-range Android. Split up, only the one or two segments
 * actually crossing the viewport are ever changing, and each repaint is bounded by a
 * segment rather than by the length of the invitation.
 *
 * The endpoints are shared rather than merely close: segment n ends exactly where
 * segment n+1 begins, so the fourteen strokes read as one stem with no seam.
 */
export const STEM_SEGMENTS: string[] = Array.from({ length: STEM_X.length - 1 }, (_, i) => {
  const y0 = i * STEM_SEGMENT_HEIGHT;
  const y1 = y0 + STEM_SEGMENT_HEIGHT;
  const x0 = STEM_X[i];
  const x1 = STEM_X[i + 1];

  return `M${x0} ${y0} C${x0} ${y0 + HANDLE}, ${x1} ${y1 - HANDLE}, ${x1} ${y1}`;
});

export const STEM_VIEWBOX = { width: 56, height: STEM_SEGMENT_HEIGHT * (STEM_X.length - 1) };

/* ---------------------------------------------------------------- the growths */

/**
 * A petal, pointing up from the calyx at the origin.
 *
 * Drawn once and rotated, because five hand-placed petals would be five chances to put
 * one slightly wrong, and a jasmine blossom is radially symmetric in a way an alternating
 * vine is not.
 */
const PETAL = 'M100 100 C88 74, 87 45, 100 30 C113 45, 112 74, 100 100 Z';

/** The five splayed angles of an open blossom. */
export const PETAL_ANGLES = [0, 72, 144, 216, 288];

/**
 * The same five petals, closed.
 *
 * A bud is not a small blossom: the petals furl around each other and overlap, so they
 * are gathered into a narrow fan rather than left at their splayed angles and scaled
 * down. These are the angles the cover animates FROM.
 */
export const BUD_ANGLES = [-16, -8, 0, 8, 16];

export function JasminePetal({ className }: { className?: string }) {
  return <path d={PETAL} className={className} />;
}

/**
 * The hero blossom, 200 by 200.
 *
 * Five petals, a calyx, and the two leaves that sit under a real jasmine flower. Outline
 * only: a filled blossom at this size becomes a blot, and the theme's whole register is
 * drawn rather than painted.
 */
export function JasmineBlossom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
        {PETAL_ANGLES.map((angle) => (
          <path key={angle} d={PETAL} transform={`rotate(${angle} 100 100)`} />
        ))}

        {/* The calyx, and the short stalk it sits on. */}
        <circle cx="100" cy="100" r="7" />
        <path d="M100 107 C100 128, 99 146, 96 168" strokeLinecap="round" />

        {/* Two leaves off the stalk, offset rather than opposite — jasmine is an
            alternating-leaf vine, and drawing them symmetrically is the commonest way to
            make a botanical look invented. */}
        <path d="M98 126 C82 122, 71 130, 66 142 C80 148, 93 141, 98 126 Z" />
        <path d="M97 148 C112 143, 124 150, 129 162 C114 168, 101 162, 97 148 Z" />
      </g>
    </svg>
  );
}

/**
 * The connective mark: a stem tick with one leaf above it and one below, offset.
 *
 * This is why the theme has no horizontal dividers anywhere. A rule drawn across the
 * column is the device every other card in the market uses to say "new section", and it
 * is also the device that makes a long card read as a list of boxes. Here the section
 * break happens ON the stem, in the margin, so the text column is never interrupted and
 * the eye follows one continuous line from the names to the footer.
 */
export function LeafNode({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" fill="none" className={cn('h-full w-full', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {/* The tick that anchors the node to the stem, so the leaves grow OFF the vine
            rather than floating beside it. */}
        <path d="M27 6 C22 13, 19 21, 17 30" strokeLinecap="round" opacity="0.7" />
        <path d="M4 8 C14 5, 22 8, 25 15 C15 18, 7 15, 4 8 Z" />
        <path d="M30 22 C20 19, 12 22, 9 29 C19 32, 27 29, 30 22 Z" />
      </g>
    </svg>
  );
}

/** A single unopened bud. Marks the date. */
export function JasmineBud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 34" fill="none" className={cn('h-full w-full', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M12 4 C18 11, 18 20, 12 25 C6 20, 6 11, 12 4 Z" />
        <path d="M12 25 C11 28, 11 30, 12 33" strokeLinecap="round" />
        <path d="M12 25 C8 24, 6 22, 5 19" strokeLinecap="round" />
        <path d="M12 25 C16 24, 18 22, 19 19" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * A tendril: the curl a climbing jasmine puts out to grab the wall, with one leaf on it.
 *
 * The vocabulary needed a third and a fourth mark, and this is the honest place to get
 * them. The ornament is an index of the sections, and an index whose every entry is the
 * same glyph indexes nothing — with only a leaf node, a bud and an open flower to hand,
 * six of the nine growths on a full card were the same two-leaf node at slightly
 * different sizes, which reads as a repeated decoration rather than as a mark that means
 * "this block". A tendril and a three-leaf sprig are both things a real jasmine does, so
 * the one-species rule is intact and the marks are now distinguishable at a glance.
 */
export function JasmineTendril({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 34" fill="none" className={cn('h-full w-full', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {/* The curl. It leaves the stem, runs down, and closes on itself. */}
        <path
          d="M5 3 C11 10, 14 18, 13 26 C12.4 30.4, 16 32.6, 18.6 30.4 C20.6 28.6, 19.6 25.6, 16.4 26.2"
          strokeLinecap="round"
        />
        <path d="M9 9 C16 5, 23 7, 26 13 C18 17, 11 15, 9 9 Z" />
      </g>
    </svg>
  );
}

/** Three leaves off one short shoot. The fuller mark, for the closing blocks. */
export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 34" fill="none" className={cn('h-full w-full', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M6 3 C12 11, 15 20, 15 31" strokeLinecap="round" opacity="0.7" />
        <path d="M10 8 C17 4, 24 6, 27 12 C19 16, 12 14, 10 8 Z" />
        <path d="M13 17 C7 14, 3 9, 3 3 C10 6, 14 11, 13 17 Z" />
        <path d="M15 24 C22 21, 28 23, 30 28 C23 31, 17 29, 15 24 Z" />
      </g>
    </svg>
  );
}

/** A blossom at node scale, fully open. Marks the countdown. */
export function OpenFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={cn('h-full w-full', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        {PETAL_ANGLES.map((angle) => (
          <path key={angle} d={PETAL} transform={`rotate(${angle} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="9" />
      </g>
    </svg>
  );
}

/**
 * The ground: single leaves scattered at a wide pitch, very faint.
 *
 * A data URI rather than a repeated DOM element, so a card of any length costs one
 * background-image and no nodes. The pitch is 140px and the tile is authored at that
 * exact size and never scaled — a pattern that is resampled interferes with the device
 * pixel grid and shimmers as you scroll, which on a pale ground is the one artefact a
 * guest will notice without being able to say why.
 *
 * accentSoft is 1.79:1 on this ground, which is below every text threshold. That is
 * correct and deliberate: this is texture, it carries no information, and at 6% it should
 * be felt rather than read.
 */
export const LEAF_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='none' stroke='%23a9bda0' stroke-width='1'%3E%3Cpath d='M18 30 C28 27, 36 30, 39 37 C29 40, 21 37, 18 30 Z'/%3E%3Cpath d='M96 18 C106 15, 114 18, 117 25 C107 28, 99 25, 96 18 Z' transform='rotate(34 106 21)'/%3E%3Cpath d='M52 92 C62 89, 70 92, 73 99 C63 102, 55 99, 52 92 Z' transform='rotate(-22 62 95)'/%3E%3Cpath d='M108 104 C118 101, 126 104, 129 111 C119 114, 111 111, 108 104 Z' transform='rotate(64 118 107)'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * A gradient mask id is generated per instance.
 *
 * Not defensive coding: this card renders twice on one page in the builder, once in the
 * preview panel and once behind it, and two identical SVG ids in one document both
 * resolve to whichever the parser saw first. The symptom is one of the two cards losing
 * its vine for no visible reason.
 */
export function useOrnamentId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id.replace(/:/g, '')}`;
}
