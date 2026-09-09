'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  CreaseDivider,
  LAID_PAPER_TILE,
  WaxDripRule,
  WaxSeal,
} from './ZarfOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * الظرف, revealed. The axis is a FOLD GRID.
 *
 * One continuous sheet folded into three panels at content boundaries:
 * 1. Top Flap: Names, event name, invitation line
 * [Crease 1]
 * 2. Middle Panel: Bismillah + verse, roles, photo / wax-seal monogram
 * [Crease 2]
 * 3. Bottom Flap: Date, time, venue, countdown, message, the couple's line, footer
 *
 * Creases are siblings between content blocks rather than rigid percentage splits,
 * so long messages preserve the fold physics without clipping. NO BLOCK STRADDLES A
 * FOLD, and nothing but the fold spans the full sheet.
 *
 * THE THREE MEASUREMENTS THIS CARD IS BUILT FROM. Everything else derives from them,
 * and a new block should reach for one of these rather than inventing a fourth value.
 *
 * 1. ONE MEASURE. The sheet's inline padding is 24px, so the text column is the sheet
 *    minus 48px and every text edge on the card lands on it — including text inside a
 *    panel, which is why the verse and venue panels outdent and pad back in by the same
 *    amount — 17px for the venue, whose own 1px border counts toward that sum.
 *    Rules span the measure exactly. Only the crease escapes it: it bleeds the
 *    full 24px to the sheet's edges, because a fold crosses the whole sheet.
 *    The padding is symmetric. The letter used to sit off-square inside its envelope by
 *    6px, which is a lovely idea on paper and, on a 390px phone, is just a centred
 *    column that misses the centre by 3px and reads as a bug.
 *
 * 2. ONE RHYTHM, two steps. 56px (`space-y-14`) between blocks inside a panel; 40px of
 *    air on each side of a crease, so a fold is a 112px break and is unmistakably the
 *    largest gap on the card. Nothing between blocks is set by hand.
 *
 * 3. ONE TYPE SCALE: 56 (the day) · 44 (the names) · 32 (the count) · 24 · 22 · 20 ·
 *    17 · 16 · 15 · 14 · 12. Adjacent tiers step by about 1.1–1.4. The two hero sizes
 *    are allowed their jump; nothing else is. The day used to be 60px sitting directly
 *    on an 11px weekday with a 16px month between them, which is a jump, a tier and a
 *    jump rather than a scale.
 */

/**
 * The count, on the card's type scale: 32px numerals over 12px labels. It was 24 over
 * 10, which is a tier this card does not otherwise use and a pair too close together to
 * read as a value and its name.
 */
