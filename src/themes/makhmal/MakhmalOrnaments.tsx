'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * مخمل's one ornament bin: passementerie, the trim on a curtain, at three scales.
 *
 * There is no second motif and no tile. The pleat gradient below IS the ground pattern,
 * which is why this file exports a function that builds CSS rather than a background
 * component: the fabric has to be paintable onto a fixed layer, a curtain half and a
 * cover ground from one definition, and a component cannot be handed to `backgroundImage`.
 *
 * Nothing here declares a colour. The pleats are pure shading — black and white alphas
 * over whatever `bg-inv-bg` happens to be — so the fabric is the theme's aubergine by
 * inheritance and would follow the palette anywhere else it were used. The cords and
 * fringes are `currentColor` and take their gold from a `text-inv-*` class on the caller.
 */

/**
 * The two pleat pitches, one pixel apart.
 *
 * That single pixel is the theme's scroll signature: stacked, the two gradients beat
 * against each other and the interference walks when the upper one slides. It is also
 * the theme's biggest risk — deliberate moiré on a DPR 2.75 Android can alias into
 * something that reads as a rendering fault rather than as velvet — so the upper layer
 * is always painted at reduced strength (see `pleatImage`'s second argument) to keep the
 * beat a soft swell instead of a hard fringe.
 */
export const PLEAT = { base: 26, nap: 27 } as const;

/**
 * One pleat: deep, mid, highlight, mid, back to deep, repeated across the viewport.
 *
 * Stops are placed as fractions of the pitch rather than in pixels so the 26px and the
 * 27px layers are the same fold drawn at two sizes, which is what makes their
 * interference read as one material rather than as two patterns.
 */
export function pleatImage(pitch: number, strength = 1): string {
  const alpha = (value: number) => (value * strength).toFixed(3);
  const at = (fraction: number) => (pitch * fraction).toFixed(2);

  return (
    'repeating-linear-gradient(90deg,' +
    `rgba(0,0,0,${alpha(0.34)}) 0px,` +
    `rgba(0,0,0,${alpha(0.1)}) ${at(0.3)}px,` +
    `rgba(255,255,255,${alpha(0.075)}) ${at(0.56)}px,` +
    `rgba(0,0,0,${alpha(0.14)}) ${at(0.8)}px,` +
    `rgba(0,0,0,${alpha(0.34)}) ${pitch}px)`
  );
}

/**
 * The sheen that rides on the upper pleat layer.
 *
 * The pleats are vertical, so translating the upper layer up the page does nothing to
 * them on its own — a vertical stripe looks identical after a vertical move. This band
 * is what the eye actually sees travelling: the nap catching the light as you scroll
 * past it, with the pitch interference giving the light something irregular to break on.
 */
export const NAP_SHEEN =
  'linear-gradient(180deg, rgba(255,255,255,0) 14%, rgba(255,255,255,0.055) 46%, rgba(255,255,255,0) 78%)';

/** A fold in the drape: the pleats darken through the band and recover. */
export const FOLD_SHADE =
  'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.46) 50%, rgba(0,0,0,0) 100%)';

/** The same band in white, driven to at most 0.08 opacity as a seam crosses the centre. */
export const FOLD_LIGHT =
  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)';

/**
 * The fold that seam 3 drags down over the poetry's inline-start edge.
 *
 * Physical 90deg, mirrored by `rtl:-scale-x-100` on the element rather than by a second
 * gradient, so there is one definition of the fold and both directions get the same one.
 */
export const FOLD_CROP =
  'linear-gradient(90deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.16) 55%, rgba(0,0,0,0) 100%)';

