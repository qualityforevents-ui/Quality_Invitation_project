'use client';

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { GhouroubSun, Haze, Horizon } from './GhouroubOrnaments';
import { Reveal } from '@/components/invitation/Reveal';
import { FooterBlock, MessageBlock, NamesBlock } from '../sections';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * غروب, revealed. The axis is the HORIZON, and it is a line rather than a container.
 *
 * There is no panel, no card, no column border and not one rectangle in this file. The
 * page is six full-bleed horizontal fields of colour, each carrying exactly one 1px
 * rule, and that rule sits at a different height in every field so the eye tracks a
 * descent from the names down to the venue. The one structural move the theme owns:
 * content hangs BELOW the rule in the first three fields and sits ABOVE it in the last
 * three, so the optical weight of the page inverts at its own midpoint. In the markup
 * that flip is a single property — which grid row the content is placed in — and
 * nothing else about a band changes.
 *
 * Two things are locked and are not spacing anyone should tune: the six horizon heights
 * below, and the 96px rhythm between blocks at a constant 342px measure. The measure
 * never changes because here it is the LINE that moves, not the column. Compress the
 * rhythm to fit more on screen, or centre a rule "to balance it", and the theme is gone.
 */

/**
 * The six grounds, and why they are safe.
 *
 * Every band is the panel token laid over the bg token at a fixed alpha, stepping 0,
 * .2, .4, .6, .8, 1 from the names down to the venue. That is not a stylistic choice:
 * four of the six grounds are not tokens, so nothing has verified their contrast, and
 * expressing them as a blend of the two endpoints is what makes verification
 * unnecessary. Every ground is a point on the straight line between #inv-bg and
 * #inv-panel, luminance moves monotonically along it, and ink, muted and accent all
 * clear AA at both ends — so they clear it everywhere in between, including inside the
 * blend zones. Pick an arbitrary gradient stop instead and a paragraph fails silently
 * somewhere in the middle, which nobody sees until a guest does.
 *
 * The band boundaries are a 60px ramp from this band's alpha to the next band's, so
 * there is no visible edge anywhere and the whole page reads as one sky. Written as six
 * discrete sections rather than one document-height gradient, because a gradient the
 * height of the document is a paint cost proportional to the length of the card.
 *
 * The class strings are literal on purpose: Tailwind scans source text, and a composed
 * `bg-inv-panel/${n}` produces no CSS at all.
 */
const GROUND: Array<{ flat: string; blend: string | null }> = [
  { flat: 'bg-inv-panel/0', blend: 'from-inv-panel/0 to-inv-panel/20' },
  { flat: 'bg-inv-panel/20', blend: 'from-inv-panel/20 to-inv-panel/40' },
  { flat: 'bg-inv-panel/40', blend: 'from-inv-panel/40 to-inv-panel/60' },
  { flat: 'bg-inv-panel/60', blend: 'from-inv-panel/60 to-inv-panel/80' },
  { flat: 'bg-inv-panel/80', blend: 'from-inv-panel/80 to-inv-panel' },
  { flat: 'bg-inv-panel', blend: null },
];

/**
 * Where the horizon sits in each band, as a fixed distance rather than a percentage.
 *
 * The design ratios are 78, 66, 54, 42, 30 and 22 percent of each band's design height,
 * and these are those ratios resolved: for the first three the number is the sky ABOVE
 * the rule, for the last two it is the sky BELOW it. Fixed rather than fractional
 * because a name that wraps to three lines or a message at its full length has to push
 * the band downward, not drag the horizon out of position — and `fr` rows floor at their
 * content, so a ratio would do exactly that. Band four is the one true percentage in the
 * set, because a photograph gives that band a genuinely fixed height.
 */
/*
 * The sky above each band's rule.
 *
 * The first number was 560, which is two thirds of a 390x844 phone. A guest opened the
 * card and got most of a screen of empty sand before the first word of it — on the one
 * scroll position that is guaranteed to be seen. The sun needs 105px above the horizon
 * and the rest was air nobody asked for. The later bands are trimmed for the same
 * reason: this is a long card, and the space between sections should be a breath rather
 * than a gap you have to cross.
 */
const HORIZON_SKY = [250, 300, 250, 300, 340];

