'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { EASE_OUT } from '@/lib/motion';

/**
 * الإيوان — the stone the theme is cut from.
 *
 * One bin at three scales: the horseshoe arch that crowns the page, the muqarnas cells
 * that fill a half dome, and the ablaq course that stripes a wall. Nothing here is round
 * and nothing here is a rule: this theme has no dividers, so a three voussoir stub is
 * what stands where another theme would draw a line.
 *
 * Everything is drawn about the vertical axis, so the whole vocabulary is identical in
 * Arabic and in English and none of it needs a direction to be correct.
 */

/* -------------------------------------------------------------------------------- */
/* The measure                                                                        */
/* -------------------------------------------------------------------------------- */

/**
 * The frame's own width, and the only width in the theme.
 *
 * There is no max-width token here on purpose: the arch defines the reading measure and
 * every block is padded in from these two legs rather than centred inside a container.
 * Written against `vw` rather than `%` because it is read by descendants at several
 * depths — a percentage would resolve against whichever element happened to be asking,
 * and the crown (which is deliberately wider than the frame) would size itself off the
 * frame instead of off the page.
 */
export const FRAME_STYLE = { '--iwan-frame': 'min(342px, calc(100vw - 56px))' } as CSSProperties;

/** How far each block is padded in from the legs, per haunch. 342 → 315 → 296 → 286. */
export const TIER_INSET = [0, 13.5, 23, 28] as const;

/**
 * Air between the wall and the text.
 *
 * Without it the first glyph of every line touches a 2px stone leg, which reads as a
 * layout bug rather than as a column standing inside an arch.
 */
export const GUTTER = 16;

/* -------------------------------------------------------------------------------- */
/* Arch geometry                                                                      */
/* -------------------------------------------------------------------------------- */

const RAD = Math.PI / 180;
const f = (n: number) => Math.round(n * 100) / 100;

type Band = {
  cx: number;
  cy: number;
  /** Extrados — the outer face of the voussoirs. */
  rxo: number;
  ryo: number;
  /** Intrados — the opening. */
  rxi: number;
  ryi: number;
  /**
   * How far past the horizontal the arc carries on, in degrees.
   *
   * This is the whole horseshoe. At zero the arch is a plain semicircle; carrying it on
   * past the springing is what makes the opening narrower at the impost than it is at
   * its widest, and it is the single feature that says Cairo rather than Rome.
   */
  spring: number;
  count: number;
  /** The y the piers run down to, normally the bottom of the viewBox. */
  foot: number;
};

function at(cx: number, cy: number, rx: number, ry: number, deg: number): [number, number] {
  return [cx + rx * Math.cos(deg * RAD), cy - ry * Math.sin(deg * RAD)];
}

function xy([x, y]: [number, number]): string {
  return `${f(x)} ${f(y)}`;
}

/**
 * Every path a voussoired arch needs, from one description.
 *
 * The crown at the top of the page and the little arch the photo is cut to are the same
 * drawing at two scales, which is the point: a window in a wall is the wall's own arch,
 * smaller. Returning strings rather than elements keeps that shared while letting each
 * caller decide what it strokes and what it fills.
 */
