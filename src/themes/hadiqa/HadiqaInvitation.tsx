'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  JasmineBlossom,
  JasmineBud,
  LEAF_TILE,
  LeafNode,
  OpenFlower,
  STEM_SEGMENTS,
  STEM_VIEWBOX,
} from './HadiqaOrnaments';
import { Reveal } from '@/components/invitation/Reveal';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import { SITE_URL } from '@/lib/constants';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * حديقة, revealed. The axis is an OFF-CENTRE COLUMN WITH A LIVE ORNAMENT GUTTER.
 *
 * Two things make this a structure rather than a colourway, and both are easy to undo by
 * accident, so they are written down as locked tokens below.
 *
 * The first is that the column is not centred. There is a 56px gutter along the inline
 * start edge and the text is start-aligned to a single measure, which gives the page a
 * true margin and a true text edge — the proportions of a botanical plate rather than of
 * a greetings card. Every other theme in this set, and all four of the retired ones,
 * centre their column. Centring this one "to balance it" is the specific change that
 * would delete the theme, and it is the first thing a nervous reviewer reaches for.
 *
 * The second is that the ornament in that gutter is an INDEX OF THE SECTIONS. One stem
 * runs the whole document height, and at each block's own vertical position it puts out
 * a growth that belongs to that block: a blossom at the names, a leaf pair at the verse,
 * a bud at the date, an open flower at the countdown. Ornament as a table of contents.
 * That is why there is not one horizontal divider in this file — the section breaks
 * happen out in the margin, on the vine, so the text column is never interrupted.
 *
 * The retired floral theme is what this replaces, and the difference is exactly the one
 * above: floral put sprigs in the corners of a rounded panel and then had no botany at
 * all for the remaining ninety-five per cent of the scroll, so a card called "ورد" spent
 * most of its length not keeping its name's promise.
 */

/**
 * The two locked tokens. Neither is spacing to be tuned.
 *
 * GUTTER is the width of the vine's margin. MEASURE is the text column. They are
 * expressed as literal Tailwind classes rather than composed strings because Tailwind
 * scans source text: a template literal produces no CSS at all.
 */
const GUTTER = 'ps-14'; // 56px — the vine's margin.
const MEASURE = 'max-w-[306px]'; // The text column, start-aligned inside it.

/**
 * Where each growth sits on the stem, as a fraction of the scroll rather than a pixel.
 *
 * Absolute positions drift the moment a couple writes a long custom message or a name
 * wraps to a third line: the content below the change moves and the ornament marking it
 * does not, so every node ends up marking the wrong block. Fractions of the container's
 * own height cannot drift, because the container is what grew.
 */
const GROWTH = {
  names: 0.04,
  verse: 0.17,
  poetry: 0.29,
  roles: 0.4,
  photo: 0.52,
  date: 0.63,
  venue: 0.73,
  countdown: 0.82,
  footer: 0.95,
} as const;

/* ------------------------------------------------------------------- the vine */

/**
 * One eighth of the stem, drawn as the viewport reaches it.
 *
 * Its own component purely so it can own a hook: eight `useTransform` calls cannot be
 * made in a loop, and eight of them written out by hand in the parent would be eight
 * chances to mistype an index.
 *
 * The input range starts slightly before the segment's own share of the scroll and ends
 * slightly after, so the drawing runs a little ahead of the reader — the vine is always
 * growing into space you have not read yet, never catching up to you.
 */
