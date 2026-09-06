'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import {
  CROWN_HEIGHT_CSS,
  FRAME_STYLE,
  GUTTER,
  IwanCrown,
  IwanHalfDome,
  IwanLegs,
  IwanPhotoArch,
  IwanVoussoirStub,
  TIER_INSET,
} from './IwanOrnaments';
import { FooterBlock, NamesBlock } from '../sections';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * الإيوان, revealed. The axis is FRAME AS MEASURE.
 *
 * There is one structural idea in this file and everything else follows from it: the
 * arch is not an ornament drawn over a column, it IS the column. A horseshoe crown at
 * the head of the page, two 2px legs running the whole scroll height down the inline
 * margins, a stepped plinth where they land at the footer — and the width of every line
 * of type on the card is the distance between those two legs, minus air. Nothing here
 * has a max-width. There is no measure token to tune, because the measure is a drawing.
 *
 * The second half of the idea is that the drawing MOVES. At three points the walls step
 * inward, and the text steps with them: 342px under the crown, then 315, then 296, then
 * 286 at the base. You are walking into an iwan and it is narrowing around you. The
 * taper is capped at 28px in total no matter how long the card runs, because a fourth
 * step would put Arabic body text under 260px, where it starts breaking badly — the cap
 * lives in TIER_INSET and is not a number to be extended when a card feels short.
 *
 * Two consequences worth naming, because both look like omissions:
 *
 * There is not one horizontal rule, border or card in this file. A theme whose entire
 * structure is a frame cannot also have boxes inside the frame without arguing with
 * itself, so a change of subject is marked by three stones laid across the measure —
 * IwanVoussoirStub — and by nothing else. The verse is the single exception and it is a
 * FIELD rather than a card: a course of the lighter stone laid wall to wall, no radius,
 * no border, and no ablaq tile behind it. Qur'anic text on a striped ground is the one
 * thing the house rules name outright.
 *
 * And the crown and the legs are two SVGs, never one. A full page arch stretched to an
 * unknown scroll height turns a horseshoe into an oval; the legs are the only part safe
 * to scale non-uniformly, because a vertical line stretched vertically is still that
 * line. Merging them is this theme's single build failure.
 */

/**
 * The four tiers, and where the wall steps between them.
 *
 * Read as: which side of a haunch a block sits on. The insets themselves come from
 * IwanOrnaments so that the wall and the words step at the same x — the legs are drawn
 * from TIER_INSET and the padding here is TIER_INSET plus the gutter, which is the whole
 * mechanism by which the measure is the frame rather than a number that happens to match
 * it today.
 */
type Tier = 0 | 1 | 2 | 3;

/** A label spread out. Word-spacing, never tracking: letter-spacing is a silent no-op in
 *  Arabic, so any rhythm built on it exists on the English card alone. */
const LABEL = 'font-inv-body text-[0.6875rem] text-inv-muted [word-spacing:0.3em]';

/**
 * A block of the card, standing inside the walls at its tier.
 *
 * `bleed` is for the one field that runs wall to wall — it keeps 2px of clearance so the
 * panel butts against the inner edge of the leg rather than swallowing it.
 *
 * The entrance is 6px rather than the house's 18. Stone does not drift into place, and
 * at this scale a block that travels far enough to notice reads as a web page settling
 * rather than as a course being laid.
 */
function Course({
  tier,
  bleed = false,
  immediate = false,
  delay = 0,
  className,
  children,
}: {
  tier: Tier;
  bleed?: boolean;
  immediate?: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const animation = {
    initial: { opacity: 0, y: 6 },
    transition: { duration: 0.6, delay, ease: EASE },
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ paddingInline: TIER_INSET[tier] + (bleed ? 2 : GUTTER) }}
      {...animation}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 } })}
    >
      {children}
    </motion.div>
  );
}

/**
 * A haunch: the gap in which the wall steps inward.
 *
 * It is a real 64px of space and not a zero height marker, because IwanLegs measures
 * these off the DOM rather than placing them at fractions of the page. The wall steps at
 * exactly the y where the measure steps, however long the couple's custom message turns
 * out to be — and a fraction would drift the moment anybody wrote one.
 */
function Haunch() {
  return <span data-iwan-step="" aria-hidden="true" className="block h-16" />;
}

/* ------------------------------------------------------------------ the countdown */

/**
 * Four cells, no containers and no rings.
 *
 * The shared Countdown draws a ring per number, which is both a box and a circle in a
 * theme that has agreed to have neither. The hydration handling is taken from it
 * deliberately: the first render uses the target itself as the clock so the server and
 * the client agree on the markup, and the real time takes over one tick later.
 */
