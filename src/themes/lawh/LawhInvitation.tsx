'use client';

import { useState } from 'react';
import {
  CHAMFER_STYLE,
  CUT_BEVEL_CLASS,
  Cartouche,
  LIMESTONE_TILE,
  RECESSED_STYLE,
} from './LawhOrnaments';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * اللوح, revealed. The axis is MONOLITH.
 *
 * ZERO SECTION BREAKS: no dividers, no rules, no panels, no lines between paragraphs.
 * Hierarchy is established purely through scale, font weight and vertical interval.
 * Inscribed with cut-into-stone bevels onto a single monolithic limestone slab.
 */

function LawhCountdown({
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
    return <p className="font-inv-display text-lg text-inv-accent">{copy.labels.started}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div className="flex flex-wrap items-baseline justify-start gap-4">
      {cells.map((cell) => (
        <span key={cell.label} className="inline-flex items-baseline gap-1 font-inv-display">
          <span className="numeric text-2xl font-bold text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="font-inv-body text-xs text-inv-muted">
            {cell.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function LawhInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);
  const initials = `${view.name1[0] || ''} · ${view.name2[0] || ''}`;

  // Hard-cap message at 260 characters per spec to prevent text wall on monolith
  const customMessage = view.customMessage ? view.customMessage.slice(0, 260) : null;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg p-4 sm:p-8 text-inv-ink flex justify-center">
      {/* Stone slab with 3px chamfered edge */}
      <div
        className="relative w-full max-w-[440px] rounded-lg bg-inv-panel px-6 py-14 shadow-sm"
        style={CHAMFER_STYLE}
      >
        {/* Limestone tooth texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: LIMESTONE_TILE }}
          aria-hidden="true"
        />

        {/* The single 20rem / 320px text measure, start-aligned */}
        <div className="relative z-10 mx-auto w-full max-w-[20rem] text-start">

          {/* 1. NAMES — 3.25rem with bevel, 40px below */}
          <Reveal immediate className="mb-10">
            {copy.familiesPrefix ? (
              <p className="mb-3 font-inv-body text-xs tracking-wider text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1
              className={cn(
                'font-inv-display text-[3.25rem] font-bold leading-[1.15] text-inv-ink text-balance',
                CUT_BEVEL_CLASS,
              )}
            >
              <span className="block">{view.name1}</span>
              <span className="my-1.5 block text-2xl text-inv-accent font-normal" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-3 font-inv-body text-xs uppercase tracking-widest text-inv-accent font-medium">
              {copy.eventName[view.eventType]}
            </p>
          </Reveal>

          {/* 2. BISMILLAH + VERSE — 96px of air above and below, NO bevel */}
          {copy.bismillah && copy.verse ? (
            <Reveal className="my-24">
              <p
                className="font-inv-verse text-2xl text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-4 font-inv-verse text-[1.125rem] leading-[2.05] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </Reveal>
          ) : null}

          {/* 3. POETRY — Markazi Text at 1.1875rem muted, 24px below */}
          <Reveal className="mb-6">
            <p className="font-inv-body text-[1.1875rem] leading-[1.8] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </Reveal>

          {/* 4. INVITATION LINE — 1.375rem with bevel, 40px below */}
          <Reveal className="mb-10">
            <p
              className={cn(
                'font-inv-body text-[1.375rem] leading-snug font-medium text-inv-ink text-pretty',
                CUT_BEVEL_CLASS,
              )}
            >
              {copy.inviteLine[view.eventType]}
            </p>
          </Reveal>

          {/* 5. ROLES — 1.0625rem, inline labels in muted before each name, 16px intervals */}
          <Reveal className="mb-10 space-y-4">
            <div>
              <span className="font-inv-body text-[1.0625rem] text-inv-muted me-2">
                {copy.roleGroom}:
              </span>
              <span className="font-inv-body text-[1.0625rem] font-bold text-inv-ink">
                {view.name1}
              </span>
            </div>
            <div>
              <span className="font-inv-body text-[1.0625rem] text-inv-muted me-2">
                {copy.roleBride}:
              </span>
              <span className="font-inv-body text-[1.0625rem] font-bold text-inv-ink">
                {view.name2}
              </span>
            </div>
          </Reveal>

          {/* 6. PHOTO / NO PHOTO — Recessed Panel with inverse chamfer */}
          <Reveal className="mb-10">
            <div
              className="relative flex items-center justify-center rounded p-4 bg-inv-panel/60"
              style={RECESSED_STYLE}
            >
              {hasPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={view.photoUrl!}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="max-h-[260px] w-auto rounded object-cover"
                />
              ) : (
                <div className="py-6">
                  <Cartouche initials={initials} size={130} />
                </div>
              )}
            </div>
          </Reveal>

          {/* 7 & 8. DATE & TIME — day numeral at 2.75rem with bevel */}
          <Reveal className="mb-10 space-y-2">
            <div>
              <span className="font-inv-body text-[1.0625rem] text-inv-muted me-2">
                {date.weekday},
              </span>
              <span className="font-inv-body text-[1.0625rem] text-inv-ink font-semibold">
                {date.month} {date.year}
              </span>
            </div>

            <p
              className={cn(
                'font-inv-display text-[2.75rem] font-bold leading-none text-inv-accent',
                CUT_BEVEL_CLASS,
              )}
            >
              <span className="numeric">{date.day}</span>
            </p>

            <p className="font-inv-body text-[1.0625rem] text-inv-muted pt-2">
              {copy.labels.time}: <span className="numeric font-semibold text-inv-ink">{time.clock}</span> {time.period}
            </p>
          </Reveal>

          {/* 9. VENUE — 1.1875rem ink, chamfered 44px Maps bar */}
          <Reveal className="mb-10">
            <p className="font-inv-body text-xs text-inv-muted uppercase tracking-wider mb-1">
              {copy.labels.venue}
            </p>
            <p className="font-inv-body text-[1.1875rem] font-semibold text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-4 inline-flex items-center gap-2 rounded bg-inv-accent px-6 py-2.5 font-inv-body text-xs font-semibold text-inv-panel transition hover:opacity-95 active:scale-95"
                style={CHAMFER_STYLE}
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

          {/* 10. COUNTDOWN — 4 values inline, no cells, 24px above and below */}
          <Reveal className="my-8">
            <p className="font-inv-body text-xs text-inv-muted mb-2">
              {copy.labels.countdownHeading}
            </p>
            <LawhCountdown targetMs={view.eventInstantMs} copy={copy} />
          </Reveal>

          {/* 11. MESSAGE — 1.0625rem, hard-capped at 260 chars */}
          {customMessage ? (
            <Reveal className="mb-10">
              <p className="font-inv-body text-[1.0625rem] leading-relaxed text-inv-muted text-pretty">
                {customMessage}
              </p>
            </Reveal>
          ) : null}

          {/* 12. FOOTER — 0.8125rem muted, 40px below */}
          <footer className="mt-12 pt-4">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inv-body text-[0.8125rem] text-inv-muted transition hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
