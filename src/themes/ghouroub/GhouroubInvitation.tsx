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
 * page is five full-bleed horizontal fields of colour plus the last of the light at the
 * foot of it, each carrying exactly one 1px rule, and that rule sits at a different
 * height in every field so the eye tracks a descent from the names down to the venue.
 * The one structural move the theme owns: content hangs BELOW the rule in the upper
 * fields and sits ABOVE it in the lower ones, so the optical weight of the page inverts
 * at its own midpoint. In the markup that flip is a single property — which grid row the
 * content is placed in — and nothing else about a band changes.
 *
 * What is locked here is the SHAPE of the system, not its magnitudes: five different
 * horizon heights moving in one direction, one measure that never changes, and one
 * rhythm scale that every gap on the card is drawn from. Centre a rule "to balance it",
 * give two bands the same rule height, or let a block invent a gap that is not on the
 * scale, and the theme is gone.
 */

/**
 * The sunset, and why it is on this line rather than the old one.
 *
 * The card's whole pitch is that it starts pale and DEEPENS AS YOU SCROLL. The first
 * build ran the grounds from #inv-bg to #inv-panel, which is a 1.14:1 tonal range end to
 * end: measured on a real phone, every screen from the names to the footer was the same
 * flat pale pink and the sunset simply never happened. A range you cannot see is not a
 * conservative choice, it is a missing feature.
 *
 * So the ramp is still ONE straight line between two palette tokens — it has to be, for
 * the reason below — but the far end is now accentSoft rather than panel, which buys a
 * 1.39:1 range and a real hue move from cream to apricot. The line passes within a hair
 * of panel at its /20 stop, so the old deep sky is still on it; it simply is no longer
 * the end of it.
 *
 * Six stops, evenly spaced at 10% each, and every ground is a point on the straight line
 * from #inv-bg to #inv-accentSoft. That is not a stylistic choice: five of the six
 * grounds are not tokens, so nothing has verified their contrast, and expressing them as
 * a blend of two endpoints is what makes verification tractable. Luminance falls
 * monotonically along the line, so the deepest stop is the worst case for every ink on
 * the card, and it was computed rather than eyeballed:
 *
 *   ground /50 = #f6c9aa — ink 9.72:1 · muted 4.95:1 · accent 4.90:1
 *
 * All three clear AA at the bottom of the page, therefore they clear it at every stop
 * above, blend zones included. accentSoft still never carries text anywhere in this
 * theme; it is a ground tint here, which is what its 1.95:1 rating is about.
 *
 * The band boundaries are a 60px ramp from this band's stop to the next, so there is no
 * visible edge anywhere and the whole page reads as one sky. Written as discrete
 * sections rather than one document-height gradient, because a gradient the height of
 * the document is a paint cost proportional to the length of the card.
 *
 * The class strings are literal on purpose: Tailwind scans source text, and a composed
 * `bg-inv-accent-soft/${n}` produces no CSS at all.
 */
const GROUND: Array<{ flat: string; blend: string }> = [
  { flat: 'bg-inv-accent-soft/0', blend: 'from-inv-accent-soft/0 to-inv-accent-soft/10' },
  { flat: 'bg-inv-accent-soft/10', blend: 'from-inv-accent-soft/10 to-inv-accent-soft/20' },
  { flat: 'bg-inv-accent-soft/20', blend: 'from-inv-accent-soft/20 to-inv-accent-soft/30' },
  { flat: 'bg-inv-accent-soft/30', blend: 'from-inv-accent-soft/30 to-inv-accent-soft/40' },
  { flat: 'bg-inv-accent-soft/40', blend: 'from-inv-accent-soft/40 to-inv-accent-soft/50' },
];

/** The last stop on the same line, under the poetry and the credit. */
const FOOTER_GROUND = 'bg-inv-accent-soft/50';

/**
 * Where the horizon sits in each band, as a fixed distance rather than a percentage.
 *
 * For a band whose content hangs BELOW the rule this is the sky above it; for a band
 * whose content sits ABOVE the rule it is the ground below it. Fixed rather than
 * fractional because a name that wraps to three lines or a message at its full length
 * has to push the band downward, not drag the horizon out of position — and `fr` rows
 * floor at their content, so a ratio would do exactly that. The photograph is the one
 * true percentage in the set, because that band has a genuinely fixed height, and it is
 * not in this table.
 *
 * The numbers only have to do two things and they now do both. They must all differ, so
 * that no two rules in the card sit at the same height; and they must MOVE IN ONE
 * DIRECTION, so the descent is a descent rather than a wobble — the sky above the rule
 * shrinks band on band, and once the page has flipped, the ground below it grows. The
 * previous set (250, 300, 250, 300, 340) did neither: it repeated a height, reversed
 * direction twice, and paid for it with roughly 350 empty pixels above the date and
 * another 350 between the countdown and the couple's line. A band of empty page with no
 * content and no ornament in it is a missing section, not breathing room. These are the
 * same composition at a length a guest will actually scroll: the sun still needs its
 * 105px of sky above the first rule, and it still gets it.
 */
