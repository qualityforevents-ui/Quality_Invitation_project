'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  MosqueLamp,
  PLUMB_LENGTHS,
  PLUMB_TILE,
  PlumbLine,
} from './QandeelOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * قنديل, revealed. The axis is SUSPENSION AND Z-DEPTH.
 *
 * Everything hangs from the top of the page on its own thread, at its own depth, on an
 * authored irregular sequence of drops (see PLUMB_LENGTHS). Three depth planes: far at
 * 0.35x, mid at 0.7x, near at 1.0x. Content is strictly on NEAR at a 342px measure.
 * No CSS blur anywhere.
 *
 * WHAT WOULD DESTROY THE AXIS, and therefore what this file may never do:
 *   — regularise the plumb lengths into one ramp, or sort them;
 *   — put a panel, card or border around a block, so it sits ON something instead of
 *     hanging from something;
 *   — give a block a vertical margin, which makes the space between blocks a margin
 *     with a decoration in it rather than a thread of a stated length;
 *   — flatten the three planes to one, or park the ornament in a static background.
 *
 * THREE THINGS THE LAYOUT NOW HOLDS TO, and the reason for each.
 *
 * 1. THE THREAD IS THE GAP. HungBlock has no vertical margin. A block's distance from
 *    the one above it is its drop plus the 12px the bob needs to clear the text under
 *    it, and nothing else. Previously the drop sat inside a 24px margin at each end, so
 *    every gap was 56px larger than the token said and the longest one ran to 186px of
 *    empty screen — a band with no content and no ornament in it, which is a missing
 *    section rather than breathing room.
 *
 * 2. ONE MEASURE. Every hung block is `w-full` inside the 342px near column, so every
 *    block's text edge lands on the same two verticals. Without it these are flex
 *    children of a centring column and each one shrink-wraps its own content: the roles
 *    pair collapsed to 116px with 113px of dead margin on both sides, the countdown to
 *    154px, and no two sections shared an edge.
 *
 * 3. THE BACKGROUND LAMPS SIT INSIDE THE FRAME. Both drifting layers are `fixed` and
 *    scaled about their centre, so a lamp's screen position is
 *      0.5·H·(1−s) + s·top   ..   0.5·H·(1−s) + s·(top + 1.583·size)
 *    Every lamp below is placed so that whole span is inside a 700px-tall viewport at
 *    rest with clearance to spare — 700 rather than 844 because that is what an iPhone
 *    actually shows once Safari's bars are on screen. Half a lantern hanging off an
 *    edge reads as a broken image, not as depth.
 */

/**
 * One block, hung.
 *
 * `w-full` is load bearing: see note 2 above. The 12px under the bob is the only fixed
 * vertical value in the whole column — every other gap is a plumb length.
 */
function HungBlock({
  drop,
  children,
  className,
}: {
  drop: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn('relative flex w-full flex-col items-center text-center', className)}>
      <PlumbLine length={drop} />
      <div className="mt-3 w-full">{children}</div>
    </Reveal>
  );
}

