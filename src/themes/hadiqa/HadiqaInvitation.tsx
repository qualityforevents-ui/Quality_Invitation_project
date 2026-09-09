'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  JasmineBlossom,
  JasmineBud,
  JasmineTendril,
  LEAF_TILE,
  LeafNode,
  LeafSprig,
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
 * The names, and the names only, are allowed a wider box than the measure — but only at
 * the LEADING edge.
 *
 * 306 + 32 with a 32px negative start margin, so the hero reaches 32px back into the
 * gutter and its TRAILING edge lands on exactly the same pixel as every paragraph below
 * it. Before this it was `-ms-2 max-w-[352px]`, which let the block run past the column's
 * own end padding: the names finished nearer the edge of the phone than any other line on
 * the card, and two different outer margins on one page read as a mistake rather than as
 * a composed overhang. The overhang is the point; the ragged outer edge was not.
 */
const HERO_MEASURE = '-ms-8 max-w-[338px]';

/**
 * THE VERTICAL RHYTHM. One unit of 40px, taken once, twice or three times, and no other
 * gap anywhere on the card.
 *
 * Every gap here used to be its own decision — 40, 56 and 64 in three places each, with
 * a 240px band of nothing in the middle of it — which is a collection of numbers rather
 * than a beat. They are literal classes and are handed to `Block`, whose `cn` is
 * tailwind-merge, so a passed step replaces the default rather than fighting it.
 *
 *   STEP_SM   40px  a block bound to the one directly above it — the invitation line
 *                   belongs to the names and is set close enough to say so.
 *   STEP      80px  one section to the next. The default, and most of the card.
 *   STEP_LG  120px  the larger breath: opening the verse, and closing on the credit.
 *
 * The gaps are wide for a phone and that is the point: they are not empty. The vine runs
 * through every one of them and puts a growth in most of them, so what reads as space in
 * the column is the margin doing its work. This is also where the card's length comes
 * from — closing the dead band gave 108px back and the rhythm spends it, which is the
 * right way round. Space between sections is rhythm; space inside a section is a hole.
 */
const STEP_SM = 'mt-10';
const STEP = 'mt-20';
const STEP_LG = 'mt-30';

/**
 * THE TYPE SCALE. Six tiers, each about 1.3 times the one below it.
 *
 *   0.75rem   12  labels, verse source, countdown units, credit
 *   1.0625rem 17  body copy — invitation line, verse, time, message
 *   1.375rem  22  the sub-display tier: roles, venue, month and year, the separator
 *   1.75rem   28  countdown numerals
 *   2.875rem  46  the day numeral
 *   3.5rem    56  the names
 *
 * The date block is what this scale was written for. It used to run an 11px weekday
 * straight into a 64px numeral and then straight back down to a 16px month — a factor of
 * six and then a factor of four, with nothing on either side of the numeral to step
 * through, which is why a block holding three short facts read as broken. The numeral is
 * still the largest thing below the names, but the month now sits on its baseline at the
 * 22px tier, so the eye descends 46 → 22 → 17 → 12 instead of falling off a cliff.
 *
 * The only tier written as `text-*` shorthand is `text-xs`, which IS 0.75rem.
 */

/**
 * WHERE EACH GROWTH SITS: on its own block, and not on a fraction of the scroll.
 *
 * The growths used to be laid out over the column as fractions — verse at 0.17, date at
 * 0.63 — for a good reason, which was that absolute pixel offsets drift the moment a
 * couple writes a long custom message and every node ends up marking the wrong block.
 * The trouble is that a fraction only avoids that drift if the blocks happen to be
 * evenly spread, and they are not: measured on the live card, every single mark sat
 * between 70 and 170 pixels ABOVE the block it was supposed to be indexing, and the
 * verse's leaf was level with the invitation line. An index that points at the wrong
 * entry is worse than no index, and it drifts again on every content change — a photo
 * alone moves everything below it by 228px, which is a tenth of the card.
 *
 * So each mark is now a child of the block it belongs to, positioned into the gutter
 * beside it. That is the same guarantee the fractions were reaching for and a stronger
 * one: a mark cannot drift away from a block it is inside. A long custom message pushes
 * the block and its growth together, because they are the same element.
 *
 * See `Block`, which takes the mark and places it.
 */

/* ------------------------------------------------------------------- the vine */

