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
 * Five ivory insert cards, each at its own measure, lying on a warm grey table:
 *
 *   1. ANNOUNCEMENT  312px — prefix, names, occasion, invitation line, Bismillah, verse
 *   2. THE COUPLE    258px — the two roles, then the photo (or the blind-embossed crest)
 *   3. WHEN & WHERE  296px — weekday, day numeral, month, time, venue, map
 *   4. THE COUNT     254px — the live countdown, alone, because it is its own object
 *   5. THE MESSAGE   286px — the couple's message and their own line
 *
 * WHAT WOULD DESTROY THE AXIS: giving every card the same width, merging them into one
 * continuous panel, or dropping the hard 2px zero-blur letterpress shadow for a soft one.
 * Those three things are the theme. Everything else here is adjustable.
 *
 * MEASURES ARE A ZIGZAG, NOT A RANDOM SET. Wide / narrow / wide / narrow / wide, with no
 * two neighbours closer than 28px in width. Cards used to be pulled up 28px onto each
 * other, and with neighbours only 15px apart in width the two edges nested instead of
 * stacking — a wider card starting three pixels below a narrower one reads as a layout
 * bug, not as a dealt bundle. The cards are separated now: one object, a band of table,
 * the next object. Discrete means separate, and the letterpress shadow does the rest.
 *
 * VERTICAL RHYTHM — one scale, used everywhere, nothing off it:
 *   4 (mt-1) · 8 (mt-2) · 12 (mt-3) · 20 (mt-5) · 32 (mt-8) · 48 (mt-12, between cards)
 *
 * TYPE LADDER — 10/11 micro · 13 small · 15 body · 17 lead · 19–22 sub · 34 names ·
 * 44 the day numeral. Only the day numeral is allowed to break the step, because it is
 * the one hero on the card.
 */

/** The gap between two objects on the table, and the only gap between cards. */
const CARD_GAP = 'mt-12 flex w-full justify-center first:mt-0';

/** A hairline break inside a card. Same rhythm step top and bottom. */
const INNER_RULE = 'mt-8 border-t border-inv-line/40 pt-8';

