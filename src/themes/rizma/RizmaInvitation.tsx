'use client';

import { useState } from 'react';
import {
  BlindEmbossedCrest,
  COTTON_TABLE_TILE,
  CardTopRule,
} from './RizmaOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * الرزمة, revealed. The axis is DISCRETE OBJECTS.
 *
 * Five ivory insert cards sitting at five different measures on a warm grey table:
 * 1. Announcement Card (300px)
 * 2. Invitation Card (286px)
 * 3. Photo / Embossed Crest Card
 * 4. Details Card (306px)
 * 5. Message Card (272px)
 *
 * Cards overlap by 28px and carry authentic 2px letterpress offset shadows with zero blur.
 */

function InsertCard({
  measure,
  children,
  className,
}: {
  measure: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className="w-full flex justify-center -mt-7 first:mt-0">
      <div
        className={cn(
          /*
            Bottom padding is deeper than the overlap on purpose.

            The cards are pulled up 28px to sit on each other the way a stack of inserts
            does, but the padding was an even 24px all round — so every card landed its
            top edge and its rule 4px inside the last card's text, and the seam cut
            through the verse and the roles. The overlap has to fall on padding, never on
            a line of type, so the foot of each card is now deeper than the pull.
          */
          'relative rounded border border-inv-line/60 bg-inv-panel px-6 pt-6 pb-11 text-center shadow-[2px_2px_0px_rgba(38,36,31,0.2)]',
          className,
        )}
        style={{ width: `${measure}px`, maxWidth: '92vw' }}
      >
        <CardTopRule />
        {children}
      </div>
    </Reveal>
  );
}

function RizmaCountdown({
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
    return <p className="font-inv-display text-lg text-inv-accent">{copy.labels.started[eventType]}</p>;
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
          <span className="font-inv-display text-2xl font-semibold leading-none text-inv-accent">
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

export function RizmaInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg px-4 py-16 text-inv-ink flex flex-col items-center">
      {/* Table cloth texture on background only */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: COTTON_TABLE_TILE }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* ================= CARD 1: ANNOUNCEMENT (300px) ================= */}
        <InsertCard measure={300}>
          {copy.familiesPrefix ? (
            <p className="mt-2 font-inv-body text-xs text-inv-muted tracking-wide">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="mt-3 font-inv-display text-4xl font-bold leading-tight text-inv-ink text-balance">
            <span className="block">{view.name1}</span>
            <span className="my-1.5 block text-xl text-inv-accent font-normal" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
            {copy.eventName[view.eventType]}
          </p>

          {/* Bismillah + Verse */}
          {copy.bismillah && copy.verse ? (
            <div className="mt-6 border-t border-inv-line/40 pt-5">
              <p
                className="font-inv-verse text-xl text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-3 font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          ) : null}
        </InsertCard>

        {/* ================= CARD 2: INVITATION (286px) ================= */}
        {/* Empty when the couple chose no line. */}
        {copy.poetry ? (
          <InsertCard measure={286}>
            <p className="font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
  
            <p className="mt-5 font-inv-body text-[15px] leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
  
            {/* Roles */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-inv-line/40 pt-4">
              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                  {copy.roleGroom}
                </span>
                <p className="mt-1 font-inv-body text-base font-bold text-inv-ink">
                  {view.name1}
                </p>
              </div>
              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                  {copy.roleBride}
                </span>
                <p className="mt-1 font-inv-body text-base font-bold text-inv-ink">
                  {view.name2}
                </p>
              </div>
            </div>
          </InsertCard>
        ) : null}

        {/* ================= CARD 3: PHOTO / CREST CARD ================= */}
        {hasPhoto ? (
          <Reveal className="w-full flex justify-center -mt-7">
            <div className="relative rounded overflow-hidden border border-inv-line/60 bg-inv-panel p-1.5 shadow-[2px_2px_0px_rgba(38,36,31,0.2)] max-w-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="block max-h-[300px] w-auto rounded object-cover"
              />
            </div>
          </Reveal>
        ) : (
          /* NO PHOTO: THE FLAGSHIP CREST CARD — blind-emboss with 90px air */
          <InsertCard measure={286} className="py-16">
            <div className="flex flex-col items-center justify-center py-6">
              <BlindEmbossedCrest size={140} />
            </div>
          </InsertCard>
        )}

        {/* ================= CARD 4: DETAILS (306px) ================= */}
        <InsertCard measure={306}>
          <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
            {date.weekday}
          </p>
          <p className="mt-1 font-inv-display text-5xl font-bold leading-none text-inv-accent">
            <span className="numeric">{date.day}</span>
          </p>
          <p className="mt-2 font-inv-display text-base text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
          <p className="mt-2 font-inv-body text-sm text-inv-muted">
            {copy.labels.time}: <span className="numeric font-semibold">{time.clock}</span> {time.period}
          </p>

          <div className="my-5 border-t border-inv-line/40 pt-4">
            <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
              {copy.labels.venue}
            </p>
            <p className="mt-1 font-inv-body text-lg font-medium text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-4 inline-flex items-center gap-2 rounded border border-inv-accent/70 bg-inv-bg/40 px-6 py-2.5 font-inv-body text-xs font-semibold text-inv-ink transition hover:bg-inv-panel active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-inv-accent" aria-hidden="true">
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

          <div className="border-t border-inv-line/40 pt-4">
            <p className="mb-3 font-inv-body text-xs text-inv-muted">
              {copy.labels.countdownHeading[view.eventType]}
            </p>
            <RizmaCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
          </div>
        </InsertCard>

        {/* ================= CARD 5: MESSAGE (272px) ================= */}
        {view.customMessage ? (
          <InsertCard measure={272}>
            <p className="font-inv-body text-sm leading-relaxed text-inv-muted text-pretty">
              {view.customMessage}
            </p>
          </InsertCard>
        ) : null}

        {/* ================= FOOTER: sitting on the grey table itself ================= */}
        <footer className="mt-12 text-center">
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
    </div>
  );
}
