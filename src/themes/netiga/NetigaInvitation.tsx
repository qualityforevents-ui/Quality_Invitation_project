'use client';

import { useState } from 'react';
import {
  CalendarHeaderBand,
  PULP_BOARD_TILE,
  TornEdge,
  formatNetigaDigits,
} from './NetigaOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * النتيجة, revealed. The axis is DATED LEAVES.
 *
 * Uniform bound leaves at 342px measure sitting on a board.
 * Every leaf is dated furniture carrying a header band and secondary index,
 * except the verse leaf which stands alone as un-numbered sacred text.
 * All numerals consistently formatted with Arabic-Indic digits for Arabic cards.
 */

function Leaf({
  index,
  headerTitle,
  secondaryNumber,
  children,
  className,
}: {
  index: number;
  headerTitle?: string;
  secondaryNumber?: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Alternating slight 0.4° tilt
  const tilt = index % 2 === 0 ? 'rotate-[0.35deg]' : '-rotate-[0.35deg]';

  return (
    <Reveal className={cn('relative my-6 w-full max-w-[342px]', tilt, className)}>
      <div className="relative rounded-sm border border-inv-line/50 bg-inv-panel shadow-md">
        <TornEdge className="absolute -top-3.5 inset-x-0" />
        {headerTitle ? (
          <CalendarHeaderBand title={headerTitle} />
        ) : (
          <div className="h-3" />
        )}

        <div className="relative p-5">
          {secondaryNumber ? (
            <span className="absolute top-2 start-3 font-inv-body text-[10px] text-inv-muted/70">
              {secondaryNumber}
            </span>
          ) : null}
          {children}
        </div>
      </div>
    </Reveal>
  );
}

function NetigaCountdown({
  targetMs,
  copy,
  lang,
  large = false,
}: {
  targetMs: number;
  copy: InvitationCopy;
  lang: InvitationView['lang'];
  large?: boolean;
}) {
  const { totalSeconds, hasPassed } = useCountdownParts(targetMs);

  if (hasPassed) {
    return <p className="font-inv-display text-xl text-inv-accent">{copy.labels.started}</p>;
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
        <div key={cell.label} className="flex flex-col items-center">
          <span
            className={cn(
              'font-inv-display font-black leading-none text-inv-accent',
              large ? 'text-4xl' : 'text-2xl',
            )}
          >
            {formatNetigaDigits(cell.value.toString().padStart(2, '0'), lang)}
          </span>
          <span className="mt-1 font-inv-body text-[10px] text-inv-muted leading-tight">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function NetigaInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg px-4 py-12 text-inv-ink flex flex-col items-center">
      {/* Background board texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: PULP_BOARD_TILE }}
        aria-hidden="true"
      />

      {/* Top hanger board nail hole */}
      <div className="relative z-10 mb-4 flex flex-col items-center">
        <div className="h-4 w-4 rounded-full border-2 border-inv-line/80 bg-inv-ink/20 shadow-inner" />
        <div className="h-2 w-0.5 bg-inv-line/60" />
      </div>

      <div className="relative z-10 w-full max-w-[342px] flex flex-col items-center">
        {/* LEAF 1: NAMES */}
        <Leaf
          index={1}
          headerTitle={view.lang === 'AR' ? 'الأسماء' : 'The Couple'}
          secondaryNumber={formatNetigaDigits('01', view.lang)}
        >
          <div className="text-center pt-2 pb-1">
            {copy.familiesPrefix ? (
              <p className="mb-2 font-inv-body text-[11px] tracking-wide text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="font-inv-display text-[2.5rem] font-bold leading-tight text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-1 block text-lg text-inv-accent font-normal" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-3 font-inv-body text-xs text-inv-muted tracking-wider uppercase">
              {copy.eventName[view.eventType]}
            </p>
          </div>
        </Leaf>

        {/* LEAF 2: BISMILLAH + VERSE (Dedicated UN-NUMBERED leaf, sacred text) */}
        {copy.bismillah && copy.verse ? (
          <Leaf index={2}>
            <div className="text-center py-2">
              <p
                className="font-inv-verse text-2xl text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-4 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          </Leaf>
        ) : null}

        {/* LEAF 3: POETRY */}
        <Leaf index={3} secondaryNumber={formatNetigaDigits('03', view.lang)}>
          <p className="text-center font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
            {copy.poetry}
          </p>
        </Leaf>

        {/* LEAF 4: INVITATION LINE */}
        <Leaf index={4} secondaryNumber={formatNetigaDigits('04', view.lang)}>
          <p className="text-center font-inv-body text-[15px] leading-relaxed text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Leaf>

        {/* LEAF 5: ROLES */}
        <Leaf
          index={5}
          headerTitle={view.lang === 'AR' ? 'العريس والعروس' : 'The Wedding Party'}
          secondaryNumber={formatNetigaDigits('05', view.lang)}
        >
          <div className="grid grid-cols-2 gap-4 text-center py-1">
            <div>
              <span className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
                {copy.roleGroom}
              </span>
              <p className="mt-1 font-inv-body text-base font-bold text-inv-ink">
                {view.name1}
              </p>
            </div>
            <div>
              <span className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
                {copy.roleBride}
              </span>
              <p className="mt-1 font-inv-body text-base font-bold text-inv-ink">
                {view.name2}
              </p>
            </div>
          </div>
        </Leaf>

        {/* LEAF 6: PHOTO or SECOND DATE LEAF (COUNTDOWN FLAGSHIP) */}
        {hasPhoto ? (
          <Leaf
            index={6}
            secondaryNumber={formatNetigaDigits('06', view.lang)}
          >
            <div className="relative mx-auto max-w-[240px] rotate-2 rounded border border-inv-line/40 bg-white p-2.5 shadow-sm">
              {/* Corner photo mounting triangles */}
              <span className="absolute -top-1 -start-1 h-4 w-4 border-t-2 border-s-2 border-inv-accent-soft" />
              <span className="absolute -bottom-1 -end-1 h-4 w-4 border-b-2 border-e-2 border-inv-accent-soft" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="block w-full object-cover"
                style={{ aspectRatio: '1 / 1' }}
              />
            </div>
          </Leaf>
        ) : (
          /* NO PHOTO: Second date leaf with loud countdown */
          <Leaf
            index={6}
            headerTitle={copy.labels.countdownHeading}
            secondaryNumber={formatNetigaDigits('06', view.lang)}
          >
            <div className="py-2">
              <NetigaCountdown targetMs={view.eventInstantMs} copy={copy} lang={view.lang} large />
            </div>
          </Leaf>
        )}

        {/* LEAF 7: THE HERO DATE LEAF */}
        <Leaf
          index={7}
          headerTitle={date.weekday}
          secondaryNumber={formatNetigaDigits('07', view.lang)}
        >
          <div className="flex flex-col items-center justify-center py-2 text-center">
            {/* 180px day numeral */}
            <span className="font-inv-display text-[9.5rem] font-black leading-none text-inv-accent select-none">
              {formatNetigaDigits(date.day, view.lang)}
            </span>

            <p className="mt-2 font-inv-display text-lg font-bold text-inv-ink">
              {date.month} <span>{formatNetigaDigits(date.year, view.lang)}</span>
            </p>
          </div>
        </Leaf>

        {/* LEAF 8: TIME */}
        <Leaf index={8} secondaryNumber={formatNetigaDigits('08', view.lang)}>
          <div className="flex items-center justify-center gap-2 text-center font-inv-body text-base text-inv-ink">
            <span className="text-xs text-inv-muted">{copy.labels.time}:</span>
            <span className="font-semibold">
              {formatNetigaDigits(time.clock, view.lang)}
            </span>
            <span>{time.period}</span>
          </div>
        </Leaf>

        {/* LEAF 9: VENUE */}
        <Leaf
          index={9}
          headerTitle={copy.labels.venue}
          secondaryNumber={formatNetigaDigits('09', view.lang)}
        >
          <div className="text-center py-1">
            <p className="font-inv-body text-base font-semibold text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-inv-accent px-4 py-2.5 font-inv-body text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
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
          </div>
        </Leaf>

        {/* LEAF 10: COUNTDOWN (rendered if photo was present above) */}
        {hasPhoto ? (
          <Leaf
            index={10}
            headerTitle={copy.labels.countdownHeading}
            secondaryNumber={formatNetigaDigits('10', view.lang)}
          >
            <div className="py-2">
              <NetigaCountdown targetMs={view.eventInstantMs} copy={copy} lang={view.lang} />
            </div>
          </Leaf>
        ) : null}

        {/* LEAF 11: MESSAGE */}
        {view.customMessage ? (
          <Leaf index={11} secondaryNumber={formatNetigaDigits('11', view.lang)}>
            <p className="text-center font-inv-body text-sm leading-relaxed text-inv-muted text-pretty">
              {view.customMessage}
            </p>
          </Leaf>
        ) : null}

        {/* LEAF 12: FOOTER */}
        <Leaf index={12}>
          <div className="text-center">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inv-body text-xs text-inv-muted transition hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </div>
        </Leaf>
      </div>
    </div>
  );
}