function IwanCountdown({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
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
    return <p className="font-inv-display text-2xl text-inv-accent">{copy.labels.started}</p>;
  }

  const cells = [
    { value: Math.floor(seconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((seconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((seconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: seconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div>
      <p className={LABEL}>{copy.labels.countdownHeading}</p>

      <div className="mt-6 grid grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label}>
            <span className="numeric block font-inv-body text-[2rem] leading-none font-semibold text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-2 block font-inv-body text-[0.625rem] text-inv-muted">
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- the window */

/**
 * The opening in the hall wall, whichever kind of opening it turns out to be.
 *
 * No photo is the common case, and here it is the better card rather than the apology:
 * the eleven cell muqarnas half dome is the strongest object in the theme and it exists
 * only in this state. A photo that fails to load falls back to it too, so an ImageKit
 * outage lands on the flagship version of the page instead of on a hole in a wall.
 */
function IwanWindow({ view }: { view: InvitationView }) {
  const [failed, setFailed] = useState(false);

  if (view.photoUrl && !failed) {
    return (
      <IwanPhotoArch
        src={view.photoUrl}
        alt={`${view.name1} & ${view.name2}`}
        onFailed={() => setFailed(true)}
      />
    );
  }

  return <IwanHalfDome />;
}

/* ------------------------------------------------------------------- the card */

export function IwanInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <motion.div
      className="min-h-dvh bg-inv-bg pt-8"
      style={FRAME_STYLE}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/*
        The shaft. Its width is the frame token and there is no max-width anywhere below
        it, which is the whole theme in one line: every measure on this card is derived
        from the arch by subtraction, never declared.
      */}
      <div className="relative mx-auto" style={{ width: 'var(--iwan-frame)' }}>
        <IwanCrown className="z-0" />

        {/*
          The legs, drawing themselves around the reader as they scroll.

          Started three pixels above the crown's foot rather than at it. The crown's
          height is a rounded multiple of the frame and this offset is not, so a butt
          joint leaves a one pixel hole in a two pixel wall at some screen widths and
          nowhere else; two identical accent strokes overlapping cannot show a seam.
        */}
        <IwanLegs style={{ top: `calc(${CROWN_HEIGHT_CSS} - 3px)` }} />

        <div className="relative z-10 pb-20" style={{ paddingTop: CROWN_HEIGHT_CSS }}>
          {/* ----------------------------------------------------------- 1. names */}
          {/*
            56px, and it does not shrink. Qahiri is a single weight display Kufi with
            nowhere for hierarchy to come from but size and interval, so "عبد الرحمن"
            takes three lines inside the measure rather than dropping a step — and the
            block grows downward, which the arch above it has no opinion about.
          */}
          <Course tier={0} immediate>
            <NamesBlock
              view={view}
              copy={copy}
              className="text-center"
              nameClassName="text-[3.5rem] leading-[1.12]"
              separator={
                <span className="my-2 block font-inv-body text-lg text-inv-accent" aria-hidden="true">
                  {copy.nameSeparator}
                </span>
              }
            />
          </Course>

          {/* ----------------------------------------------- 2. bismillah and verse */}
          {/*
            The springing zone: a course of the lighter stone laid from wall to wall.

            A field, not a card — no radius, no border, no shadow. And no ablaq tile
            behind it, which is the point of laying it here by hand instead of reusing a
            panel with the ground on: Qur'anic text over a striped pattern is the one
            thing the house rules forbid outright, and the tile is on every other panel
            surface in the theme.

            All three strings are null on the English card, so the whole field goes.
          */}
          {copy.bismillah && copy.verse ? (
            <Course tier={0} bleed immediate delay={0.12} className="mt-14">
              <div className="@container bg-inv-panel px-6 py-10 text-center">
                {/*
                  U+FDFD is a single ligature roughly eleven times wider than its font
                  size, so a size that suits ordinary text runs it off both edges of a
                  phone. Sized against the column with a container query rather than
                  against the viewport, because the column stops growing and a desktop
                  viewport does not — and in this theme the column is narrower than most,
                  so the cap does real work.
                */}
                <p
                  className="font-inv-verse text-[length:min(2.5rem,9cqw)] leading-none text-inv-accent"
                  aria-label="بسم الله الرحمن الرحيم"
                >
                  {copy.bismillah}
                </p>

                <p className="mt-7 font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty">
                  {copy.verse}
                </p>

                {copy.verseSource ? (
                  <p className="mt-3 font-inv-body text-[0.6875rem] text-inv-muted">
                    {copy.verseSource}
                  </p>
                ) : null}
              </div>
            </Course>
          ) : null}

          {/* ---------------------------------------------------------- 3. poetry */}
          <Course tier={0} className="mt-14">
            <IwanVoussoirStub className="mb-8" />
            <p className="text-center font-inv-body text-[1.125rem] leading-[1.9] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </Course>

          {/* ------------------------------------------------- 4. invitation line */}
          <Course tier={0} className="mt-10">
            <p className="text-center font-inv-body text-[1.0625rem] leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </Course>

          {/* ----------------------------------------------------------- 5. roles */}
          <Haunch />

          {/*
            Stacked rather than side by side. A two column grid halves an already
            tapering measure, and 315 minus the gutters leaves 133px a side — which is
            where "عبد الرحمن" starts breaking mid-word. Stacked, both names get the
            whole wall, and the stub between them does the work the column rule would.
          */}
          <Course tier={1}>
            <div className="text-center">
              <p className={LABEL}>{copy.roleGroom}</p>
              <p className="mt-2 font-inv-body text-xl leading-snug font-semibold text-inv-ink text-balance">
                {view.name1}
              </p>

              <IwanVoussoirStub className="my-7" />

              <p className={LABEL}>{copy.roleBride}</p>
              <p className="mt-2 font-inv-body text-xl leading-snug font-semibold text-inv-ink text-balance">
                {view.name2}
              </p>
            </div>
          </Course>

          {/* ----------------------------------------------------------- 6. photo */}
          <Course tier={1} className="mt-14">
            <IwanWindow view={view} />
          </Course>

          {/* ------------------------------------------------- 7 and 8. date, time */}
          <Haunch />

          <Course tier={2}>
            <div className="text-center">
              <p className={LABEL}>{date.weekday}</p>

              <p className="mt-3 font-inv-display text-[4.25rem] leading-none text-inv-accent">
                <span className="numeric">{date.day}</span>
              </p>

              {/* Not isolated. This line mixes a month name with digits and bidi already
                  orders it correctly; forcing a direction is what puts an Arabic date the
                  wrong way round. Only the bare year is safe to isolate. */}
              <p className="mt-3 font-inv-body text-base text-inv-ink">
                {date.month} <span className="numeric">{date.year}</span>
              </p>

              <IwanVoussoirStub className="my-7" />

              {/* Only the clock is isolated left to right. The period beside it is a
                  word, and forcing it would seat it on the wrong side in Arabic. */}
              <p className="font-inv-body text-base text-inv-muted">
                {copy.labels.time}
                <span className="mx-2 text-inv-accent">·</span>
                <span className="numeric">{time.clock}</span> {time.period}
              </p>
            </div>
          </Course>

          {/* ----------------------------------------------------------- 9. venue */}
          <Course tier={2} className="mt-14">
            <div className="text-center">
              <p className={LABEL}>{copy.labels.venue}</p>

              <p className="mt-2.5 font-inv-display text-[1.1875rem] leading-snug text-inv-ink text-balance">
                {view.venueName}
              </p>

              {/*
                A solid bar across the whole current measure, so the one practical control
                on the card is the width of the wall it stands in. No pin icon: the
                shared one carries a circle, and this theme has no round shapes anywhere,
                down to the confetti. The label already says where it goes.
              */}
              {view.venueMapUrl ? (
                <a
                  href={view.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target press mt-6 flex w-full items-center justify-center bg-inv-accent px-5 py-3 font-inv-body text-[0.9375rem] text-inv-bg"
                >
                  {copy.labels.mapsButton}
                </a>
              ) : null}
            </div>
          </Course>

          {/* ------------------------------------------------------- 10. countdown */}
          <Haunch />

          <Course tier={3}>
            <div className="text-center">
              <IwanCountdown view={view} copy={copy} />
            </div>
          </Course>

          {/* --------------------------------------------------------- 11. message */}
          {view.customMessage ? (
            <Course tier={3} className="mt-14">
              <p className="text-center font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Course>
          ) : null}

          {/* ---------------------------------------------------------- 12. footer */}
          {/*
            The last thing above the plinth. Padded to the narrowest tier like everything
            else here, so the credit sits inside the arch rather than under it, and the
            two legs run past it and meet on the floor.
          */}
          <div
            className="text-center"
            style={{ paddingInline: TIER_INSET[3] + GUTTER }}
          >
            <FooterBlock view={view} ornament={<IwanVoussoirStub className="mb-8" />} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
