'use client';

import { useState } from 'react';
import {
  EightPetalMedallion,
  LotusPalmette,
  RunningStitchSeam,
  SteppedMerlonBorder,
} from './KhayamiyaOrnaments';
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
 */

function KhayamiyaCountdown({
  targetMs,
  copy,
}: {
  targetMs: number;
  copy: InvitationCopy;
}) {
  const [nowMs] = useState<number | null>(() => Date.now());
  const remaining = Math.max(0, targetMs - (nowMs ?? targetMs));
  const totalSeconds = Math.floor(remaining / 1000);
  const hasPassed = nowMs !== null && targetMs - nowMs <= 0;

  if (hasPassed) {
    return <p className="font-inv-display text-xl text-inv-ink">{copy.labels.started}</p>;
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
          <span className="font-inv-display text-3xl font-bold leading-none text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-1 font-inv-body text-[10px] text-inv-ink/80">
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

      {/* ================= 1. NAMES: 30vh madder field ================= */}
      <section className="relative flex min-h-[30vh] flex-col items-center justify-center bg-inv-bg px-5 py-16 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        {/* 200px Eight-Petal Medallion centered behind names at 25% opacity */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <EightPetalMedallion size={200} />
        </div>

        <Reveal immediate className="relative z-10">
          {copy.familiesPrefix ? (
            <p className="mb-3 font-inv-body text-xs text-inv-muted tracking-wider">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="font-inv-display text-4xl sm:text-5xl font-bold leading-tight text-inv-ink text-balance">
            <span className="block">{view.name1}</span>
            <span className="my-1 block text-2xl text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
            {copy.eventName[view.eventType]}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 2. BISMILLAH + VERSE: 24vh panel field (Unpatterned cloth) ================= */}
      {copy.bismillah && copy.verse ? (
        <>
          <section className="relative flex min-h-[24vh] flex-col items-center justify-center bg-inv-panel px-6 py-12 text-center">
            {/* Merlon borders explicitly suppressed on this sacred cloth */}
            <Reveal className="max-w-[420px]">
              <p
                className="font-inv-verse text-2xl text-inv-ink"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-4 font-inv-verse text-[1.0625rem] leading-[2.05] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 3. POETRY: madder field with Lotus Palmette ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-bg px-5 py-12 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className="max-w-[420px]">
          <div className="mb-4">
            <LotusPalmette size={40} />
          </div>
          <p className="font-inv-body text-lg font-medium leading-[1.9] text-inv-muted text-pretty">
            {copy.poetry}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 4. INVITATION LINE: panel field ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-panel px-5 py-10 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className="max-w-[420px]">
          <p className="font-inv-body text-[17px] leading-relaxed text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 5. ROLES: Teal cloth field ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-accent-soft px-5 py-8 text-center text-inv-ink">
        <Reveal className="w-full max-w-[400px]">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="font-inv-body text-[11px] font-bold uppercase tracking-wider text-inv-accent">
                {copy.roleGroom}
              </span>
              <p className="mt-1 font-inv-body text-xl font-bold text-inv-ink">
                {view.name1}
              </p>
            </div>
            <div>
              <span className="font-inv-body text-[11px] font-bold uppercase tracking-wider text-inv-accent">
                {copy.roleBride}
              </span>
              <p className="mt-1 font-inv-body text-xl font-bold text-inv-ink">
                {view.name2}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 6. PHOTO / NO PHOTO MEDALLION ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-bg px-5 py-12 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal>
          {hasPhoto ? (
            <div className="relative mx-auto inline-block rounded-full border-[3px] border-dashed border-inv-ink/90 p-2 bg-inv-panel shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="h-[220px] w-[220px] rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <EightPetalMedallion size={180} />
            </div>
          )}
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 7. DATE: madder field ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-bg px-5 py-14 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal>
          <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
            {date.weekday}
          </p>
          <p className="mt-2 font-inv-display text-6xl sm:text-7xl font-bold leading-none text-inv-accent">
            <span className="numeric">{date.day}</span>
          </p>
          <p className="mt-3 font-inv-display text-lg text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 8. TIME: short 64px panel field ================= */}
      <section className="relative flex h-[64px] items-center justify-center bg-inv-panel px-5 text-center">
        <Reveal>
          <p className="font-inv-body text-[17px] text-inv-ink">
            {copy.labels.time}: <span className="numeric font-semibold">{time.clock}</span> {time.period}
          </p>
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 9. VENUE: panel field with Maps button ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-panel px-5 py-12 text-center">
        <SteppedMerlonBorder side="left" />
        <SteppedMerlonBorder side="right" />

        <Reveal className="max-w-[400px]">
          <p className="font-inv-body text-xs uppercase tracking-wider text-inv-accent">
            {copy.labels.venue}
          </p>
          <p className="mt-2 font-inv-body text-xl font-semibold text-inv-ink text-balance">
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press mt-6 inline-flex items-center gap-2 rounded bg-inv-accent px-8 py-3 font-inv-body text-sm font-bold text-inv-bg shadow-sm transition hover:brightness-105 active:scale-95"
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
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 10. COUNTDOWN: Teal cloth field ================= */}
      <section className="relative flex flex-col items-center justify-center bg-inv-accent-soft px-5 py-10 text-center">
        <Reveal className="w-full max-w-[420px]">
          <p className="mb-4 font-inv-body text-xs text-inv-ink/90 font-medium">
            {copy.labels.countdownHeading}
          </p>
          <KhayamiyaCountdown targetMs={view.eventInstantMs} copy={copy} />
        </Reveal>
      </section>

      <RunningStitchSeam />

      {/* ================= 11. MESSAGE: madder field ================= */}
      {view.customMessage ? (
        <>
          <section className="relative flex flex-col items-center justify-center bg-inv-bg px-6 py-10 text-center">
            <SteppedMerlonBorder side="left" />
            <SteppedMerlonBorder side="right" />
            <Reveal className="max-w-[420px]">
              <p className="font-inv-body text-base leading-relaxed text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Reveal>
          </section>
          <RunningStitchSeam />
        </>
      ) : null}

      {/* ================= 12. FOOTER: short panel field ================= */}
      <footer className="relative flex h-[72px] items-center justify-center bg-inv-panel px-5 text-center">
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-inv-body text-xs text-inv-muted transition hover:text-inv-accent"
        >
          {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
        </a>
      </footer>
    </div>
  );
}