function QandeelCountdown({
  targetMs,
  copy,
  eventType,
}: {
  targetMs: number;
  copy: InvitationCopy;
  /** The line this draws when the count runs out names the occasion. */
  eventType: InvitationView['eventType'];
}) {
  const { totalSeconds, hasPassed } = useCountdownParts(targetMs);

  if (hasPassed) {
    return <p className="font-inv-display text-xl text-inv-accent">{copy.labels.started[eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    /*
      Full measure, not shrink-wrapped. Four cells across 342px, so the outer two land on
      the same verticals as the verse and the invitation line above them.
    */
    <div className="grid w-full grid-cols-4 gap-2 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="numeric font-inv-display text-[2.125rem] font-bold leading-none text-inv-accent">
            {cell.value.toString().padStart(2, '0')}
          </span>
          {/*
            12px, not 10px. A 34px numeral over a 10px label is a 3.4x jump with nothing
            between it, which reads as two unrelated things; and 10px muted on a dark
            ground is below what anyone reads on a phone held at arm's length.
          */}
          <span className="mt-2 font-inv-body text-xs text-inv-muted">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function QandeelInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /*
    Scroll signatures for the two background depth planes.

    Shortened from 180/320. The card is a third shorter than it was, and travel that was
    tuned for the old length now walks both layers off the bottom edge inside the first
    screen and a half, which turns "depth" into "the lanterns left". The ratio between
    the two — what actually makes the depth legible — is unchanged.
  */
  const farY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    /*
      pt-0: the first thread starts at the top edge of the page, because that is the
      whole claim of the theme. There used to be 64px of page padding plus a 24px block
      margin above it, so the card opened on 88px of nothing and then began to hang.

      px-5 is the house 20px gutter. At 360px it is what keeps a glyph off the edge,
      since the 342px measure is wider than the screen can give.
    */
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden bg-inv-bg px-5 pt-0 pb-20 text-inv-ink"
    >
      {/* ================= FAR DEPTH LAYER (0.35x, petrol green tint) ================= */}
      {/*
        Three lamps, all outline and unlit, all at different sizes. Opacity moved from
        0.22 with a second 0.6 multiplier on each lamp (0.13 effective, invisible) to a
        single 0.28: petrol green rather than gold, so this plane can never be confused
        with the accent that carries text.
      */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.28] select-none"
        style={{
          y: farY,
          scale: 0.82,
          backgroundImage: PLUMB_TILE,
        }}
        aria-hidden="true"
      >
        {/* Maximum 6 background decorative elements. Three here. */}
        <div className="absolute top-[132px] start-[13%] text-inv-accent-soft">
          <MosqueLamp size={66} variant="outline" lit={false} />
        </div>
        <div className="absolute top-[392px] end-[16%] text-inv-accent-soft">
          <MosqueLamp size={76} variant="outline" lit={false} />
        </div>
        <div className="absolute top-[596px] start-[22%] text-inv-accent-soft">
          <MosqueLamp size={70} variant="outline" lit={false} />
        </div>
      </motion.div>

      {/* ================= MID DEPTH LAYER (0.7x) ================= */}
      {/*
        Two lamps, pushed to the outer edges and dropped from 0.34 to 0.20.

        This plane is gold, and at 0.34 it was gold at the same weight as the countdown
        numerals it drifts behind — a lamp outline crossing "45" in the same hue as the
        digit. It is also unlit now: the radial glow belongs to the near hero lamp, and
        on this plane it was what put a wash behind the footer credit.
      */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.20] select-none"
        style={{
          y: midY,
          scale: 0.92,
        }}
        aria-hidden="true"
      >
        <div className="absolute top-[276px] end-[4%] text-inv-accent">
          <MosqueLamp size={88} variant="outline" lit={false} />
        </div>
        <div className="absolute top-[524px] start-[5%] text-inv-accent">
          <MosqueLamp size={92} variant="outline" lit={false} />
        </div>
      </motion.div>

      {/* ================= NEAR DEPTH LAYER: The Invitation Content (342px measure) ================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-[342px] flex-col items-center">

        {/*
          1. NAMES, hung on their plumb line.

          There was a 190px mosque lamp behind them at 30%, which drew its bowl, its
          finial and its chains straight through both names. The theme already hangs
          five lamps in the two drifting layers behind this column — the motif was never
          short of representation, and the one place it should not appear is inside the
          couple's names.
        */}
        <HungBlock drop={PLUMB_LENGTHS.names}>
          {copy.familiesPrefix ? (
            <p className="mb-3 font-inv-body text-xs tracking-wider text-inv-muted">
              {copy.familiesPrefix}
            </p>
          ) : null}

          {/*
            40px, up from 36. The spec asks for 58 and that will not survive a real
            four-word Arabic name inside 342px, but 36 left the names on the same tier as
            the venue name further down, which is the one thing on the card that has to
            outrank everything else.
          */}
          <h1 className="font-inv-display text-[2.5rem] font-bold leading-tight text-inv-ink text-balance sm:text-5xl">
            <span className="block">{view.name1}</span>
            <span className="my-1.5 block text-2xl font-normal text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
            {copy.eventName[view.eventType]}
          </p>
        </HungBlock>

        {/* 4. INVITATION LINE — hung on the longest drop in the sequence */}
        <HungBlock drop={PLUMB_LENGTHS.invite}>
          {/* leading-[1.9]: Arabic body copy never goes under 1.8 here. */}
          <p className="font-inv-body text-[17px] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </HungBlock>

        {/* 2. BISMILLAH + VERSE — parallax explicitly disabled, on flat bg, never on panel */}
        {copy.bismillah && copy.verse ? (
          <HungBlock drop={PLUMB_LENGTHS.verse}>
            <div>
              {/*
                24px, and it cannot go up.

                This is U+FDFD, one unbreakable ligature roughly eleven times as wide as
                it is tall. The spec asks for 2.375rem; at that size the glyph is ~440px
                across and runs off both edges of a 320px measure on a 360px phone, and
                because it cannot wrap there is no layout fix for it other than the size.
              */}
              <p
                className="font-inv-verse text-2xl text-inv-ink"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-5 font-inv-verse text-[1.125rem] leading-[2.1] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          </HungBlock>
        ) : null}

        {/* 6. PHOTO / NO PHOTO — same drop either way, so the substitution is invisible */}
        <HungBlock drop={PLUMB_LENGTHS.photo}>
          {hasPhoto ? (
            <div className="relative mx-auto inline-block max-w-full border-[1.5px] border-inv-accent bg-inv-panel p-1 shadow-md">
              {/* Corner suspension wire accents */}
              <span className="absolute -top-3 start-2 h-3 w-px bg-inv-accent" />
              <span className="absolute -top-3 end-2 h-3 w-px bg-inv-accent" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="block max-h-[260px] w-auto max-w-full object-cover"
              />
            </div>
          ) : (
            /* NO PHOTO: the hero lamp, lit, at the same hung height. */
            <div className="flex justify-center">
              <MosqueLamp size={120} />
            </div>
          )}
        </HungBlock>

        {/* 7 & 8. DATE & TIME — one hang, four tiers that step */}
        <HungBlock drop={PLUMB_LENGTHS.date}>
          <p className="font-inv-body text-xs uppercase tracking-wider text-inv-muted">
            {date.weekday}
          </p>
          {/*
            60px over a 20px month line, not 68px over an 18px one. The numeral is the
            feature of this block and it stays the biggest thing on the card after the
            names, but the tier under it had to come up to meet it or the two read as
            unrelated objects that happen to be stacked.
          */}
          <p className="mt-1 font-inv-display text-[3.75rem] font-semibold leading-none text-inv-accent">
            <span className="numeric">{date.day}</span>
          </p>
          <p className="mt-2 font-inv-display text-xl text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
          <p className="mt-3 font-inv-body text-[0.9375rem] text-inv-muted">
            {copy.labels.time} <span className="mx-1.5 text-inv-accent">·</span>
            <span className="numeric">{time.clock}</span> {time.period}
          </p>
        </HungBlock>

        {/* 9. VENUE — with the Maps button */}
        <HungBlock drop={PLUMB_LENGTHS.venue}>
          <p className="font-inv-body text-xs uppercase tracking-wider text-inv-muted">
            {copy.labels.venue}
          </p>
          <p className="mt-1.5 font-inv-body text-xl font-medium text-inv-ink text-balance">
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press mt-6 inline-flex items-center justify-center gap-2 rounded border border-inv-accent bg-inv-panel/60 px-7 py-3 font-inv-body text-sm font-semibold text-inv-accent shadow-xs hover:bg-inv-panel active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {copy.labels.mapsButton}
            </a>
          ) : null}
        </HungBlock>

        {/* 10. COUNTDOWN */}
        <HungBlock drop={PLUMB_LENGTHS.countdown}>
          <p className="mb-4 font-inv-body text-xs text-inv-muted">
            {copy.labels.countdownHeading[view.eventType]}
          </p>
          <QandeelCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
        </HungBlock>

        {/* 11. MESSAGE */}
        {view.customMessage ? (
          <HungBlock drop={PLUMB_LENGTHS.message}>
            <p className="font-inv-body text-[0.9375rem] leading-[1.9] text-inv-muted text-pretty">
              {view.customMessage}
            </p>
          </HungBlock>
        ) : null}

        {/* 12. THE COUPLE'S OWN LINE. Empty when they chose none. */}
        {copy.poetry ? (
          <HungBlock drop={PLUMB_LENGTHS.poetry}>
            <p className="font-inv-body text-lg leading-[1.9] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </HungBlock>
        ) : null}

        {/*
          13. FOOTER — the shortest hang on the card, and the last thread.

          The credit used to be an 11px link with no height of its own, 8px under a solid
          lamp: a 16px tap target sitting in the lamp's glow. It is now unlit, given a
          real thread of its own, 24px of clearance, and 44px of height like every other
          thing on the card you can press.
        */}
        <footer className="flex w-full flex-col items-center text-center">
          <PlumbLine length={40} />
          <div className="mt-3">
            <MosqueLamp size={24} variant="solid" lit={false} />
          </div>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target press mt-6 inline-flex items-center justify-center px-4 font-inv-body text-xs text-inv-muted hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </footer>
      </div>
    </div>
  );
}