/**
 * The signature: the break in the horizon travels sideways as you scroll.
 *
 * One number per band, driven off a single page-scroll subscription and applied as a
 * translate on a line drawn at twice the band's width. Alternating directions with a
 * shrinking amplitude, so the horizon swings and then settles as the sun goes down.
 * Transform only: nothing here can touch layout, and the six bands share one scroll
 * listener between them.
 */
const GAP_TRAVEL: Array<readonly [number, number]> = [
  [-110, 110],
  [95, -95],
  [-80, 80],
  [70, -70],
  [-58, 58],
  [46, -46],
];

/** Three fixed values, never tweened. See useHazeStep. */
const HAZE_STEPS = [0.022, 0.034, 0.045];

/**
 * The constant measure. 342px is the whole column at 390px minus a 24px margin either
 * side, and it is the same in every band from the first line to the last.
 */
const MEASURE = '@container mx-auto w-[342px] max-w-[calc(100%-3rem)] text-center';

/** A label spread out. Never `tracking`: letter-spacing is a silent no-op in Arabic, so
 *  any rhythm built on it exists in English only and the two cards diverge. */
const LABEL = 'font-inv-body text-[0.6875rem] text-inv-muted [word-spacing:0.3em]';

/**
 * framer's MotionConfig covers everything framer animates, but the haze step below is
 * driven by our own state and has to ask the question itself. Starts false on both the
 * server and the first client render so hydration stays quiet.
 */