const SKY = { names: 140, roles: 96, date: 76, venue: 96 };

/**
 * The vertical rhythm. Four gaps, and nothing on this card uses a fifth.
 *
 * One scale for the whole page, so that every distance a guest sees is one of four
 * values and the eye can learn it in the first screen. Band padding is drawn from the
 * same scale: content sits GAP_FACTS from its own rule and GAP_SECTION from the band's
 * far edge, in every band, on both sides of the flip.
 */
const GAP_LABEL = 'mt-3'; /* 12px — a label and the line it labels. */
const GAP_LINES = 'mt-6'; /* 24px — two lines of one fact. */
const GAP_FACTS = 'mt-10'; /* 40px — two facts inside one block. */
const GAP_SECTION = 'mt-16'; /* 64px — one section to the next. */

/**
 * The signature: the break in the horizon travels sideways as you scroll.
 *
 * One number per band, driven off a single page-scroll subscription and applied as a
 * translate on a line drawn at twice the band's width. Alternating directions with a
 * shrinking amplitude, so the horizon swings and then settles as the sun goes down.
 * Transform only: nothing here can touch layout, and the five bands share one scroll
 * listener between them.
 */
const GAP_TRAVEL: Array<readonly [number, number]> = [
  [-110, 110],
  [95, -95],
  [-80, 80],
  [70, -70],
  [-58, 58],
];

/** Three fixed values, never tweened. See useHazeStep. */
const HAZE_STEPS = [0.022, 0.034, 0.045];

/**
 * The constant measure. 342px is the whole column at 390px minus a 24px margin either
 * side, and it is the same in every band from the first line to the last. At 360px it
 * gives up width rather than margin, so no glyph on the card is ever closer than 24px to
 * the edge of the screen. The measure never changes because here it is the LINE that
 * moves, not the column.
 */
const MEASURE = '@container mx-auto w-[342px] max-w-[calc(100%-3rem)] text-center';

/**
 * The type scale. Six tiers, each between 1.2 and 1.45 times the one below it, so
 * adjacent sizes step instead of jumping:
 *
 *   14 · 17 · 21 · 28 · 36 (the Bismillah) · 52
 *
 * The old card had an 11px label directly under a 68px numeral — a 6:1 jump with nothing
 * in between, which reads as two unrelated objects rather than one date. Every size on
 * this page is now one of the six.
 */

/** A label spread out. Never `tracking`: letter-spacing is a silent no-op in Arabic, so
 *  any rhythm built on it exists in English only and the two cards diverge. The word
 *  gap is 0.12em rather than 0.3em, which at this size was wide enough to read as a
 *  double space between the words of the countdown heading. */
const LABEL = 'font-inv-body text-[0.875rem] text-inv-muted [word-spacing:0.12em]';

/**
 * The one control style in the theme: a bar ruled top and bottom and open at the sides.
 *
 * Not a 1px rectangle. This page has no closed shape anywhere in it, and a four-sided
 * outline with square corners was the only hard edge on the card — it read as a control
 * borrowed from somewhere else. Two horizontal rules the full width of the measure is
 * the horizon's own vocabulary, and at the full measure it cannot be mistaken for a
 * divider. 52px tall, which clears the 44px tap target with room for a two-line label.
 */
