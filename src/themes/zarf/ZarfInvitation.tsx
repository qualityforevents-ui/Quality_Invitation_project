'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
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
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * الظرف, revealed. The axis is a FOLD GRID.
 *
 * One continuous sheet folded into three panels at content boundaries:
 * 1. Top Flap: Names
 * [Crease 1]
 * 2. Middle Panel: Verse, Poetry, Invitation Line, Roles, Photo / Monogram
 * [Crease 2]
 * 3. Bottom Flap: Date, Time, Venue, Countdown, Custom Message, Footer
 *
 * Creases are siblings between content blocks rather than rigid percentage splits,
 * so long messages preserve the fold physics without clipping.
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
    return <p className="font-inv-display text-xl text-inv-accent">{copy.labels.started[eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="numeric font-inv-display text-2xl font-semibold leading-none text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-1 font-inv-body text-[10px] text-inv-muted">
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

  // Motion signature: Crease shadows relax flat as reader descends
  const crease1Opacity = useTransform(scrollYProgress, [0, 0.4], [0.45, 0.08]);
  const crease2Opacity = useTransform(scrollYProgress, [0.3, 0.8], [0.45, 0.08]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden bg-inv-bg px-4 py-12 text-inv-ink sm:px-6"
    >
      {/* Laid paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: LAID_PAPER_TILE }}
        aria-hidden="true"
      />

      {/* Main letter sheet with asymmetric margins (inline-start 6px wider) */}
      <div className="relative mx-auto w-full max-w-[440px] border border-inv-line/50 bg-inv-panel/90 shadow-sm ps-[2.125rem] pe-[1.75rem] py-10">

        {/* ================= PANEL 1: TOP FLAP ================= */}
        <section className="text-center">
          <Reveal immediate>
            {copy.familiesPrefix ? (
              <p className="mb-3 font-inv-body text-xs tracking-wider text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="font-inv-display text-[2.75rem] font-semibold leading-[1.2] text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-1.5 block text-xl text-inv-accent font-normal" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
              {copy.eventName[view.eventType]}
            </p>
          </Reveal>
        </section>

        {/* CREASE 1: Dividing Top Flap from Middle Panel */}
        <motion.div style={{ opacity: crease1Opacity }}>
          <CreaseDivider />
        </motion.div>

        {/* ================= PANEL 2: MIDDLE PANEL ================= */}
        <section className="space-y-8">
          {/* Bismillah + Verse (Laid paper suppressed behind sacred text) */}
          {copy.bismillah && copy.verse ? (
            <Reveal>
              <div className="rounded bg-inv-panel/70 p-4 text-center">
                <p
                  className="font-inv-verse text-2xl text-inv-accent"
                  aria-label="بسم الله الرحمن الرحيم"
                >
                  {copy.bismillah}
                </p>
                <p className="mt-3 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
                  {copy.verse}
                </p>
                {copy.verseSource ? (
                  <p className="mt-2 font-inv-body text-xs text-inv-muted">
                    {copy.verseSource}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {/* Poetry with wax drip rule */}
          <Reveal>
            <WaxDripRule />
            <p className="font-inv-body text-base leading-[1.9] text-inv-muted text-pretty text-center">
              {copy.poetry}
            </p>
          </Reveal>

          {/* Formal Invitation Line */}
          <Reveal>
            <p className="font-inv-body text-[1.0625rem] leading-relaxed text-inv-ink text-pretty text-center">
              {copy.inviteLine[view.eventType]}
            </p>
          </Reveal>

          {/* Roles */}
          <Reveal>
            <div className="grid grid-cols-2 gap-4 border-y border-inv-line/40 py-5 text-center">
              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em]">
                  {copy.roleGroom}
                </span>
                <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                  {view.name1}
                </p>
              </div>
              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em]">
                  {copy.roleBride}
                </span>
                <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                  {view.name2}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Photo / Monogram State */}
          <Reveal>
            <div className="flex justify-center py-2">
              {hasPhoto ? (
                <div className="relative border-b border-inv-line px-3 pb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={view.photoUrl!}
                    alt={`${view.name1} & ${view.name2}`}
                    loading="lazy"
                    onError={() => setPhotoFailed(true)}
                    className="block max-h-[280px] w-auto object-cover shadow-xs"
                  />
                </div>
              ) : (
                <div className="py-3">
                  <WaxSeal monogram={monogram} size={84} />
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* CREASE 2: Dividing Middle Panel from Bottom Flap */}
        <motion.div style={{ opacity: crease2Opacity }}>
          <CreaseDivider />
        </motion.div>

        {/* ================= PANEL 3: BOTTOM FLAP ================= */}
        <section className="space-y-8 text-center">
          {/* Date & Time */}
          <Reveal>
            <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
              {date.weekday}
            </p>
            <p className="mt-1 font-inv-display text-[3.75rem] font-semibold leading-none text-inv-accent">
              <span className="numeric">{date.day}</span>
            </p>
            <p className="mt-2 font-inv-body text-base text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>
            <p className="mt-3 font-inv-body text-sm text-inv-muted">
              {copy.labels.time} <span className="mx-1.5 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>
          </Reveal>

          {/* Venue & Location button */}
          <Reveal>
            <div className="rounded border border-inv-line/50 bg-inv-bg/60 p-5">
              <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-accent">
                {copy.labels.venue}
              </p>
              <p className="mt-1.5 font-inv-body text-lg font-medium text-inv-ink text-balance">
                {view.venueName}
              </p>
              {view.venueMapUrl ? (
                <a
                  href={view.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target press mt-4 inline-flex items-center gap-2 rounded border border-inv-accent/60 bg-inv-panel px-6 py-2.5 font-inv-body text-xs font-medium text-inv-ink transition hover:bg-inv-bg active:scale-95"
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
            </div>
          </Reveal>

          {/* Countdown */}
          <Reveal>
            <div className="py-2">
              <p className="mb-4 font-inv-body text-xs text-inv-muted">
                {copy.labels.countdownHeading[view.eventType]}
              </p>
              <ZarfCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
            </div>
          </Reveal>

          {/* Custom Message */}
          {view.customMessage ? (
            <Reveal>
              <p className="font-inv-body text-sm leading-relaxed text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Reveal>
          ) : null}

          {/* Footer with wax drip rule */}
          <Reveal>
            <WaxDripRule className="py-2" />
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inv-body text-[11px] text-inv-muted transition hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