function StemSegment({
  index,
  progress,
  reduced,
}: {
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = index / STEM_SEGMENTS.length;
  const end = (index + 1) / STEM_SEGMENTS.length;
  const offset = useTransform(progress, [start - 0.07, end - 0.02], [1, 0], { clamp: true });

  return (
    <motion.path
      d={STEM_SEGMENTS[index]}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      pathLength={1}
      strokeDasharray={1}
      // Reduced motion means the finished state, not a frozen half-drawn one.
      style={{ strokeDashoffset: reduced ? 0 : offset }}
    />
  );
}

/**
 * A growth on the stem, appearing as the vine reaches it.
 *
 * The opacity is a step rather than a tween — the node is invisible until the stroke
 * passes it and then it is simply there. Seven nodes, one style change each, is a
 * different order of cost from seven things easing continuously for the length of the
 * scroll.
 */
function Growth({
  at,
  progress,
  reduced,
  className,
  children,
}: {
  at: number;
  progress: MotionValue<number>;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useTransform(progress, [at - 0.03, at], [0, 1], { clamp: true });

  return (
    <motion.div
      // Positioned physically from the top and logically from the start edge: the vine
      // must move to the other margin under RTL, but "how far down the page" is not a
      // direction.
      className={cn('pointer-events-none absolute start-0 rtl:-scale-x-100', className)}
      style={{ top: `${at * 100}%`, opacity: reduced ? 1 : opacity }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}

/**
 * Whether the guest has asked for less movement.
 *
 * `MotionConfig reducedMotion="user"` upstream already governs framer's own animations,
 * but a `MotionValue` bound to scroll is not an animation as far as that setting is
 * concerned — it is a value that happens to change. Without this check the vine would
 * still draw itself on scroll for somebody who asked for stillness.
 *
 * Read in an effect rather than during render, because the server has no matchMedia and
 * a first paint that disagrees with the client is a hydration error.
 */
function useReducedMotion(): boolean {
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

/* -------------------------------------------------------------- the countdown */

/**
 * Four cells, start-aligned like everything else in the column.
 *
 * Written here rather than taken from the shared Countdown because that one is a centred
 * row of rings, and a row of rings dropped into this column would be the one element on
 * the page that ignores its structure. The hydration approach is copied from it
 * deliberately: the first render uses the target itself as the clock so the server and
 * the client agree, and the real time takes over one tick later.
 */
function HadiqaCountdown({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, view.eventInstantMs - (nowMs ?? view.eventInstantMs));
  const totalSeconds = Math.floor(remaining / 1000);
  const hasPassed = nowMs !== null && view.eventInstantMs - nowMs <= 0;

  if (hasPassed) {
    return <p className="font-inv-display text-2xl text-inv-accent">{copy.labels.started[view.eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div>
      <p className="font-inv-body text-sm text-inv-muted">{copy.labels.countdownHeading[view.eventType]}</p>

      <div className="mt-4 flex gap-6">
        {cells.map((cell) => (
          <div key={cell.label} className="text-start">
            <span className="numeric block font-inv-body text-[2rem] leading-none font-semibold text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-1.5 block font-inv-body text-[0.625rem] text-inv-muted">
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- the card */

/** A section of the column. No rule, no ornament — the break is out on the vine. */
function Block({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal className={cn('mt-14', className)}>
      <div className={cn(MEASURE, 'text-start')}>{children}</div>
    </Reveal>
  );
}

/** The small label that opens a block. Word-spacing, never letter-spacing. */
function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-inv-body text-[0.6875rem] text-inv-accent [word-spacing:0.3em]">
      {children}
    </p>
  );
}

export function HadiqaInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: columnRef,
    offset: ['start start', 'end end'],
  });

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg">
      {/* The ground. One background-image for a card of any length. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: LEAF_TILE }}
        aria-hidden="true"
      />

      <div
        ref={columnRef}
        className={cn('@container relative mx-auto w-full max-w-[420px] pe-5 pt-16 pb-24', GUTTER)}
      >
        {/*
          The vine. One SVG spanning the whole column, stretched vertically.

          `preserveAspectRatio="none"` is what lets a fixed viewBox cover a card whose
          height is not known until the couple has finished writing it. It is safe here
          and nowhere else in this theme: a smooth serpentine under vertical scale is
          still a smooth serpentine, just gentler or tighter. Every leaf and blossom is a
          separate fixed-aspect element positioned over the top, because a stretched leaf
          is wrong in a way a stretched curve is not.

          `vector-effect: non-scaling-stroke` keeps the stem a 1.4px hairline whatever the
          vertical scale turns out to be — without it a long card draws a thick stem and a
          short one draws a thread.
        */}
        <svg
          viewBox={`0 0 ${STEM_VIEWBOX.width} ${STEM_VIEWBOX.height}`}
          preserveAspectRatio="none"
          fill="none"
          className="pointer-events-none absolute inset-y-0 start-0 z-0 h-full w-14 text-inv-accent/70 rtl:-scale-x-100"
          aria-hidden="true"
        >
          {STEM_SEGMENTS.map((_, index) => (
            <StemSegment
              key={index}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </svg>

        {/* The growths, each marking the block beside it. */}
        <div className="pointer-events-none absolute inset-y-0 start-0 z-0 w-14" aria-hidden="true">
          <Growth at={GROWTH.verse} progress={scrollYProgress} reduced={reduced} className="ms-3 h-[34px] w-[34px] text-inv-accent">
            <LeafNode />
          </Growth>
          <Growth at={GROWTH.poetry} progress={scrollYProgress} reduced={reduced} className="ms-4 h-[30px] w-[30px] text-inv-accent-soft">
            <LeafNode />
          </Growth>
          <Growth at={GROWTH.roles} progress={scrollYProgress} reduced={reduced} className="ms-2.5 h-[34px] w-[34px] text-inv-accent">
            <LeafNode />
          </Growth>
          <Growth at={GROWTH.photo} progress={scrollYProgress} reduced={reduced} className="ms-3 h-[36px] w-[34px] text-inv-accent-soft">
            <LeafNode />
          </Growth>
          <Growth at={GROWTH.date} progress={scrollYProgress} reduced={reduced} className="ms-4 h-[34px] w-[24px] text-inv-accent">
            <JasmineBud />
          </Growth>
          <Growth at={GROWTH.venue} progress={scrollYProgress} reduced={reduced} className="ms-3 h-[30px] w-[30px] text-inv-accent-soft">
            <LeafNode />
          </Growth>
          <Growth at={GROWTH.countdown} progress={scrollYProgress} reduced={reduced} className="ms-2 h-[38px] w-[38px] text-inv-accent">
            <OpenFlower />
          </Growth>
          <Growth at={GROWTH.footer} progress={scrollYProgress} reduced={reduced} className="ms-4 h-[26px] w-[26px] text-inv-accent-soft">
            <LeafNode />
          </Growth>
        </div>

        {/* ------------------------------------------------------------ 1. names */}
        {/*
          The hero blossom sits behind the names rather than beside them, and the names
          are allowed to run back over the gutter.

          This overlap is composed, not tolerated. "عبد الرحمن و ياسمين" does not fit a
          306px measure at this size, and the two ways out — shrinking the hero or
          hyphenating — both cost the theme its type ratio, which is most of what makes it
          look like a plate rather than a page. So the name block reaches into the margin
          and the stem passes behind the type. Everything else on the card respects the
          measure exactly, which is what makes this one exception read as deliberate.
        */}
        <div className="relative z-10">
          <div
            className="pointer-events-none absolute -top-12 -start-14 h-[200px] w-[200px] text-inv-accent opacity-25 rtl:-scale-x-100"
            aria-hidden="true"
          >
            <JasmineBlossom />
          </div>

          <Reveal immediate>
            <div className="relative -ms-2 max-w-[352px]">
              {copy.familiesPrefix ? (
                <p className="mb-4 font-inv-body text-[0.8125rem] text-inv-muted">
                  {copy.familiesPrefix}
                </p>
              ) : null}

              <h1 className="font-inv-display text-inv-ink">
                <span className="block text-[3.5rem] leading-[1.15] text-balance">{view.name1}</span>
                <span className="my-1 block text-2xl text-inv-accent" aria-hidden="true">
                  {copy.nameSeparator}
                </span>
                <span className="block text-[3.5rem] leading-[1.15] text-balance">{view.name2}</span>
              </h1>
            </div>
          </Reveal>
        </div>

          {/* --------------------------------------------------- 4. invitation line */}
          <Block className="mt-10">
            <p className="font-inv-body text-[1.0625rem] leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </Block>

        <div className="relative z-10">
          {/* -------------------------------------------------- 2. bismillah and verse */}
          {copy.bismillah && copy.verse ? (
            <Block className="mt-16">
              {/*
                U+FDFD is a single ligature roughly eleven times wider than its font size,
                so a size that suits ordinary text runs it off both edges of a phone. It
                is sized against the column with a container query rather than against the
                viewport, because the column stops growing and a desktop viewport does not.
              */}
              <p
                className="font-inv-verse text-[length:min(2.375rem,9cqw)] leading-none text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>

              <p className="mt-6 font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty">
                {copy.verse}
              </p>

              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-xs text-inv-muted">{copy.verseSource}</p>
              ) : null}
            </Block>
          ) : null}

          {/* ------------------------------------------------------------ 3. poetry */}
          {/* Empty when the couple chose no line. */}
          {copy.poetry ? (
            <Block>
              <p className="font-inv-body text-[1.125rem] leading-[1.9] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </Block>
          ) : null}


          {/* ------------------------------------------------------------- 5. roles */}
          {/*
            Two rows rather than two columns. A two-column grid halves the measure, and at
            306px that leaves 150px for a name — which is where "عبد الرحمن" starts
            breaking. Stacked, both names get the full column.
          */}
          <Block>
            <div className="flex flex-col gap-6">
              {[
                { role: copy.roleGroom, name: view.name1 },
                { role: copy.roleBride, name: view.name2 },
              ].map((person) => (
                <div key={person.role}>
                  <Label>{person.role}</Label>
                  <p className="mt-1.5 font-inv-body text-[1.3125rem] leading-snug font-semibold text-inv-ink text-balance">
                    {person.name}
                  </p>
                </div>
              ))}
            </div>
          </Block>

          {/* ------------------------------------------------------------- 6. photo */}
          {/*
            An arch: square at the bottom, a true semicircle on top. The one curved frame
            in the theme, and it is there because a garden gate is the right association
            for a card whose whole ornament is a climbing vine.

            It reaches back over the gutter so the stem passes behind it and re-emerges
            below — which is only possible because the vine is one continuous path rather
            than a divider redrawn per section.
          */}
          {view.photoUrl ? (
            <Reveal className="relative z-10 mt-14 -ms-14">
              <PhotoArch view={view} />
            </Reveal>
          ) : (
            /*
              NO PHOTO: the vine carries a longer leafed section filling the same 240px of
              height, so the page rhythm is preserved exactly and nothing reflows.
            */
            <div className="h-[240px] flex items-center justify-start ps-3" aria-hidden="true">
              <div className="h-16 w-8 text-inv-accent-soft/80">
                <LeafNode />
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- 7 and 8. date */}
          <Block>
            <Label>{date.weekday}</Label>

            <p className="mt-2 font-inv-display text-[4rem] leading-none text-inv-accent">
              <span className="numeric">{date.day}</span>
            </p>

            <p className="mt-2 font-inv-body text-base text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>

            {/* Only the clock is isolated left to right. The period beside it is a word,
                and forcing it would seat it on the wrong side in Arabic. */}
            <p className="mt-4 font-inv-body text-base text-inv-muted">
              {copy.labels.time}
              <span className="mx-2 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>
          </Block>

          {/* ------------------------------------------------------------- 9. venue */}
          <Block>
            <Label>{copy.labels.venue}</Label>

            <p className="mt-2 font-inv-display text-[1.375rem] leading-snug text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-inv-accent/55 px-6 font-inv-body text-sm text-inv-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-inv-accent" aria-hidden="true">
                  <path
                    d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {copy.labels.mapsButton}
              </a>
            ) : null}
          </Block>

          {/* --------------------------------------------------------- 10. countdown */}
          <Block>
            <HadiqaCountdown view={view} copy={copy} />
          </Block>

          {/* ----------------------------------------------------------- 11. message */}
          {view.customMessage ? (
            <Block>
              <p className="font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Block>
          ) : null}

          {/* ------------------------------------------------------------ 12. footer */}
          <Block className="mt-16">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inv-body text-xs text-inv-muted/80 transition hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </Block>
        </div>
      </div>
    </div>
  );
}

/**
 * The photo under an arch, with a fallback that is a layout rather than a gap.
 *
 * If the image fails to load the whole block removes itself and the card falls back to
 * its no-photo rhythm, which is the version most customers see anyway — an ImageKit
 * outage becomes something nobody notices instead of a broken icon in the middle of
 * somebody's wedding invitation.
 */
function PhotoArch({ view }: { view: InvitationView }) {
  const [failed, setFailed] = useState(false);

  if (!view.photoUrl || failed) return null;

  return (
    <div className="relative w-full max-w-[306px]">
      <div
        className="relative overflow-hidden rounded-t-[153px] border border-inv-accent/40 bg-inv-panel"
        style={{ aspectRatio: '4 / 5' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={view.photoUrl}
          alt={`${view.name1} & ${view.name2}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