function band(b: Band) {
  const a0 = -b.spring;
  const a1 = 180 + b.spring;
  const step = (a1 - a0) / b.count;

  const out = (deg: number) => at(b.cx, b.cy, b.rxo, b.ryo, deg);
  const inn = (deg: number) => at(b.cx, b.cy, b.rxi, b.ryi, deg);

  // large-arc-flag 1 because the horseshoe is more than half a turn; sweep-flag 0
  // because y grows downward in SVG, so rising angles run anticlockwise on screen.
  const extrados =
    `M ${f(out(a0)[0])} ${f(b.foot)} L ${xy(out(a0))}` +
    ` A ${f(b.rxo)} ${f(b.ryo)} 0 1 0 ${xy(out(a1))}` +
    ` L ${f(out(a1)[0])} ${f(b.foot)}`;

  const intradosArc = `M ${xy(inn(a0))} A ${f(b.rxi)} ${f(b.ryi)} 0 1 0 ${xy(inn(a1))}`;

  const intradosWithJambs =
    `M ${f(inn(a0)[0])} ${f(b.foot)} L ${xy(inn(a0))}` +
    ` A ${f(b.rxi)} ${f(b.ryi)} 0 1 0 ${xy(inn(a1))}` +
    ` L ${f(inn(a1)[0])} ${f(b.foot)}`;

  const opening = `${intradosWithJambs} Z`;

  /** The ablaq half of the course: every other stone filled, keystone included. */
  const stones: string[] = [];
  for (let i = 0; i < b.count; i += 2) {
    const t0 = a0 + i * step;
    const t1 = t0 + step;
    stones.push(
      `M ${xy(inn(t0))} L ${xy(out(t0))}` +
        ` A ${f(b.rxo)} ${f(b.ryo)} 0 0 0 ${xy(out(t1))}` +
        ` L ${xy(inn(t1))}` +
        ` A ${f(b.rxi)} ${f(b.ryi)} 0 0 1 ${xy(inn(t0))} Z`,
    );
  }

  const joints: string[] = [];
  for (let i = 1; i < b.count; i += 1) {
    const t = a0 + i * step;
    joints.push(`M ${xy(inn(t))} L ${xy(out(t))}`);
  }

  /** The two end joints, drawn heavier: they are the impost the arch sits on. */
  const imposts = [
    `M ${xy(inn(a0))} L ${xy(out(a0))}`,
    `M ${xy(inn(a1))} L ${xy(out(a1))}`,
  ];

  return { extrados, intradosArc, intradosWithJambs, opening, stones, joints, imposts, out, inn };
}

/* -------------------------------------------------------------------------------- */
/* The crown                                                                          */
/* -------------------------------------------------------------------------------- */

/**
 * The crown is drawn wider than the frame, and that is the horseshoe working.
 *
 * A real horseshoe arch corbels out over the piers it stands on: its widest point is
 * outside the wall below it. So the viewBox is 362 across a 342 frame, the springing
 * lands exactly on the legs at 1 and 341, and the extra 10px each side is the overhang.
 * Squeezing the arch back inside the frame is what turns a Cairene arch into a Roman one.
 */
const CROWN_VB = { w: 362, h: 248 };

const CROWN: Band = {
  cx: 181,
  cy: 176,
  rxo: 180,
  ryo: 148,
  rxi: 150,
  ryi: 118,
  spring: 19.2,
  count: 9,
  foot: CROWN_VB.h,
};

const crown = band(CROWN);

/** Rendered crown size, expressed against the frame so nothing has to be measured. */
export const CROWN_WIDTH_CSS = `calc(var(--iwan-frame) * ${f(CROWN_VB.w / 342)})`;
export const CROWN_HEIGHT_CSS = `calc(var(--iwan-frame) * ${f(CROWN_VB.h / 342)})`;

/**
 * Where the opening's jambs stand, as a share of the frame.
 *
 * The cover's doorway continues straight down from the intrados, so this one number
 * keeps the panel fill, the two door leaves and the two jamb strokes on the same line as
 * the arch above them. Read it wrong and the doorway steps in or out at the springing.
 *
 * Measured at `180 + spring` rather than at `-spring`. Both angles are a springing
 * point, but only the second of them is the LEFT jamb, and an inset is a distance from
 * the near edge — so taking the right jamb's x put this at 91% and drove the leaf width
 * below to a negative percentage, which collapsed both door leaves to nothing.
 */
const JAMB_X = crown.inn(180 + CROWN.spring)[0] - (CROWN_VB.w - 342) / 2;

export const JAMB_INSET = `${f((JAMB_X / 342) * 100)}%`;
const LEAF_WIDTH = `${f((50 * (342 - 2 * JAMB_X)) / 342)}%`;

/** The four muqarnas cells at the apex, stepped in two ranks. */
const APEX_CELLS = [
  { x: 101, y: 66, w: 38, h: 40 },
  { x: 143, y: 78, w: 38, h: 40 },
  { x: 185, y: 78, w: 38, h: 40 },
  { x: 227, y: 66, w: 38, h: 40 },
].map((c) => ({
  ...c,
  // Chamfered lower edge: a muqarnas cell is a niche corbelling forward, not a box.
  d:
    `M ${c.x} ${c.y} L ${c.x + c.w} ${c.y} L ${c.x + c.w - 8} ${c.y + c.h}` +
    ` L ${c.x + 8} ${c.y + c.h} Z M ${c.x + 8} ${c.y + c.h} L ${c.x + c.w / 2} ${c.y + c.h * 0.42}` +
    ` L ${c.x + c.w - 8} ${c.y + c.h}`,
}));