/**
 * One fourteenth of the stem, drawn as the viewport reaches it.
 *
 * Its own component purely so it can own a hook: fourteen `useTransform` calls cannot be
 * made in a loop, and fourteen of them written out by hand in the parent would be
 * fourteen chances to mistype an index.
 *
 * The input range starts slightly before the segment's own share of the scroll and ends
 * slightly after, so the drawing runs a little ahead of the reader — the vine is always
 * growing into space you have not read yet, never catching up to you. The ranges overlap
 * by design: segment n+1 begins before segment n has finished, so the drawn part of the
 * vine is one unbroken run at every scroll position rather than a chain that can show
 * daylight between its links.
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
  const offset = useTransform(progress, [start - 0.05, end - 0.01], [1, 0], { clamp: true });

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
    return (
      <p className="font-inv-display text-[1.375rem] text-inv-accent">
        {copy.labels.started[view.eventType]}
      </p>
    );
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div>
      {/* Opened by the same accent label as every other block, rather than by a 14px
          muted line that belonged to no tier. */}
      <Label>{copy.labels.countdownHeading[view.eventType]}</Label>

      {/* gap-5 rather than gap-6: four cells and their unit words have to fit the 284px
          measure a 360px Android leaves, and "minutes" on an English card is the widest
          thing in the row. */}
      <div className="mt-4 flex gap-5">
        {cells.map((cell) => (
          <div key={cell.label} className="text-start">
            <span className="numeric block font-inv-body text-[1.75rem] leading-none font-semibold text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-2 block font-inv-body text-xs text-inv-muted">{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- the card */

/**
 * A section of the column, and its growth out on the vine.
 *
 * No rule and no ornament inside the column — the break happens in the margin, which is
 * the whole reason this theme has not one horizontal divider in it.
 *
 * The mark is a CHILD of the block rather than a separately positioned node, so it is at
 * the block's height by construction and there is no arithmetic left to get wrong. It is
 * pulled a full gutter back with `-start-14` and centred in that 56px, which is where the
 * stem's own centre line runs, so the growth reads as coming off the vine rather than
 * floating in the margin beside it. It also inherits the block's own entrance: the
 * section and the thing that indexes it arrive in one movement, which is what makes the
 * pairing legible instead of decorative.
 *
 * The default gap is STEP; anything else passed in is one of the other two rhythm
 * tokens. `cn` is tailwind-merge, so the passed class replaces the default outright.
 */
function Block({
  children,
  className,
  mark,
}: {
  children: ReactNode;
  className?: string;
  mark?: ReactNode;
}) {
  return (
    <Reveal className={cn('relative', STEP, className)}>
      {mark ? (
        <div
          className="pointer-events-none absolute -start-14 top-1 z-0 flex w-14 justify-center rtl:-scale-x-100"
          aria-hidden="true"
        >
          {mark}
        </div>
      ) : null}

      <div className={cn(MEASURE, 'relative z-10 text-start')}>{children}</div>
    </Reveal>
  );
}

/** The small label that opens a block. Word-spacing, never letter-spacing. */
function Label({ children }: { children: ReactNode }) {
  return <p className="font-inv-body text-xs text-inv-accent [word-spacing:0.3em]">{children}</p>;
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
        className={cn('@container relative mx-auto w-full max-w-[420px] pe-5 pt-24 pb-20', GUTTER)}
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
          {/*
            THE WHOLE STEM, ALWAYS THERE, AT A WHISPER. This is the layer that makes the
            claim in the pitch true.

            With only the scroll-drawn strokes above it, the vine on a real phone is a set
            of separate marks: the part behind you is drawn, the part ahead of you is not,
            and any capture of the card that is not one single instant — a scrolling
            screenshot, a thumbnail, a print — shows a handful of disconnected fragments
            with daylight between them, which is not a vine. Laid down first at a third of
            the ink, the stem reads as one continuous line from the names to the footer at
            every moment, and the scroll-drawn stroke on top of it stops being the thing
            that makes the vine exist and becomes the thing that makes it grow. Same
            gesture, and it can no longer fail.
          */}
          <g opacity="0.42">
            {STEM_SEGMENTS.map((d, index) => (
              <path
                key={index}
                d={d}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {STEM_SEGMENTS.map((_, index) => (
            <StemSegment key={index} index={index} progress={scrollYProgress} reduced={reduced} />
          ))}
        </svg>

        {/* ------------------------------------------------------------ 1. names */}
        {/*
          The hero blossom sits behind the names rather than beside them, and the names
          are allowed to run back over the gutter.

          This overlap is composed, not tolerated. "عبد الرحمن و ياسمين" does not fit a
          306px measure at this size, and the two ways out — shrinking the hero or
          hyphenating — both cost the theme its type ratio, which is most of what makes it
          look like a plate rather than a page. So the name block reaches into the margin
          and the stem passes behind the type. Everything else on the card respects the
          measure exactly, which is what makes this one exception read as deliberate — and
          the reach is only at the leading edge: see HERO_MEASURE.
        */}
        <div className="relative z-10">
          <div
            className="pointer-events-none absolute -top-12 -start-14 h-[200px] w-[200px] text-inv-accent opacity-25 rtl:-scale-x-100"
            aria-hidden="true"
          >
            <JasmineBlossom />
          </div>

          <Reveal immediate>
            <div className={cn('relative', HERO_MEASURE)}>
              {copy.familiesPrefix ? (
                <p className="mb-4 font-inv-body text-xs text-inv-muted">{copy.familiesPrefix}</p>
              ) : null}

              <h1 className="font-inv-display text-inv-ink">
                <span className="block text-[3.5rem] leading-[1.15] text-balance">{view.name1}</span>
                <span className="my-1 block text-[1.375rem] text-inv-accent" aria-hidden="true">
                  {copy.nameSeparator}
                </span>
                <span className="block text-[3.5rem] leading-[1.15] text-balance">{view.name2}</span>
              </h1>
            </div>
          </Reveal>
        </div>

        <div className="relative z-10">
          {/* --------------------------------------------------- 2. invitation line */}
          {/* Bound to the names by the short step, and inside the same stacking context
              as the rest of the column so it cannot be painted under the vine. */}
          <Block className={STEP_SM}>
            <p className="font-inv-body text-[1.0625rem] leading-[1.85] text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </Block>

          {/* -------------------------------------------------- 3. bismillah and verse */}
          {copy.bismillah && copy.verse ? (
            <Block
              className={STEP_LG}
              mark={
                <div className="h-[34px] w-[34px] text-inv-accent">
                  <LeafNode />
                </div>
              }
            >
              {/*
                U+FDFD is a single ligature roughly eleven times wider than its font size,
                so a size that suits ordinary text runs it off both edges of a phone. It
                is sized against the column with a container query rather than against the
                viewport, because the column stops growing and a desktop viewport does not.
                8.5cqw rather than 9: at 360px the column's content box is 284px wide, and
                nine gave the ligature the whole of it with nothing left for the margin.
              */}
              <p
                className="font-inv-verse text-[length:min(2.375rem,8.5cqw)] leading-none text-inv-accent"
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

          {/* ------------------------------------------------------------- 5. photo */}
          {/*
            An arch: square at the bottom, a true semicircle on top. The one curved frame
            in the theme, and it is there because a garden gate is the right association
            for a card whose whole ornament is a climbing vine.

            It reaches back over the gutter so the stem passes behind it and re-emerges
            below — which is only possible because the vine is one continuous path rather
            than a divider redrawn per section.
          */}
          {view.photoUrl ? (
            <Reveal className={cn('relative z-10 -ms-14', STEP)}>
              <PhotoArch view={view} />
            </Reveal>
          ) : (
            /*
              NO PHOTO: the vine flowers where the photograph would have been.

              The band keeps its height, because holding the page rhythm whether or not
              there is a photograph is the point of it. What it no longer does is hold
              nothing: it was 224px carrying a single 64px leaf pushed into a corner, so
              roughly 170px of the tallest block on the card was empty, and it sat
              directly above the date where the findings measured the hole. A band is not
              rhythm if there is nothing in it. Now the vine flowers here — a 140px
              blossom, the hero's mark at two thirds scale and full ink, reaching out of
              the gutter the way the photograph would have.
            */
            <div className={cn('relative -ms-14 flex h-[224px] items-center', STEP)} aria-hidden="true">
              <div className="h-[140px] w-[140px] text-inv-accent/75 rtl:-scale-x-100">
                <JasmineBlossom />
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- 6 and 7. date */}
          <Block
            mark={
              <div className="h-[34px] w-[24px] text-inv-accent">
                <JasmineBud />
              </div>
            }
          >
            <Label>{date.weekday}</Label>

            {/*
              The numeral and the month share a baseline rather than stacking, which is
              what puts a step between them: 46 beside 22 instead of 64 above 16.
              `flex-wrap` because a 320px phone renders this measure at 244px and an
              English "September 2026" beside a two-digit numeral is close to that.
            */}
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="numeric font-inv-display text-[2.875rem] leading-none text-inv-accent">
                {date.day}
              </span>
              <span className="font-inv-body text-[1.375rem] leading-snug text-inv-ink">
                {date.month} <span className="numeric">{date.year}</span>
              </span>
            </p>

            {/* Only the clock is isolated left to right. The period beside it is a word,
                and forcing it would seat it on the wrong side in Arabic. */}
            <p className="mt-4 font-inv-body text-[1.0625rem] text-inv-muted">
              {copy.labels.time}
              <span className="mx-2 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>
          </Block>

          {/* ------------------------------------------------------------- 8. venue */}
          <Block
            mark={
              <div className="h-[32px] w-[28px] text-inv-accent-soft">
                <JasmineTendril />
              </div>
            }
          >
            <Label>{copy.labels.venue}</Label>

            <p className="mt-2 font-inv-display text-[1.375rem] leading-snug text-inv-ink text-balance">
              {view.venueName}
            </p>

            {/*
              Sized to its label and started at the measure's own start edge, not stretched
              across the measure with the label centred inside it.

              As a full-width bar it was the only element on the card whose text did not
              begin on the column's text edge, and its outer edge stood 20px further out
              than any paragraph ever reaches, so in a start-aligned page it read as the
              one thing that had slipped. `w-fit` puts its first glyph exactly where every
              line above it starts. `tap-target` holds the 44px floor; with the 17px label
              and py-3 it comes out near 51.
            */}
            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-inv-accent/55 px-6 py-3 font-inv-body text-[1.0625rem] text-inv-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-inv-accent" aria-hidden="true">
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

          {/* ---------------------------------------------------------- 9. countdown */}
          <Block
            mark={
              <div className="h-[38px] w-[38px] text-inv-accent">
                <OpenFlower />
              </div>
            }
          >
            <HadiqaCountdown view={view} copy={copy} />
          </Block>

          {/* ----------------------------------------------------------- 10. message */}
          {view.customMessage ? (
            <Block
              mark={
                <div className="h-[34px] w-[32px] text-inv-accent-soft">
                  <LeafSprig />
                </div>
              }
            >
              <p className="font-inv-body text-[1.0625rem] leading-[1.9] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Block>
          ) : null}

          {/* ------------------------------------------------- 11. the couple's line */}
          {/* Empty when the couple chose no line. */}
          {copy.poetry ? (
            <Block
              mark={
                <div className="h-[30px] w-[30px] text-inv-accent">
                  <LeafNode />
                </div>
              }
            >
              <p className="font-inv-body text-[1.125rem] leading-[1.9] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </Block>
          ) : null}

          {/* ------------------------------------------------------------ 12. footer */}
          {/*
            `flex w-fit` with `tap-target` rather than a bare inline link. At 12px the
            credit's own box is nineteen pixels tall, which is under half the 44px floor
            and the smallest tappable thing anywhere in the product — the flex box takes
            the min-height and centres the text in it, so the target grows without the
            type moving.
          */}
          <Block
            className={STEP_LG}
            mark={
              <div className="h-[28px] w-[26px] text-inv-accent-soft">
                <LeafSprig />
              </div>
            }
          >
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press flex w-fit items-center font-inv-body text-xs text-inv-muted/80 hover:text-inv-accent"
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
 *
 * The arch spans the gutter AND the measure — 56 + 306 — so its trailing edge lands on
 * the same pixel as every paragraph's. At 306 it stopped 56px short of the text edge,
 * which on a start-aligned page is the one misalignment nothing else can hide.
 * `rounded-t-[181px]` is half of that full width; where the column is narrower, CSS
 * scales the two top radii down together to fit, so the top stays a true semicircle at
 * 320, 360 and 390 alike rather than a fixed curve on a variable box.
 */
function PhotoArch({ view }: { view: InvitationView }) {
  const [failed, setFailed] = useState(false);

  if (!view.photoUrl || failed) return null;

  return (
    <div className="relative w-full max-w-[362px]">
      <div
        className="relative overflow-hidden rounded-t-[181px] border border-inv-accent/40 bg-inv-panel"
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
