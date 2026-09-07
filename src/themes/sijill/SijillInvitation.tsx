'use client';

import { useState } from 'react';
import {
  PITCH,
  REGISTER_LABELS,
  LedgerTile,
  RuledSheet,
  Seal,
  entryNumber,
  registerDates,
} from './SijillOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * السجل, revealed. The axis is a RULED TABLE.
 *
 * Horizontal 1px rules run the entire width of the card on a strict 44px pitch.
 * Every line of type sits directly on a rule, as if written in an official register.
 *
 * Content is entered as rows with a fixed 92px label column and a value column.
 * The names break the label column at 2.75rem, which is the singular display moment.
 *
 * The verse row group has no label column and maintains an absolute 44px leading.
 * Photo is entered as an affixed, stamped portrait; no-photo displays the hero seal.
 */

const LABEL_COL = 'w-[92px] shrink-0 font-inv-body text-[11px] text-inv-muted';

function TableRow({
  label,
  children,
  className,
  rows = 1,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn('flex items-center border-b border-inv-line/50 px-4', className)}
      style={{ minHeight: `${rows * PITCH}px` }}
    >
      {label !== undefined ? (
        <span className={LABEL_COL}>{label}</span>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SijillCountdown({
  targetMs,
  copy,
}: {
  targetMs: number;
  copy: InvitationCopy;
}) {
  const { totalSeconds, hasPassed } = useCountdownParts(targetMs);

  if (hasPassed) {
    return <p className="font-inv-display text-sm text-inv-accent">{copy.labels.started}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col">
          <span className="numeric font-inv-display text-xl font-bold leading-none text-inv-ink">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-1 font-inv-body text-[10px] text-inv-muted leading-tight">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SijillInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const labels = REGISTER_LABELS[view.lang];
  const dates = registerDates(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);
  const entryNo = entryNumber(view.name1, view.name2, view.eventDate);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg px-3 py-10 text-inv-ink sm:px-6">
      <RuledSheet />

      <div className="relative mx-auto w-full max-w-[440px] border border-inv-line/70 bg-inv-panel shadow-sm">
        <LedgerTile />

        {/* 0. HEADER ROW: Entry number & dates */}
        <div
          className="relative z-10 flex items-center justify-between border-b border-inv-line px-4 bg-inv-panel/90"
          style={{ height: `${PITCH}px` }}
        >
          <div className="flex items-center gap-1.5 font-inv-body text-xs text-inv-muted">
            <span>{labels.entry}</span>
            <span className="numeric font-inv-display text-sm font-bold text-inv-accent">
              #{entryNo}
            </span>
          </div>

          <div className="flex items-center gap-3 font-inv-body text-xs text-inv-muted">
            {dates.hijri ? (
              <span>
                <span className="numeric">{dates.hijri}</span> {labels.hijri}
              </span>
            ) : null}
            <span>
              <span className="numeric">{dates.gregorian}</span> {labels.gregorian}
            </span>
          </div>
        </div>

        {/* 1. NAMES — breaking the label column at 2.75rem */}
        <Reveal immediate className="relative z-10">
          <div className="border-b border-inv-line px-4 py-6 text-center">
            {copy.familiesPrefix ? (
              <p className="mb-2 font-inv-body text-[11px] text-inv-muted tracking-wider">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="flex flex-col gap-3 font-inv-display text-[2.75rem] font-bold leading-none text-inv-ink">
              <span className="border-b border-inv-accent/50 pb-2">{view.name1}</span>
              <span className="border-b border-inv-accent/50 pb-2">{view.name2}</span>
            </h1>

            <p className="mt-4 font-inv-body text-[11px] text-inv-accent tracking-widest uppercase">
              {copy.eventName[view.eventType]}
            </p>
          </div>
        </Reveal>

        {/* 2. BISMILLAH + VERSE — row group with NO label column, 44px absolute pitch */}
        {copy.bismillah && copy.verse ? (
          <Reveal className="relative z-10">
            <div className="border-b border-inv-line px-5 py-6 text-center bg-inv-panel/60">
              <p
                className="font-inv-verse text-2xl text-inv-accent"
                style={{ lineHeight: `${PITCH}px` }}
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p
                className="mt-2 font-inv-verse text-[1.0625rem] text-inv-ink text-pretty"
                style={{ lineHeight: `${PITCH}px` }}
              >
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-1 font-inv-body text-[11px] text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          </Reveal>
        ) : null}

        {/* 3. POETRY */}
        <Reveal className="relative z-10">
          <TableRow label={labels.poetry} rows={2}>
            <p className="font-inv-body text-[15px] leading-relaxed text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </TableRow>
        </Reveal>

        {/* 4. INVITATION LINE */}
        <Reveal className="relative z-10">
          <div
            className="flex items-center justify-center border-b border-inv-line/50 px-4 text-center"
            style={{ minHeight: `${2 * PITCH}px` }}
          >
            <p className="font-inv-body text-[15px] leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </div>
        </Reveal>

        {/* 5. ROLES */}
        <Reveal className="relative z-10">
          <TableRow label={copy.roleGroom}>
            <span className="font-inv-body text-base font-semibold text-inv-ink">
              {view.name1}
            </span>
          </TableRow>
          <TableRow label={copy.roleBride}>
            <span className="font-inv-body text-base font-semibold text-inv-ink">
              {view.name2}
            </span>
          </TableRow>
        </Reveal>

        {/* 6. PHOTO / NO PHOTO */}
        <Reveal className="relative z-10">
          <div
            className="relative flex items-center justify-center border-b border-inv-line px-4 py-4"
            style={{ minHeight: `${3 * PITCH}px` }}
          >
            {hasPhoto ? (
              <div className="relative inline-block border border-inv-line p-1 bg-inv-bg shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.photoUrl!}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="block h-[150px] w-[112px] object-cover"
                />
                <div className="absolute -bottom-3 -end-3 h-14 w-14">
                  <Seal
                    inscription={copy.eventName[view.eventType]}
                    mark={`#${entryNo}`}
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="h-24 w-24">
                  <Seal
                    inscription={copy.eventName[view.eventType]}
                    mark={`#${entryNo}`}
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* 7. DATE */}
        <Reveal className="relative z-10">
          <TableRow label={copy.labels.date}>
            <div className="flex flex-wrap items-center gap-3 font-inv-body text-sm text-inv-ink">
              <span className="font-semibold">{dates.gregorian}</span>
              {dates.hijri ? (
                <span className="text-inv-muted">
                  ({dates.hijri} {labels.hijri})
                </span>
              ) : null}
            </div>
          </TableRow>
        </Reveal>

        {/* 8. TIME */}
        <Reveal className="relative z-10">
          <TableRow label={copy.labels.time}>
            <span className="font-inv-body text-sm text-inv-ink">
              <span className="numeric">{time.clock}</span> {time.period}
            </span>
          </TableRow>
        </Reveal>

        {/* 9. VENUE */}
        <Reveal className="relative z-10">
          <TableRow label={copy.labels.venue} rows={2}>
            <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-inv-body text-sm font-medium text-inv-ink text-balance">
                {view.venueName}
              </span>
              {view.venueMapUrl ? (
                <a
                  href={view.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center gap-1.5 self-start rounded border border-inv-accent/60 px-3 py-1 font-inv-body text-xs text-inv-accent transition hover:bg-inv-accent/10"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
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
          </TableRow>
        </Reveal>

        {/* 10. COUNTDOWN */}
        <Reveal className="relative z-10">
          <TableRow label={copy.labels.countdownHeading} rows={2}>
            <SijillCountdown targetMs={view.eventInstantMs} copy={copy} />
          </TableRow>
        </Reveal>

        {/* 11. CUSTOM MESSAGE */}
        {view.customMessage ? (
          <Reveal className="relative z-10">
            <TableRow rows={3}>
              <p className="py-2 font-inv-body text-xs leading-loose text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </TableRow>
          </Reveal>
        ) : null}

        {/* 12. FOOTER */}
        <div
          className="relative z-10 flex items-center justify-center border-t border-inv-line bg-inv-panel/90 px-4 text-center font-inv-body text-[11px] text-inv-muted"
          style={{ height: `${PITCH}px` }}
        >
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </div>
      </div>
    </div>
  );
}