function ZarfCountdown({
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
    return <p className="font-inv-display text-[1.375rem] text-inv-accent">{copy.labels.started[eventType]}</p>;
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
          <span className="numeric font-inv-display text-[2rem] font-semibold leading-none text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-2 font-inv-body text-xs text-inv-muted">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ZarfInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);
  const monogram = `${view.name1[0] || ''} & ${view.name2[0] || ''}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /*
    Motion signature: the fold's shading relaxes as the reader descends, the way a sheet
    that has been held open stops holding its crease.

    It relaxes to 0.3, not to nothing. This pair used to drive the opacity of the entire
    divider down to 0.08, which meant the theme's one structural device had faded to an
    invisible hairline by the time the reader had actually scrolled to it — the card read
    as a plain sheet of cream type. The crease line itself no longer takes this value at
    all; see CreaseDivider.
  */
  const crease1Opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.3]);
  const crease2Opacity = useTransform(scrollYProgress, [0.3, 0.75], [1, 0.3]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden bg-inv-bg px-5 py-12 text-inv-ink sm:px-6"
    >
      {/* Laid paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: LAID_PAPER_TILE }}
        aria-hidden="true"
      />

      {/* The sheet. Symmetric 24px inline padding sets the card's one measure. */}
      <div className="relative mx-auto w-full max-w-[420px] border border-inv-line/50 bg-inv-panel/90 px-6 py-14 shadow-sm">

        {/* ================= PANEL 1: TOP FLAP ================= */}
        <section className="space-y-14 text-center">
          <Reveal immediate>
            {copy.familiesPrefix ? (
              <p className="mb-4 font-inv-body text-xs tracking-[0.14em] text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="font-inv-display text-[2.75rem] font-semibold leading-[1.2] text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-2 block text-2xl font-normal text-inv-accent" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-5 font-inv-body text-xs uppercase tracking-[0.2em] text-inv-accent">
              {copy.eventName[view.eventType]}
            </p>
          </Reveal>

          {/* Formal invitation line. A block of the flap, on the flap's own rhythm —
              it used to sit 22px under the event name with no gap class at all. */}
          <Reveal>
            <p className="font-inv-body text-[1.0625rem] leading-[1.9] text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </Reveal>
        </section>

        {/* CREASE 1: Dividing Top Flap from Middle Panel.
            The wrapper bleeds the fold out to the sheet's edges and owns the 40px of
            air on each side of it. */}
        <div className="-mx-6 my-10">
          <CreaseDivider shadowOpacity={crease1Opacity} />
        </div>

        {/* ================= PANEL 2: MIDDLE PANEL ================= */}
        <section className="space-y-14 text-center">
          {/* Bismillah + Verse (Laid paper suppressed behind sacred text).
              Outdent 16 / pad 16, so the verse sits on the card's one measure. */}
          {copy.bismillah && copy.verse ? (
            <Reveal>
              <div className="-mx-4 bg-inv-panel/70 px-4 py-6">
                {/*
                  U+FDFD is one ligature about 11.4 times as wide as its own font size,
                  so a plain font-size is a promise about the measure that it cannot
                  keep: at 24px it draws 274px, which is wider than this card's text
                  column on any phone narrower than about 365px. Sized against the
                  column instead — the same 88px of page and sheet padding the measure
                  itself is cut from — so the one element that could break the measure
                  is the one element that is derived from it. Inline because the value
                  is computed; a Tailwind class cannot carry this.
                */}
                <p
                  className="font-inv-verse leading-none text-inv-accent"
                  style={{ fontSize: 'min(1.5rem, calc((100vw - 5.5rem) / 12))' }}
                  aria-label="بسم الله الرحمن الرحيم"
                >
                  {copy.bismillah}
                </p>
                <p className="mt-4 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
                  {copy.verse}
                </p>
                {copy.verseSource ? (
                  <p className="mt-3 font-inv-body text-xs text-inv-muted">
                    {copy.verseSource}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {/* Photo / Monogram State. `max-w-full` on the image is load bearing: with
              `w-auto` alone a wide photo sized itself off its own height and pushed the
              document wider than the phone. */}
          <Reveal>
            <div className="flex justify-center">
              {hasPhoto ? (
                <div className="relative max-w-full border-b border-inv-line px-3 pb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={view.photoUrl!}
                    alt={`${view.name1} & ${view.name2}`}
                    loading="lazy"
                    onError={() => setPhotoFailed(true)}
                    className="block max-h-[300px] w-auto max-w-full object-cover shadow-xs"
                  />
                </div>
              ) : (
                <WaxSeal monogram={monogram} size={104} />
              )}
            </div>
          </Reveal>
        </section>

        {/* CREASE 2: Dividing Middle Panel from Bottom Flap */}
        <div className="-mx-6 my-10">
          <CreaseDivider shadowOpacity={crease2Opacity} />
        </div>

        {/* ================= PANEL 3: BOTTOM FLAP ================= */}
        <section className="space-y-14 text-center">
          {/* Date */}
          <Reveal>
            <p className="font-inv-body text-xs uppercase tracking-[0.2em] text-inv-muted">
              {date.weekday}
            </p>
            <p className="mt-4 font-inv-display text-[3.5rem] font-semibold leading-none text-inv-accent">
              <span className="numeric">{date.day}</span>
            </p>
            <p className="mt-3 font-inv-body text-[1.375rem] leading-snug text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>
          </Reveal>

          {/* Time. Its own block on the card's rhythm rather than 12px under the month,
              and the bullet carries one gap rather than a margin plus a source space. */}
          <Reveal>
            <p className="font-inv-body text-base text-inv-muted">
              {copy.labels.time}
              <span className="mx-2 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>
          </Reveal>

          {/* Venue & Location button */}
          <Reveal>
            <div className="-mx-[1.0625rem] border border-inv-line/50 bg-inv-bg/60 px-4 py-6">
              <p className="font-inv-body text-xs uppercase tracking-[0.2em] text-inv-accent">
                {copy.labels.venue}
              </p>
              <p className="mt-3 font-inv-body text-xl font-medium leading-snug text-inv-ink text-balance">
                {view.venueName}
              </p>
              {view.venueMapUrl ? (
                <a
                  href={view.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target press mt-6 inline-flex max-w-full items-center justify-center gap-2 border border-inv-accent/60 bg-inv-panel px-5 py-3 font-inv-body text-sm font-medium text-inv-ink text-center hover:bg-inv-bg"
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
            </div>
          </Reveal>

          {/* Countdown */}
          <Reveal>
            <div>
              <p className="mb-6 font-inv-body text-xs uppercase tracking-[0.2em] text-inv-muted">
                {copy.labels.countdownHeading[view.eventType]}
              </p>
              <ZarfCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
            </div>
          </Reveal>

          {/* Custom Message */}
          {view.customMessage ? (
            <Reveal>
              <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Reveal>
          ) : null}

          {/* The couple's own line. Empty when they chose none. */}
          {copy.poetry ? (
            <Reveal>
              <WaxDripRule className="mb-8" />
              <p className="font-inv-body text-[1.0625rem] leading-[1.95] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </Reveal>
          ) : null}

          {/* Footer credit. The closing mark is a wax dot rather than a second copy of
              the drip rule above it — the same ornament twice in one card reads as a
              template. The link is a 44px target; it was a 16px-tall line of text. */}
          <Reveal>
            <WaxDripRule variant="close" className="mb-4" />
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press inline-flex items-center justify-center px-4 font-inv-body text-xs text-inv-muted hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