const cellVariants = {
  hidden: { y: 0 },
  closed: { y: 0 },
  /** The apex settles as the doors swing. 90ms apart, so it reads as stone finding its seat. */
  open: (i: number) => ({
    y: 4,
    transition: { duration: 0.34, delay: 0.09 * i, ease: EASE_OUT },
  }),
};

export function IwanCrown({
  filled = false,
  animatedCells = false,
  className,
}: {
  /** The cover only: the opening is a shut door, so it carries a panel and jambs. */
  filled?: boolean;
  animatedCells?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${CROWN_VB.w} ${CROWN_VB.h}`}
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={cn('pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-inv-accent', className)}
      style={{ width: CROWN_WIDTH_CSS, height: 'auto' }}
    >
      {filled ? <path d={crown.opening} className="fill-inv-panel" /> : null}

      {/* Ablaq: alternate voussoirs are laid in the darker stone. Never a text ground. */}
      {crown.stones.map((d) => (
        <path key={d} d={d} fill="currentColor" opacity="0.18" />
      ))}

      <path d={crown.extrados} stroke="currentColor" strokeWidth="2" />
      <path
        d={filled ? crown.intradosWithJambs : crown.intradosArc}
        stroke="currentColor"
        strokeWidth="2"
      />

      {crown.joints.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="1" opacity="0.55" />
      ))}
      {crown.imposts.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="2" />
      ))}

      {/* Static on the card; on the cover they take the door's variant and settle. */}
      {APEX_CELLS.map((cell, i) =>
        animatedCells ? (
          <motion.path
            key={cell.x}
            d={cell.d}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.8"
            variants={cellVariants}
            custom={i}
          />
        ) : (
          <path key={cell.x} d={cell.d} stroke="currentColor" strokeWidth="1" opacity="0.8" />
        ),
      )}
    </svg>
  );
}

export const LEAF = { inset: JAMB_INSET, width: LEAF_WIDTH };

/** Four places, not two: a quarter of a pixel of drift here is a visible sliver. */
const unit = (n: number) => n.toFixed(4);

/**
 * The doorway's silhouette, in objectBoundingBox units.
 *
 * The cover's two leaves are HTML rather than SVG — they have to be, because a door
 * swings on a rotateY with perspective and an SVG child cannot be given one — so the
 * arch has to reach them as a clip rather than as a path. Written from the same numbers
 * as the voussoirs above for the reason PHOTO_CLIP is: the leaf and the intrados that
 * frames it have to agree exactly, or the panel shows outside its own arch.
 *
 * Safe to scale only because the element it clips is pinned to the crown's own
 * proportion. Hang it on a box of any other aspect and the horseshoe becomes an oval,
 * which is this theme's one build failure.
 */
export const CROWN_OPENING_CLIP = (() => {
  const [sx, sy] = crown.inn(-CROWN.spring);
  const rx = CROWN.rxi / CROWN_VB.w;
  const ry = CROWN.ryi / CROWN_VB.h;
  const x = sx / CROWN_VB.w;
  const y = sy / CROWN_VB.h;

  // Same direction and same flags as `intradosWithJambs`: right jamb, over the head,
  // down the left jamb, closed along the foot.
  return (
    `M ${unit(x)} 1 L ${unit(x)} ${unit(y)}` +
    ` A ${unit(rx)} ${unit(ry)} 0 1 0 ${unit(1 - x)} ${unit(y)}` +
    ` L ${unit(1 - x)} 1 Z`
  );
})();

/**
 * Where the intrados lands on its impost, as a length down from the top of the crown.
 *
 * The horseshoe's ends are BELOW its widest point — that overhang is the whole arch —
 * so the doorway's own jambs cannot start at the springing line. They start here, and
 * a jamb drawn from anywhere else leaves a gap in the stone that reads as a broken rule.
 */
export const JAMB_TOP_CSS = `calc(var(--iwan-frame) * ${unit(crown.inn(-CROWN.spring)[1] / 342)})`;

/* -------------------------------------------------------------------------------- */
/* The legs                                                                           */
/* -------------------------------------------------------------------------------- */

type Geometry = { w: number; h: number; steps: [number, number, number] };

/**
 * A height nobody has measured yet.
 *
 * Rendered on the server and for the single frame before layout, so the card never ships
 * HTML with no arch in it. The steps are placed proportionally, which is what they very
 * nearly are once the real content is measured.
 */
const FALLBACK: Geometry = { w: 342, h: 1400, steps: [420, 770, 1092] };

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Both legs, as one path in two subpaths.
 *
 * They have to be one path because one path is one `stroke-dashoffset`, and the dash
 * pattern restarts at every subpath — so a single attribute draws both walls downward at
 * the same rate, and they meet in the middle of the plinth at exactly the moment the
 * offset reaches zero. Two separate paths would need two writes per frame to stay in
 * step, and would drift the first time one of them was updated and the other was not.
 */
function legsPath({ w, h, steps }: Geometry): string {
  const base = Math.max(h - 14, 0);
  const foot = 6;
  const mid = w / 2;

  const side = (mirror: boolean) => {
    const x = (i: number) => (mirror ? w - (TIER_INSET[i] + 1) : TIER_INSET[i] + 1);
    const flare = (v: number) => (mirror ? v + foot : v - foot);

    return [
      `M ${f(x(0))} 0`,
      `V ${f(steps[0])}`,
      `H ${f(x(1))}`,
      `V ${f(steps[1])}`,
      `H ${f(x(2))}`,
      `V ${f(steps[2])}`,
      `H ${f(x(3))}`,
      `V ${f(base)}`,
      // The plinth: the wall flares back out at the floor and runs in to meet its twin.
      `H ${f(flare(x(3)))}`,
      `V ${f(base + foot)}`,
      `H ${f(mid)}`,
    ].join(' ');
  };

  return `${side(false)} ${side(true)}`;
}

/** The nearest ancestor that actually scrolls, or null for the page itself. */
function findScroller(from: Element | null): HTMLElement | null {
  let node = from?.parentElement ?? null;
  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * The two walls, drawing themselves around the reader as they scroll.
 *
 * Two things are load bearing here.
 *
 * The viewBox tracks the measured pixel box, so the scale stays 1:1 and a 2px wall is
 * 2px whether the card is 900 or 4000 tall. `preserveAspectRatio="none"` is still set,
 * because it governs the one frame between a height change and the state landing: with
 * the default the whole drawing would be rescaled to fit and the legs would jump inward
 * off the margins, where stretching is invisible.
 *
 * And the haunches are read off the DOM rather than guessed at as fractions. The wall
 * steps in at exactly the y where the measure steps in, because it is measured from the
 * blocks that step. Fractions look right until somebody writes a long custom message.
 */
export function IwanLegs({ className, style }: { className?: string; style?: CSSProperties }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<Geometry>(FALLBACK);

  useIsoLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    // Reduced motion is the finished arch, not an empty one: the walls are simply
    // already built. Checked here rather than left to MotionConfig, because this is a
    // scroll listener writing an attribute and framer never sees it.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let queued = 0;
    let drawn = -1;

    const paint = () => {
      queued = 0;
      const path = pathRef.current;
      if (!path) return;

      const scroller = findScroller(box);
      const top = scroller ? scroller.scrollTop : window.scrollY;
      const span = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      // A card shorter than its viewport never scrolls. Its arch is finished, not empty.
      const progress = span > 1 ? Math.min(1, Math.max(0, top / span)) : 1;

      // Slightly ahead of the thumb, and standing on a course of wall from the start, so
      // the arch is always extending into the space you are about to read rather than
      // catching up with it. Whole percentage steps: a hundred writes over a whole card.
      const percent = Math.round((0.12 + 0.88 * progress ** 0.85) * 100);
      if (percent === drawn) return;
      drawn = percent;
      path.style.strokeDashoffset = String(100 - percent);
    };

    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(paint);
    };

    const measure = () => {
      const rect = box.getBoundingClientRect();
      const marks = box.parentElement?.querySelectorAll<HTMLElement>('[data-iwan-step]') ?? [];
      const steps = [0, 1, 2].map((i) => {
        const mark = marks[i];
        return mark ? Math.max(0, mark.getBoundingClientRect().top - rect.top) : 0;
      }) as [number, number, number];

      setGeometry({ w: Math.round(rect.width), h: Math.round(rect.height), steps });
      if (still) {
        if (pathRef.current) pathRef.current.style.strokeDashoffset = '0';
      } else {
        schedule();
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(box);
    if (box.parentElement) observer.observe(box.parentElement);

    if (still) return () => observer.disconnect();

    const scroller = findScroller(box);
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      observer.disconnect();
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 bottom-0', className)}
      style={style}
    >
      <svg
        viewBox={`0 0 ${geometry.w} ${geometry.h}`}
        preserveAspectRatio="none"
        fill="none"
        role="presentation"
        className="h-full w-full text-inv-accent"
        // Both live on the svg because stroke-dash* inherit: the path's own inline style
        // is then free for the scroll handler to own, and a React re-render of this
        // element can never quietly reset the wall to undrawn.
        strokeDasharray={100}
        style={{ strokeDashoffset: 100 }}
      >
        <path
          ref={pathRef}
          d={legsPath(geometry)}
          stroke="currentColor"
          strokeWidth="2"
          // pathLength normalises both subpaths to 100 units each, so the dash maths is
          // in whole percent and does not change when the card gets longer.
          pathLength={200}
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------------- */
/* The connective stub                                                                */
/* -------------------------------------------------------------------------------- */

/** A flat arch of three stones: filled, keystone, filled. */
const STUB = [
  'M 6 23 L 0 1 L 31 1 L 34 23 Z',
  'M 34 23 L 31 1 L 65 1 L 62 23 Z',
  'M 62 23 L 65 1 L 96 1 L 90 23 Z',
];

/**
 * What stands where another theme would draw a divider.
 *
 * This theme has no rules and no hairlines — the arch is the only structure on the page —
 * so a change of subject is marked by three stones laid across the measure instead.
 */
export function IwanVoussoirStub({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center', className)} aria-hidden="true">
      <svg
        viewBox="0 0 96 24"
        fill="none"
        role="presentation"
        className="pointer-events-none h-6 w-24 text-inv-accent"
      >
        {STUB.map((d, i) => (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth="1"
            fill={i === 1 ? 'none' : 'currentColor'}
            fillOpacity={i === 1 ? 0 : 0.18}
          />
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------------- */
/* The ablaq course                                                                   */
/* -------------------------------------------------------------------------------- */

/**
 * Alternating courses of stone, 14px apiece.
 *
 * `currentColor` inside the gradient is what keeps the theme's accent the only source of
 * this colour; the element's own opacity supplies the 5.5% the course is laid at. It goes
 * on panel surfaces only and never behind body text — least of all behind the verse.
 */
export function AblaqCourses({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 text-inv-accent opacity-[0.055]', className)}
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 14px, currentColor 14px 28px)',
      }}
    />
  );
}

/* -------------------------------------------------------------------------------- */
/* The muqarnas half dome                                                             */
/* -------------------------------------------------------------------------------- */

const DOME_VB = { w: 190, h: 152 };

const DOME_SHELL = band({
  cx: 95,
  cy: 112,
  rxo: 94,
  ryo: 100,
  rxi: 94,
  ryi: 100,
  spring: 19.2,
  count: 1,
  foot: DOME_VB.h,
}).extrados;

/** Eleven cells in three tiers, each rank set half a cell off the one below it. */
const DOME_CELLS = [
  { y: 104, h: 38, from: 14, to: 176, n: 5 },
  { y: 62, h: 42, from: 28, to: 162, n: 4 },
  { y: 26, h: 36, from: 62, to: 128, n: 2 },
].flatMap((tier, rank) => {
  const w = (tier.to - tier.from) / tier.n;
  return Array.from({ length: tier.n }, (_, i) => {
    const x = tier.from + i * w;
    const chamfer = w * 0.19;
    return {
      key: `${rank}-${i}`,
      shaded: (rank + i) % 2 === 0,
      d:
        `M ${f(x)} ${tier.y} L ${f(x + w)} ${tier.y}` +
        ` L ${f(x + w - chamfer)} ${tier.y + tier.h} L ${f(x + chamfer)} ${tier.y + tier.h} Z`,
      fold:
        `M ${f(x + chamfer)} ${tier.y + tier.h} L ${f(x + w / 2)} ${f(tier.y + tier.h * 0.45)}` +
        ` L ${f(x + w - chamfer)} ${tier.y + tier.h}`,
    };
  });
});

/**
 * The half dome that stands where a photo would.
 *
 * This is the strongest object in the theme and it exists only on the card without a
 * photo, which is the commoner card. That inverts the usual apology: the couple who did
 * not upload a picture get the better page, not a gap where one was meant to go.
 */
export function IwanHalfDome({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[190px] overflow-hidden bg-inv-panel', className)}>
      <AblaqCourses />
      <svg
        viewBox={`0 0 ${DOME_VB.w} ${DOME_VB.h}`}
        fill="none"
        role="presentation"
        aria-hidden="true"
        className="pointer-events-none relative block w-full text-inv-accent"
      >
        {DOME_CELLS.map((cell) =>
          cell.shaded ? <path key={`f${cell.key}`} d={cell.d} fill="currentColor" opacity="0.13" /> : null,
        )}
        {DOME_CELLS.map((cell) => (
          <path key={cell.key} d={cell.d} stroke="currentColor" strokeWidth="1" opacity="0.85" />
        ))}
        {DOME_CELLS.map((cell) => (
          <path key={`v${cell.key}`} d={cell.fold} stroke="currentColor" strokeWidth="1" opacity="0.4" />
        ))}
        <path d={DOME_SHELL} stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------------- */
/* The photo, cut into the wall                                                       */
/* -------------------------------------------------------------------------------- */

const PHOTO_VB = { w: 272, h: 340 };

const PHOTO: Band = {
  cx: 136,
  cy: 102,
  rxo: 135,
  ryo: 101,
  rxi: 115,
  ryi: 86,
  spring: 19.2,
  count: 9,
  foot: PHOTO_VB.h,
};

const photoBand = band(PHOTO);

/**
 * The opening, in objectBoundingBox units.
 *
 * Written from the same numbers as the voussoirs above rather than by hand, because the
 * clip and the stonework have to agree exactly: a two pixel disagreement here shows up as
 * a sliver of photo outside its own arch.
 */
const PHOTO_CLIP = (() => {
  const [sx, sy] = photoBand.inn(-PHOTO.spring);
  const rx = PHOTO.rxi / PHOTO_VB.w;
  const ry = PHOTO.ryi / PHOTO_VB.h;
  const x = sx / PHOTO_VB.w;
  const y = sy / PHOTO_VB.h;
  return `M ${f(x)} ${f(y)} A ${f(rx)} ${f(ry)} 0 1 0 ${f(1 - x)} ${f(y)} L ${f(1 - x)} 1 L ${f(x)} 1 Z`;
})();

/**
 * The couple's photograph, set into the shaft as a window in the hall wall.
 *
 * Same arch as the crown at roughly four tenths the size, so the window is legibly the
 * building's own opening rather than a rounded rectangle borrowed from somewhere else.
 * The frame reports a failed image upward instead of hiding itself, so an ImageKit outage
 * lands on the half dome rather than on a hole in the wall.
 */
export function IwanPhotoArch({
  src,
  alt,
  onFailed,
  className,
}: {
  src: string;
  alt: string;
  onFailed: () => void;
  className?: string;
}) {
  const clipId = useId();

  return (
    <div className={cn('relative mx-auto w-full max-w-[272px]', className)}>
      <div className="relative" style={{ aspectRatio: `${PHOTO_VB.w} / ${PHOTO_VB.h}` }}>
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={PHOTO_CLIP} />
          </clipPath>
        </svg>

        <div className="absolute inset-0 bg-inv-panel" style={{ clipPath: `url(#${clipId})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={onFailed}
            className="h-full w-full object-cover"
          />
        </div>

        <svg
          viewBox={`0 0 ${PHOTO_VB.w} ${PHOTO_VB.h}`}
          fill="none"
          role="presentation"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-inv-accent"
        >
          {photoBand.stones.map((d) => (
            <path key={d} d={d} fill="currentColor" opacity="0.18" />
          ))}
          <path d={photoBand.extrados} stroke="currentColor" strokeWidth="2" />
          <path d={photoBand.intradosWithJambs} stroke="currentColor" strokeWidth="2" />
          {photoBand.joints.map((d) => (
            <path key={d} d={d} stroke="currentColor" strokeWidth="1" opacity="0.55" />
          ))}
        </svg>
      </div>
    </div>
  );
}