const CONTROL =
  'tap-target press flex min-h-[52px] w-full items-center justify-center gap-2 border-y border-inv-accent/45 px-4 font-inv-body text-[0.875rem] text-inv-ink';

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
        className={cn('pointer-events-none absolute inset-x-0 top-0 bottom-[60px]', ground.flat)}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-b',
          ground.blend,
        )}
      />
      {haze !== undefined ? <Haze opacity={haze} /> : null}

      {/* Only the first band has anything in its sky, and it is clipped by the horizon. */}
      {skyContent ? (
        <div className="relative col-start-1 row-start-1 overflow-hidden">{skyContent}</div>
      ) : null}

      <Horizon x={x} className="col-start-1 row-start-2 z-10 self-start" />

      <div
        className={cn(
          'relative z-10 col-start-1',
          MEASURE,
          side === 'below' ? 'row-start-2 self-start pt-10 pb-16' : 'row-start-1 self-end pt-16 pb-10',
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * The photograph: the only place in the set where it breaks the measure and bleeds to
 * both page edges, with the horizon running straight across it so the line continues
 * through the picture.
 *
 * Fixed height, which is what lets this band's rule be a true 42% — and what keeps the
 * no-photo version, a pure field of colour with one line across it, from collapsing into
 * a gap. That version is the point of the theme rather than a fallback, so a photo that
 * fails to load simply returns to it. 380px rather than the 520 it was built at, which
 * is 140px off the card and still leaves a near-square crop at every phone width — a
 * band much shorter than this starts cropping a portrait couple photo through the heads,
 * and one much taller reads, in the no-photo state, as the page having ended.
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
  const travel = GAP_TRAVEL[2];
  const x = useTransform(progress, [0, 1], reduced ? [0, 0] : [travel[0], travel[1]]);
  const showPhoto = Boolean(view.photoUrl) && !failed;

  return (
    <section className="relative h-[380px] overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[60px] bg-inv-accent-soft/20"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-b from-inv-accent-soft/20 to-inv-accent-soft/30"
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
            each end, because the ground here is a tint over bg and both have to fade.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[60px] bg-gradient-to-b from-inv-bg to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[60px] bg-gradient-to-b from-inv-accent-soft/20 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-inv-bg to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-inv-accent-soft/30 to-transparent"
          />
        </>
      ) : null}

      {/* Over a photograph the line is drawn in the sky's own colour rather than the
          accent hairline, which disappears against a dark picture. */}
      <Horizon
        x={x}
        className="absolute inset-x-0 top-[42%] z-10"
        lineClassName={showPhoto ? 'bg-inv-bg/80' : 'bg-inv-line'}
        markClassName={showPhoto ? 'bg-inv-bg/85' : 'bg-inv-accent/45'}
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
    return (
      <p className="font-inv-display text-[1.75rem] leading-snug text-inv-accent">
        {copy.labels.started[view.eventType]}
      </p>
    );
  }

  const cells = [
    { value: Math.floor(seconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((seconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((seconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: seconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div>
      {/* A sentence rather than a label: it is three words long, and the label's word
          spacing at three words reads as a double space between each of them. */}
      <p className="font-inv-body text-[1.0625rem] leading-[1.9] text-inv-muted">
        {copy.labels.countdownHeading[view.eventType]}
      </p>

      <div className={cn('grid grid-cols-4', GAP_LINES)}>
        {cells.map((cell) => (
          <div key={cell.label}>
            <span className="numeric block font-inv-display text-[1.75rem] leading-none text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className={cn('block font-inv-body text-[0.875rem] text-inv-muted', GAP_LABEL)}>
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
        1, 2 and 3. Names, the invitation line and the verse, hanging below the highest
        rule on the palest ground in the theme. The sun is where the cover left it: half
        set, cut by the horizon, which is the same clip the cover used and the reason the
        two states read as one continuous moment rather than two screens.
      */}
      <Band
        index={0}
        side="below"
        sky={SKY.names}
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
            nameClassName="text-[3.25rem] leading-[1.15] font-bold"
            separator={
              <span className="my-4 block font-inv-body text-[1.0625rem] text-inv-accent">
                {copy.nameSeparator}
              </span>
            }
          />
        </Reveal>

        {/* Directly under the names, in the same band, before the sacred text. */}
        <Reveal immediate delay={0.1} className={GAP_FACTS}>
          <p className="font-inv-body text-[1.0625rem] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Reveal>

        {/* Arabic card only: all three are null in English, so the whole block goes. */}
        {copy.bismillah && copy.verse ? (
          <Reveal immediate delay={0.15} className={GAP_SECTION}>
            {/*
              U+FDFD is one ligature roughly eleven times wider than its font size, so a
              size that suits ordinary text runs it off both edges of a phone. Sized
              against the column, which stops growing, rather than the viewport, which
              does not.

              8cqw rather than the 9 it was built at, which is the value the rest of the
              set uses. This face draws the ligature at up to 12.4 times its size, so 9%
              of the column measured 352px inside a 342px column and left the glyph 14px
              from the edge of a 390px screen — under the 16px floor. At 8 it sits inside
              the measure at every width from 320 up.
            */}
            <p
              className="font-inv-verse text-[length:min(2.25rem,8cqw)] leading-none text-inv-accent"
              aria-label="بسم الله الرحمن الرحيم"
            >
              {copy.bismillah}
            </p>

            <p className={cn('font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty', GAP_LINES)}>
              {copy.verse}
            </p>

            {copy.verseSource ? (
              <p className={cn('font-inv-body text-[0.875rem] text-inv-muted', GAP_LABEL)}>
                {copy.verseSource}
              </p>
            ) : null}
          </Reveal>
        ) : null}
      </Band>

      {/* 4. The two people the invitation comes from — the last content that hangs below
          the line. Everything after this sits above it. */}
      <Band index={1} side="below" sky={SKY.roles} progress={scrollYProgress} reduced={reduced}>
        <Reveal delay={0.05}>
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
                <p
                  className={cn(
                    'font-inv-body text-[1.3125rem] leading-snug font-semibold text-inv-ink text-balance',
                    GAP_LABEL,
                  )}
                >
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Band>

      {/* 5. The photograph, or the field of colour that is better than most photographs. */}
      <PhotoBand view={view} progress={scrollYProgress} reduced={reduced} />

      {/* 6 and 7. Date and hour, now sitting above the line. */}
      <Band
        index={3}
        side="above"
        sky={SKY.date}
        progress={scrollYProgress}
        reduced={reduced}
        haze={haze}
      >
        <Reveal>
          {/* The weekday is a word, not a label, and it is the line the numeral answers.
              At 21px it steps into the numeral instead of leaving it stranded. */}
          <p className="font-inv-body text-[1.3125rem] leading-snug text-inv-muted">{date.weekday}</p>

          {/* Alexandria is built here at 300, 400 and 700. The numeral is set at 400
              explicitly rather than asking for a 500 that would silently resolve to it. */}
          <p
            className={cn(
              'numeric font-inv-display text-[3.25rem] leading-none font-normal text-inv-accent',
              GAP_LABEL,
            )}
          >
            {date.day}
          </p>

          <p className={cn('font-inv-body text-[1.3125rem] leading-snug text-inv-ink', GAP_LABEL)}>
            {date.month} <span className="numeric">{date.year}</span>
          </p>

          {/* Only the clock is isolated. The period beside it is a word, and isolating it
              would seat it on the wrong side of the number in Arabic. */}
          <p className={cn('font-inv-body text-[1.0625rem] text-inv-muted', GAP_FACTS)}>
            {copy.labels.time}
            <span className="mx-2 text-inv-accent">·</span>
            <span className="numeric">{time.clock}</span> {time.period}
          </p>
        </Reveal>
      </Band>

      {/* 8 to 10. The deepest band of the card: where, how long, and what they wanted to
          say. */}
      <Band
        index={4}
        side="above"
        sky={SKY.venue}
        progress={scrollYProgress}
        reduced={reduced}
        haze={haze}
      >
        <Reveal>
          <p className={LABEL}>{copy.labels.venue}</p>
          <p
            className={cn(
              'font-inv-display text-[1.3125rem] leading-snug text-inv-ink text-balance',
              GAP_LABEL,
            )}
          >
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(CONTROL, GAP_LINES)}
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

        <Reveal className={GAP_SECTION}>
          <GhouroubCountdown view={view} copy={copy} />
        </Reveal>

        {/* The couple's own words. Capped at 200 characters where it is written, so
            nothing here has to truncate somebody's message mid-sentence. The size comes
            from this card's scale rather than the shared block's, which is a tier below
            everything else here. */}
        {view.customMessage ? (
          <Reveal className={cn(GAP_SECTION, '[&>p]:text-[1.0625rem]')}>
            <MessageBlock view={view} />
          </Reveal>
        ) : null}
      </Band>

      {/*
        11 and 12. The couple's line and the credit, in the last of the light. The one
        part of the card that returns below the final rule.

        The credit link is given the theme's own scale and a 44px target here rather than
        in the shared block, which sets it at 12px, no minimum height, and muted at 80% —
        a 3.3:1 link that was 18px tall on a phone. Both are overridden on the anchor
        itself; the padding on this wrapper is what stops the shared 56px margin above it
        from collapsing to something off the rhythm.
      */}
      <div className={cn('relative', FOOTER_GROUND)}>
        <Haze opacity={haze} />
        <div className={cn('relative py-16', MEASURE)}>
          {/* Empty when the couple chose no line. */}
          {copy.poetry ? (
            <Reveal>
              <p className="font-inv-body text-[1.0625rem] leading-[2] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </Reveal>
          ) : null}

          <div className="pt-2 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:justify-center [&_a]:px-4 [&_a]:text-[0.875rem] [&_a]:text-inv-muted">
            <FooterBlock view={view} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