function usePrefersReducedMotion(): boolean {
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
 * The haze thickening as the sun drops, in three steps rather than as a tween.
 *
 * Stepping it means the entire scroll costs at most two style writes, where an
 * interpolated opacity would write one every frame for the length of the page. The
 * middle step is both the initial value and the reduced-motion value, so the reduced
 * card is the finished picture and the first paint never jumps.
 */
function useHazeStep(progress: MotionValue<number>, reduced: boolean): number {
  const [step, setStep] = useState(1);

  useMotionValueEvent(progress, 'change', (value) => {
    if (reduced) return;
    const next = value < 0.62 ? 0 : value < 0.84 ? 1 : 2;
    setStep((current) => (current === next ? current : next));
  });

  return HAZE_STEPS[reduced ? 1 : step];
}

/**
 * One field of colour, one rule, and content on one side of it.
 *
 * `side` is the entire flip. Below-the-line bands fix the row above the rule and let the
 * row below grow; above-the-line bands do the reverse. The rule is always the boundary
 * between the two rows, so it cannot drift out of agreement with the content it belongs
 * to however long a name turns out to be.
 */
function Band({
  index,
  side,
  sky,
  progress,
  reduced,
  haze,
  skyContent,
  children,
}: {
  index: number;
  side: 'below' | 'above';
  /** Pixels of sky above the rule for a below band, below it for an above band. */
  sky: number;
  progress: MotionValue<number>;
  reduced: boolean;
  /** Set only on the two deepest bands, where the air thickens. */
  haze?: number;
  skyContent?: ReactNode;
  children: ReactNode;
}) {
  const travel = GAP_TRAVEL[index];
  const x = useTransform(progress, [0, 1], reduced ? [0, 0] : [travel[0], travel[1]]);
  const ground = GROUND[index];

  return (
    <section
      className="relative grid overflow-hidden"
      style={{ gridTemplateRows: side === 'below' ? `${sky}px auto` : `auto ${sky}px` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0',
          ground.blend ? 'bottom-[60px]' : 'bottom-0',
          ground.flat,
        )}
      />
      {ground.blend ? (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-b',
            ground.blend,
          )}
        />
      ) : null}
      {haze !== undefined ? <Haze opacity={haze} /> : null}

      {/* Only band one has anything in its sky, and it is clipped by the horizon. */}
      {skyContent ? (
        <div className="relative col-start-1 row-start-1 overflow-hidden">{skyContent}</div>
      ) : null}

      <Horizon x={x} className="col-start-1 row-start-2 z-10 self-start" />

      <div
        className={cn(
          'relative z-10 col-start-1',
          MEASURE,
          side === 'below' ? 'row-start-2 self-start pt-12 pb-24' : 'row-start-1 self-end pt-24 pb-12',
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Band four: the only place in the set where the photograph breaks the measure and
 * bleeds to both page edges, with the horizon running straight across it so the line
 * continues through the picture.
 *
 * Fixed height, which is what lets this band's rule be a true 42% — and what keeps the
 * no-photo version, a pure field of colour with one line across it, from collapsing into
 * a gap. That version is the point of the theme rather than a fallback, so a photo that
 * fails to load simply returns to it.
 *
 * The warm cast over the photo is a flat colour and never a filter: a cool-toned couple
 * photo needs to belong to this sky, and a CSS filter on a scroll-length page is a
 * repaint nobody on a mid-range Android asked for.
 */
function PhotoBand({
  view,
  progress,
  reduced,
}: {
  view: InvitationView;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const travel = GAP_TRAVEL[3];
  const x = useTransform(progress, [0, 1], reduced ? [0, 0] : [travel[0], travel[1]]);
  const showPhoto = Boolean(view.photoUrl) && !failed;

  return (
    <section className="relative h-[520px] overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[60px] bg-inv-panel/60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-b from-inv-panel/60 to-inv-panel/80"
      />

      {showPhoto ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={view.photoUrl ?? ''}
            alt={`${view.name1} & ${view.name2}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-inv-accent/8" />

          {/*
            The photograph emerges from the sky and dissolves back into it over the same
            60px the band boundaries use, so a full-bleed picture does not put the two
            hard edges into a page whose whole argument is that it has none. Two layers
            each end, because the ground here is panel over bg and both have to fade.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[60px] bg-gradient-to-b from-inv-bg to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[60px] bg-gradient-to-b from-inv-panel/60 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-inv-bg to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-inv-panel/80 to-transparent"
          />
        </>
      ) : null}

      {/* Over a photograph the line is drawn in the sky's own colour rather than the
          accent hairline, which disappears against a dark picture. */}
      <Horizon
        x={x}
        className="absolute inset-x-0 top-[42%] z-10"
        lineClassName={showPhoto ? 'bg-inv-bg/80' : 'bg-inv-line'}
      />
    </section>
  );
}

/**
 * Four cells and no containers.
 *
 * The shared Countdown draws four rings, which is a container per number and a set of
 * letter-spaced Arabic labels; neither belongs in a theme that has no enclosed shapes.
 * The hydration handling is the same as the shared one and for the same reason: the
 * first render uses the target itself as the clock so the server and the client agree,
 * and the real time takes over one tick later.
 */
function GhouroubCountdown({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, view.eventInstantMs - (nowMs ?? view.eventInstantMs));
  const seconds = Math.floor(remaining / 1000);
  const hasPassed = nowMs !== null && view.eventInstantMs - nowMs <= 0;

  if (hasPassed) {
    return <p className="font-inv-display text-2xl text-inv-accent">{copy.labels.started[view.eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(seconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((seconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((seconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: seconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div>
      <p className={LABEL}>{copy.labels.countdownHeading[view.eventType]}</p>

      <div className="mt-6 grid grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label}>
            <span className="numeric block font-inv-display text-[2.125rem] leading-none text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-2.5 block font-inv-body text-[0.625rem] text-inv-muted">
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GhouroubInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const haze = useHazeStep(scrollYProgress, reduced);

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <motion.div
      className="min-h-dvh bg-inv-bg"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/*
        1 and 2. Names and the verse, hanging below the highest rule on the palest
        ground in the theme. The sun is where the cover left it: half set, cut by the
        horizon, which is the same clip the cover used and the reason the two states read
        as one continuous moment rather than two screens.
      */}
      <Band
        index={0}
        side="below"
        sky={HORIZON_SKY[0]}
        progress={scrollYProgress}
        reduced={reduced}
        skyContent={
          <div className="absolute bottom-[-105px] left-1/2 -ml-[105px]" aria-hidden="true">
            <GhouroubSun />
          </div>
        }
      >
        <Reveal immediate>
          <NamesBlock
            view={view}
            copy={copy}
            nameClassName="text-[3.375rem] leading-[1.15] font-bold"
            separator={
              <span className="my-4 block font-inv-body text-lg text-inv-accent">
                {copy.nameSeparator}
              </span>
            }
          />
        </Reveal>

        {/* Arabic card only: all three are null in English, so the whole block goes. */}
        {copy.bismillah && copy.verse ? (
          <Reveal immediate delay={0.15} className="mt-24">
            {/*
              U+FDFD is one ligature roughly eleven times wider than its font size, so a
              size that suits ordinary text runs it off both edges of a phone. Sized
              against the column, which stops growing, rather than the viewport, which
              does not.
            */}
            <p
              className="font-inv-verse text-[length:min(2.25rem,9cqw)] leading-none text-inv-accent"
              aria-label="بسم الله الرحمن الرحيم"
            >
              {copy.bismillah}
            </p>

            <p className="mt-8 font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty">
              {copy.verse}
            </p>

            {copy.verseSource ? (
              <p className="mt-4 font-inv-body text-[0.6875rem] text-inv-muted">
                {copy.verseSource}
              </p>
            ) : null}
          </Reveal>
        ) : null}
      </Band>

      {/* 3. The line of verse, alone in its band. */}
      <Band index={1} side="below" sky={HORIZON_SKY[1]} progress={scrollYProgress} reduced={reduced}>
        {/* Empty when the couple chose no line. */}
        {copy.poetry ? (
          <Reveal>
            <p className="font-inv-body text-[1.125rem] leading-[2] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </Reveal>
        ) : null}
      </Band>

      {/* 4 and 5. The invitation and the two people it comes from — the last content
          that hangs below the line. Everything after this sits above it. */}
      <Band index={2} side="below" sky={HORIZON_SKY[2]} progress={scrollYProgress} reduced={reduced}>
        <Reveal>
          <p className="font-inv-body text-[1.0625rem] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-24">
          {/* Two rows rather than two columns. A pair of columns is a table, and the
              table belongs to another theme; stacked rows keep the reading horizontal. */}
          <div className="space-y-10">
            {[
              { role: copy.roleGroom, name: view.name1 },
              { role: copy.roleBride, name: view.name2 },
            ].map((person) => (
              <div key={person.role}>
                <p className={LABEL}>{person.role}</p>
                {/* IBM Plex Sans Arabic ships here at 400 and 600 only, and a bare 500
                    resolves down to 400, which would leave the name and its label at the
                    same weight. */}
                <p className="mt-3 font-inv-body text-[1.3125rem] leading-snug font-semibold text-inv-ink text-balance">
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Band>

      {/* 6. The photograph, or the field of colour that is better than most photographs. */}
      <PhotoBand view={view} progress={scrollYProgress} reduced={reduced} />

      {/* 7 and 8. Date and hour, now sitting above the line. */}
      <Band
        index={4}
        side="above"
        sky={HORIZON_SKY[3]}
        progress={scrollYProgress}
        reduced={reduced}
        haze={haze}
      >
        <Reveal>
          <p className={LABEL}>{date.weekday}</p>

          {/* Alexandria is built here at 300, 400 and 700. The numeral is set at 400
              explicitly rather than asking for a 500 that would silently resolve to it. */}
          <p className="numeric mt-4 font-inv-display text-[4.25rem] leading-none font-normal text-inv-accent">
            {date.day}
          </p>

          <p className="mt-4 font-inv-body text-base text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>

          {/* Only the clock is isolated. The period beside it is a word, and isolating it
              would seat it on the wrong side of the number in Arabic. */}
          <p className="mt-12 font-inv-body text-base text-inv-muted">
            {copy.labels.time}
            <span className="mx-2 text-inv-accent">·</span>
            <span className="numeric">{time.clock}</span> {time.period}
          </p>
        </Reveal>
      </Band>

      {/* 9 to 12. The deepest ground, the highest rule, and the footer alone below it. */}
      <Band
        index={5}
        side="above"
        sky={HORIZON_SKY[4]}
        progress={scrollYProgress}
        reduced={reduced}
        haze={haze}
      >
        <Reveal>
          <p className={LABEL}>{copy.labels.venue}</p>
          <p className="mt-3 font-inv-display text-[1.1875rem] leading-snug text-inv-ink text-balance">
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press mt-6 flex w-full items-center justify-center gap-2 border border-inv-accent/70 px-5 font-inv-body text-sm text-inv-ink"
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
        </Reveal>

        <Reveal className="mt-24">
          <GhouroubCountdown view={view} copy={copy} />
        </Reveal>

        {/* The couple's own words. Capped at 200 characters where it is written, so
            nothing here has to truncate somebody's message mid-sentence. */}
        {view.customMessage ? (
          <Reveal className="mt-24">
            <MessageBlock view={view} />
          </Reveal>
        ) : null}
      </Band>

      {/* The one element that returns below the line, in the last of the light. */}
      <div className="relative bg-inv-panel">
        <Haze opacity={haze} />
        <div className={cn('relative pb-24', MEASURE)}>
          <FooterBlock view={view} />
        </div>
      </div>
    </motion.div>
  );
}
