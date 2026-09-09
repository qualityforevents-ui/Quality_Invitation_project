'use client';

import { useState } from 'react';
import {
  EightPetalMedallion,
  LotusPalmette,
  RunningStitchSeam,
  SteppedMerlonBorder,
} from './KhayamiyaOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * خيامية, revealed. The axis is a FIELD STACK.
 *
 * Full-bleed saturated appliqué panels running edge to edge with zero page margin.
 * Hard running-stitch seams bind each cloth field to the next.
 * Color fields alternate madder (bg), panel red, and tentmaker teal (accentSoft).
 *
 * What would destroy the axis, and therefore may not be done here: putting the card in
 * a centred column with a page margin, softening the seams into rules or shadows,
 * letting one background show through behind the fields, or dropping the cut-shape
 * border from the field edges. The fields ARE the ground; there is nothing behind them.
 *
 * THE RHYTHM. Every cloth takes FIELD or FIELD_TALL and nothing else, so the distance
 * from any block of type to the seam above it is one of exactly two numbers. FIELD_TALL
 * is spent on the three cloths that open, anchor and close the stack — names, date, the
 * couple's line — and every other cloth is FIELD. A field whose padding is picked at the
 * call site is how the stack lost its rhythm the first time.
 *
 * THE MEASURE. Every block of type on the card is wrapped in MEASURE, so all of them
 * share one text edge: 24px in from the cloth edge on a phone, a 400px column above
 * that. The 24px also keeps type clear of the 16px merlon tab at each inline edge.
 *
 * THE COLOUR ORDER. No two touching cloths are the same colour, including across the
 * three optional fields (verse, photo, message), and the teal is spent on exactly two
 * (roles, countdown) as the theme contract requires. The card opens and closes on the
 * same madder so the footer reads as the stack finishing rather than as a stray band.
 */

/** The two field paddings. Nothing else sets vertical padding on a cloth. */
const FIELD = 'relative flex flex-col items-center justify-center px-6 py-12 text-center';
const FIELD_TALL = 'relative flex flex-col items-center justify-center px-6 py-14 text-center';

/** The one measure. Every block of type on the card lines its edges up on this. */
const MEASURE = 'relative z-10 w-full max-w-[400px]';