function InsertCard({
  measure,
  index,
  children,
  className,
}: {
  /** This object's own width in px. No two neighbours are within 28px of each other. */
  measure: number;
  /** 1–5. Drawn as that many diamonds on the top rule: the object's index mark. */
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={CARD_GAP}>
      <div
        className={cn(
          'relative rounded border border-inv-line/60 bg-inv-panel px-6 pt-4 pb-12 text-center shadow-[2px_2px_0px_rgba(38,36,31,0.2)]',
          className,
        )}
        /*
          maxWidth is 100%, not a vw figure. The page already holds a 20px side margin;
          a vw cap ignores it and lets the widest card push its shadow past the padding
          on a 320px phone.
        */
        style={{ width: `${measure}px`, maxWidth: '100%' }}
      >
        <CardTopRule index={index} />
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
    return <p className="font-inv-display text-xl text-inv-accent">{copy.labels.started[eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    /* gap-1.5 rather than gap-2: at this measure the English "Seconds" needs every
       pixel of its cell, and a wrapped label in one of four cells reads as breakage. */
    <div className="grid grid-cols-4 gap-1.5 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="numeric font-inv-display text-[1.625rem] font-semibold leading-none text-inv-accent">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-2 font-inv-body text-[10px] leading-tight text-inv-muted">
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

  const hasClosingCard = Boolean(view.customMessage) || Boolean(copy.poetry);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg px-5 pt-14 pb-16 text-inv-ink flex flex-col items-center">
      {/* Table cloth texture on background only */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: COTTON_TABLE_TILE }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* ================= CARD 1: ANNOUNCEMENT (312px) ================= */}
        <InsertCard measure={312} index={1}>
          {copy.familiesPrefix ? (
            <p className="mt-1 font-inv-body text-[13px] tracking-wide text-inv-muted">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="mt-3 font-inv-display text-[2.125rem] font-bold leading-[1.25] text-inv-ink text-balance">
            <span className="block">{view.name1}</span>
            <span className="my-1 block text-[1.375rem] font-normal text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block">{view.name2}</span>
          </h1>

          <p className="mt-5 font-inv-body text-xs uppercase tracking-wider text-inv-accent">
            {copy.eventName[view.eventType]}
          </p>

          <p className="mt-3 font-inv-body text-[17px] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          {/* Bismillah + Verse */}
          {copy.bismillah && copy.verse ? (
            <div className={INNER_RULE}>
              {/* U+FDFD runs about eleven times its own font size wide. At 20px that is
                  220px inside a 264px column, and it must not be enlarged past that. */}
              <p
                className="font-inv-verse text-xl leading-none text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-5 font-inv-verse text-[17px] leading-[2] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          ) : null}
        </InsertCard>

        {/* ================= CARD 2: THE COUPLE (258px) =================
            The roles and the photo are one object. They were two cards, and the second
            of them — a 330px card holding nothing but a faint emboss — was the emptiest
            surface in the set. The crest is the FOOT of the couple's card now, which is
            what a blind emboss is for on real stationery, and it reads as a decision
            rather than as a photo that failed to load.

            Unconditional. A guard added around this card to hide the couple's line also
            hid the bride and the groom with it, so choosing "no line" took their names
            off the card entirely. The line lives at the end of the set now; this card is
            the two people, and they are never optional. */}
        <InsertCard measure={258} index={2}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
                {copy.roleGroom}
              </span>
              <p className="mt-2 font-inv-body text-[17px] font-semibold leading-snug text-inv-ink text-balance">
                {view.name1}
              </p>
            </div>
            <div>
              <span className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
                {copy.roleBride}
              </span>
              <p className="mt-2 font-inv-body text-[17px] font-semibold leading-snug text-inv-ink text-balance">
                {view.name2}
              </p>
            </div>
          </div>

          {hasPhoto ? (
            /* The photo IS the foot of the card: bled to all three edges, cancelling the
               card's own padding, so it is a print in the bundle and not an image in a
               frame. The inline margins are logical, so the bleed mirrors with the text. */
            <div className="-ms-6 -me-6 -mb-12 mt-8 overflow-hidden rounded-b">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="block h-[320px] w-full object-cover"
              />
            </div>
          ) : (
            <div className={INNER_RULE}>
              <div className="flex justify-center">
                <BlindEmbossedCrest size={148} />
              </div>
            </div>
          )}
        </InsertCard>

        {/* ================= CARD 3: WHEN & WHERE (296px) ================= */}
        <InsertCard measure={296} index={3}>
          <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
            {date.weekday}
          </p>
          {/* The one deliberate break in the type ladder. Everything around it steps:
              11 → 15 → 17 → 19 → 20, and then the day. */}
          <p className="mt-2 font-inv-display text-[2.75rem] font-bold leading-none text-inv-accent">
            <span className="numeric">{date.day}</span>
          </p>
          <p className="mt-2 font-inv-display text-xl text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
          <p className="mt-3 font-inv-body text-[15px] text-inv-muted">
            {copy.labels.time}:{' '}
            <span className="numeric text-[17px] font-semibold text-inv-ink">{time.clock}</span>{' '}
            {time.period}
          </p>

          <div className={INNER_RULE}>
            <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
              {copy.labels.venue}
            </p>
            <p className="mt-2 font-inv-body text-[19px] font-medium leading-snug text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              /* A full-width bar, not an inline pill: the Arabic label is five words and
                 tap-target alone would leave it 44px tall and 300px wide of nothing. */
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-5 flex w-full items-center justify-center gap-2 rounded border border-inv-accent/70 bg-inv-bg/50 px-4 py-3 font-inv-body text-[13px] font-semibold text-inv-ink hover:bg-inv-bg"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-inv-accent" aria-hidden="true">
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
        </InsertCard>

        {/* ================= CARD 4: THE COUNT (254px) =================
            Its own object. It used to ride along at the foot of a card that already
            carried the weekday, the day, the month, the time, the venue and the map
            button — one long card beside three cards holding a single line each, which
            is the opposite of five discrete objects. It is also the only live thing on
            the page, and a thing that ticks deserves a piece of paper of its own. */}
        <InsertCard measure={254} index={4}>
          <p className="font-inv-body text-[11px] uppercase tracking-wider text-inv-muted">
            {copy.labels.countdownHeading[view.eventType]}
          </p>
          <div className="mt-5">
            <RizmaCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
          </div>
        </InsertCard>

        {/* ================= CARD 5: THE MESSAGE (286px) =================
            The couple's message and, last of the set, their own line. Empty when they
            chose neither, and then the table simply ends after the count. */}
        {hasClosingCard ? (
          <InsertCard measure={286} index={5}>
            {view.customMessage ? (
              <p className="font-inv-body text-[15px] leading-[1.9] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            ) : null}

            {copy.poetry ? (
              <div className={view.customMessage ? INNER_RULE : ''}>
                <p className="font-inv-body text-[17px] leading-[1.9] text-inv-ink text-pretty">
                  {copy.poetry}
                </p>
              </div>
            ) : null}
          </InsertCard>
        ) : null}

        {/* ================= FOOTER: on the grey table itself =================
            Deliberate, and the only line in the theme that touches the cloth. It gets a
            short accent rule of its own so it reads as a colophon rather than as a line
            that fell off the last card, a full 48px of table above it, and a 44px box
            around the link, which it did not have. */}
        <footer className="mt-12 flex flex-col items-center">
          <span className="h-px w-10 bg-inv-accent/40" aria-hidden="true" />
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target press mt-3 inline-flex items-center justify-center px-4 font-inv-body text-xs text-inv-muted hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </footer>
      </div>
    </div>
  );
}