/**
 * Reduced motion, read directly.
 *
 * framer is wrapped in MotionConfig reducedMotion="user" by the parent, but that only
 * covers *animations*. Everything in this theme that moves is a scroll-linked motion
 * value — a binding, not an animation — and framer does not gate those, so the nap and
 * the seams have to ask the media query themselves or a reduced-motion guest still gets
 * a page that shifts under them.
 *
 * Starts false and resolves in an effect, which is correct rather than merely safe: at
 * scroll position zero every value in this theme is already at its rest offset, so the
 * one frame before the query resolves is identical to the reduced-motion state anyway.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Scale one: the tassel and cord, hung from the top edge behind the names.
 *
 * Drawn symmetric about its vertical axis apart from the cord's single loop, which is
 * the one asymmetric element in the theme and is therefore the one thing that has to
 * mirror. The caller flips it with `rtl:-scale-x-100`; a cord that curls the same
 * physical way in both directions reads as reversed to whichever reader is second.
 *
 * No gradients and no ids anywhere in here on purpose. This renders twice on a page in
 * the builder preview, and a literal gradient id would have the second copy silently
 * resolve against the first one's definition.
 */
export function TasselCord({ className }: { className?: string }) {
  // Nine strands splaying into a bell. The hem lifts at the edges rather than running
  // level, which is what stops a tassel skirt reading as a comb.
  const strands = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((step) => ({
    key: step,
    d:
      `M${(80 + step * 1.6).toFixed(1)} 151 ` +
      `Q${(80 + step * 3).toFixed(1)} 166 ${(80 + step * 10).toFixed(1)} ${190 - Math.abs(step) * 3}`,
  }));

  return (
    <svg
      viewBox="0 0 160 200"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {/* The cord: down from the rail, one loop crossing itself, then straight to the knot. */}
      <path
        d="M80 0 C80 20 82 30 92 40 C110 58 112 78 94 84 C78 89 68 76 78 66 C88 56 106 60 108 76 C110 94 92 108 84 116 C81 120 80 124 80 130"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* The knot the skirt hangs from. */}
      <path
        d="M66 132 C66 126 94 126 94 132 C94 144 88 152 80 152 C72 152 66 144 66 132 Z"
        fill="currentColor"
        fillOpacity="0.42"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M67.5 137H92.5" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <path d="M69 143.5H91" stroke="currentColor" strokeWidth="1" opacity="0.55" />

      {/* The binding across the top of the skirt, then the bell itself at 1px. */}
      <path d="M62 158 Q80 164 98 158" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      {strands.map((strand) => (
        <path key={strand.key} d={strand.d} stroke="currentColor" strokeWidth="1" opacity="0.85" />
      ))}
    </svg>
  );
}

/**
 * Scale two: the bullion fringe. A 60px cord with seven 8px pendants under it.
 *
 * Rendered at its natural 60px and never stretched. Scaling this to the width of the
 * page would take the 1px strokes with it, and a 3px fringe is the exact difference
 * between this theme and the WhatsApp-forward register it sits next to.
 */
export function BullionFringe({ className }: { className?: string }) {
  const pendants = [1, 2, 3, 4, 5, 6, 7].map((index) => index * 7.5);

  return (
    <svg
      viewBox="0 0 60 12"
      fill="none"
      width="60"
      height="12"
      className={cn('pointer-events-none block shrink-0', className)}
      aria-hidden="true"
      role="presentation"
    >
      <path d="M0 1.5H60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {pendants.map((x) => (
        <path
          key={x}
          d={`M${x} 1.5V9.5`}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

/**
 * Scale three: the heavier fringe running down the join of the closed curtain.
 *
 * Built from a repeating gradient rather than a repeated SVG because it has to fill an
 * unknown viewport height. An SVG would need either a `<pattern>` and an id, or one node
 * per tick down an 844px screen; a gradient is one paint on a layer that is about to be
 * translated, which is what the parting animation needs it to be.
 *
 * `edge` is physical, not logical. The closed curtain is symmetric about its centre and
 * must look identical in both directions, so the join is placed by side and never flips.
 */
export function JoinBullion({ edge }: { edge: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 w-3.5 text-inv-accent/45',
        edge === 'left' ? 'left-0' : 'right-0',
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute inset-y-0 w-px bg-inv-accent/60',
          edge === 'left' ? 'left-0' : 'right-0',
        )}
      />
      {/* The pendants, at the same 1px the horizontal fringe is drawn at. */}
      <span
        className={cn('absolute inset-y-0', edge === 'left' ? 'left-px right-0' : 'right-px left-0')}
        style={{
          backgroundImage: 'repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 11px)',
        }}
      />
    </div>
  );
}