function KhayamiyaCountdown({
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
    return (
      <p className="font-inv-display text-[21px] font-bold text-inv-ink">
        {copy.labels.started[eventType]}
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
    <div className="grid grid-cols-4 gap-3 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="numeric font-inv-display text-[1.75rem] font-bold leading-none text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          {/*
            12px, not 10px. This cloth is the tent teal, which is a mid tone: cream on it
            is 3.1:1, so the label has no contrast headroom to spend and has to buy its
            legibility with size and weight instead.
          */}
          <span className="mt-2 font-inv-body text-[12px] font-medium text-inv-ink">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function KhayamiyaInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-inv-bg text-inv-ink">

      {/* ================= 1. NAMES: madder cloth ================= */}
      <section className={cn(FIELD_TALL, 'min-h-[36vh] bg-inv-bg')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        {/*
          The medallion is a crest over the names, not a watermark under them.

          It used to sit at inset-0, dead centre, at 25% opacity — which put a 200px
          eight-petal flower in saturated teal and gold directly behind the one line of
          the card that has to be read first. On this madder ground 25% is not a
          watermark, it is an object, and the names were competing with it for the same
          pixels. Appliqué panels stack: a medallion, then the text beneath it. So does
          this now, at full strength, where it decorates instead of interferes.

          72px, not 104px, and the names are 44px rather than 36px. A crest that is
          nearly three times the height of a single name inverts the hierarchy on the one
          card whose entire subject is two people's names.
        */}
        <Reveal immediate className="relative z-10 mb-7">
          <EightPetalMedallion size={72} />
        </Reveal>

        <Reveal immediate className={MEASURE}>
          {copy.familiesPrefix ? (
            <p className="mb-4 font-inv-body text-[13px] tracking-[0.14em] text-inv-muted">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="font-inv-display text-[2.75rem] font-bold leading-[1.16] text-inv-ink text-balance">
            <span className="block">{view.name1}</span>
            <span className="my-1 block text-2xl text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-5 font-inv-body text-[11px] uppercase tracking-[0.16em] text-inv-accent">
            {copy.eventName[view.eventType]}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 2. INVITATION LINE: panel cloth =================
          This block and the couple's line at the end of the card were both sitting
          loose between two seams with no section, no cloth colour and no inline
          padding, which ran their text flush into both viewport edges. They are fields
          in the stack like everything else. */}
      <section className={cn(FIELD, 'bg-inv-panel')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className={MEASURE}>
          <p className="font-inv-body text-[17px] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 3. BISMILLAH + VERSE: the one un-patterned cloth ================= */}
      {copy.bismillah && copy.verse ? (
        <>
          <section className={cn(FIELD_TALL, 'min-h-[24vh] bg-inv-bg')}>
            {/* Merlon borders explicitly suppressed on this sacred cloth. */}
            <Reveal className={MEASURE}>
              {/*
                U+FDFD is a single ligature around eleven times wider than its font size,
                so it is sized against the viewport rather than set at a fixed 2.375rem:
                at 360px a fixed size runs the glyph past the measure and into the edge.
              */}
              <p
                className="font-inv-verse text-[length:min(2.25rem,7.5vw)] leading-none text-inv-ink"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-7 font-inv-verse text-[1.0625rem] leading-[2.05] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-[13px] text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 5. PHOTO: madder cloth =================
          Only when there is a photo. The no-photo state used to be a 300px field holding
          a second copy of the eight-petal medallion from the top of the card, which is
          an ornament repeated to fill space it is not carrying — and the sample card,
          the one most customers see, has no photo, so that band was the theme's largest
          piece of dead cloth. The photo still gets its own cloth whenever there is one;
          what is gone is a field that existed to hold a repeat of an ornament. */}
      {hasPhoto ? (
        <>
          <section className={cn(FIELD, 'bg-inv-bg')}>
            <SteppedMerlonBorder side="left" />
            <SteppedMerlonBorder side="right" />

            <Reveal className="relative z-10">
              <div className="relative mx-auto inline-block rounded-full border-[3px] border-dashed border-inv-ink/90 bg-inv-panel p-2 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.photoUrl!}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="h-[220px] w-[220px] rounded-full object-cover"
                />
              </div>
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 6. DATE: panel cloth ================= */}
      <section className={cn(FIELD_TALL, 'bg-inv-panel')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className={MEASURE}>
          {/*
            13 / 48 / 21, not 11 / 60 / 18. The numeral is still the loudest thing in the
            stack, but it now has a tier above it and a tier below it that are on the
            same ladder as the rest of the card, and it no longer out-sizes the names.
          */}
          <p className="font-inv-body text-[13px] uppercase tracking-[0.16em] text-inv-muted">
            {date.weekday}
          </p>
          <p className="numeric mt-3 font-inv-display text-5xl font-bold leading-none text-inv-accent">
            {date.day}
          </p>
          <p className="mt-4 font-inv-display text-[21px] text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 7. TIME: madder cloth =================
          This was a 64px strip carrying one 17px line between two seams, which read as
          the gap between the date and the venue rather than as a cloth. It is built like
          the date field now — gold label, display figure — so the two practical fields
          are a pair, and it carries the height that every other field in the stack does. */}
      <section className={cn(FIELD, 'bg-inv-bg')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className={MEASURE}>
          <p className="font-inv-body text-[11px] uppercase tracking-[0.16em] text-inv-accent">
            {copy.labels.time}
          </p>
          {/* Only the clock is isolated as left to right. The period beside it is a word,
              and forcing it would seat it on the wrong side in Arabic. */}
          <p className="mt-3 font-inv-display text-[1.75rem] leading-none text-inv-ink">
            <span className="numeric font-bold">{time.clock}</span> {time.period}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 8. VENUE: panel cloth with the Maps button ================= */}
      <section className={cn(FIELD, 'bg-inv-panel')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className={MEASURE}>
          <p className="font-inv-body text-[11px] uppercase tracking-[0.16em] text-inv-accent">
            {copy.labels.venue}
          </p>
          <p className="mt-3 font-inv-body text-[21px] font-bold text-inv-ink text-balance">
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press mt-7 inline-flex items-center justify-center gap-2 rounded bg-inv-accent px-8 py-3 font-inv-body text-[15px] font-bold text-inv-bg shadow-sm hover:brightness-105"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
              </svg>
              {copy.labels.mapsButton}
            </a>
          ) : null}
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 9. COUNTDOWN: teal cloth ================= */}
      <section className={cn(FIELD, 'bg-inv-accent-soft')}>
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className={MEASURE}>
          <p className="mb-6 font-inv-body text-[13px] font-semibold text-inv-ink">
            {copy.labels.countdownHeading[view.eventType]}
          </p>
          <KhayamiyaCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 10. MESSAGE: madder cloth ================= */}
      {view.customMessage ? (
        <>
          <section className={cn(FIELD, 'bg-inv-bg')}>
            <SteppedMerlonBorder side="left" />
            <SteppedMerlonBorder side="right" />

            <Reveal className={MEASURE}>
              <p className="font-inv-body text-[15px] leading-[1.95] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 11. THE COUPLE'S OWN LINE: panel cloth ================= */}
      {copy.poetry ? (
        <>
          <section className={cn(FIELD_TALL, 'bg-inv-panel')}>
            <SteppedMerlonBorder side="left" />
            <SteppedMerlonBorder side="right" />

            <Reveal className={MEASURE}>
              <LotusPalmette size={40} className="mb-6" />
              <p className="font-inv-body text-[17px] font-medium leading-[1.95] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 12. FOOTER: the madder cloth the card opened on ================= */}
      <footer className="relative flex items-center justify-center bg-inv-bg px-6 py-5 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        {/* 13px in a 44px target. The credit was a 16px-tall tap on every card in the
            set, which is a link a thumb cannot reliably hit. */}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target press relative z-10 inline-flex items-center justify-center px-4 font-inv-body text-[13px] text-inv-muted hover:text-inv-accent"
        >
          {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
        </a>
      </footer>
    </div>
  );
}
