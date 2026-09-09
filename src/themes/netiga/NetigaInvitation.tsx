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
 * Uniform bound leaves at one 342px measure sitting on a board, torn top edge, red
 * binding band. The three rules that hold the pad together, and that a change here
 * must not break:
 *
 * 1. ONE MEASURE. Every leaf is `max-w-[342px]` and every leaf pads its content by
 *    `p-5`, so the text edge of the names, the verse, the venue and the footer all
 *    land on the same line. Per-leaf padding would destroy the pad.
 * 2. EVERY LEAF IS BANDED AND NUMBERED — one exception, stated. The verse leaf alone
 *    carries no band and no number, because sacred text is not dated furniture. That
 *    single exception is the rule; a band that appears on some other leaves and not
 *    on others is what makes a pad read as an accident. Numbers run consecutively
 *    from a counter, so a card without a photo or without a message still counts
 *    1, 2, 3 rather than showing a gap where a leaf was not rendered.
 * 3. ONE VERTICAL RHYTHM: 32px between leaves (LEAF_RHYTHM below), 40-48px of bare
 *    board above the first leaf and below the last. Nothing else sets a section gap.
 *
 * Centring the leaves' contents on a common axis, flattening them into a single
 * scroll, or dropping the band would each erase the pad.
 */

/**
 * The pad's rhythm, in one place.
 *
 * `gap-8` on the leaf column is the ONLY thing that separates two leaves; the torn
 * edge eats 14px of it, so 32px leaves 18px of visible board. Leaves carry no margins
 * of their own — that is what keeps the pitch even when a leaf is conditional.
 */
const LEAF_RHYTHM = 'flex w-full max-w-[342px] flex-col items-center gap-8';

function Leaf({
  slot,
  headerTitle,
  indexLabel,
  bare = false,
  children,
}: {
  /** Position in the pad. Drives the alternating tilt only. */
  slot: number;
  headerTitle?: string;
  /** The leaf's number, already in the card's digits. Omitted only on the verse leaf. */
  indexLabel?: string;
  /** The verse leaf: no band, no number. */
  bare?: boolean;
  children: React.ReactNode;
}) {
  // Alternating slight 0.35° tilt, so the pad reads as hand-torn rather than printed.
  const tilt = slot % 2 === 0 ? 'rotate-[0.35deg]' : '-rotate-[0.35deg]';

  return (
    <Reveal className={cn('relative w-full max-w-[342px]', tilt)}>
      <div className="relative rounded-sm border border-inv-line/50 bg-inv-panel shadow-md">
        <TornEdge className="absolute -top-3.5 inset-x-0" />

        {bare ? (
          <div className="h-3" />
        ) : (
          <CalendarHeaderBand title={headerTitle} index={indexLabel} />
        )}

        <div className="p-5">{children}</div>
      </div>
    </Reveal>
  );
}

function NetigaCountdown({
  targetMs,
  copy,
  eventType,
  lang,
  large = false,
}: {
  targetMs: number;
  copy: InvitationCopy;
  /** The line this draws when the count runs out names the occasion. */
  eventType: InvitationView['eventType'];
  lang: InvitationView['lang'];
  large?: boolean;
}) {
  const { totalSeconds, hasPassed } = useCountdownParts(targetMs);

  if (hasPassed) {
    return (
      <p className="text-center font-inv-display text-xl leading-snug text-inv-accent">
        {copy.labels.started[eventType]}
      </p>
    );
  }

  /*
   * Days are NOT zero padded. The clock fields are, because ٠٨ is how a clock is read;
   * a padded day count is not, and ٠٥ يوم sets the Arabic-Indic zero as a low dot that
   * a guest reads as punctuation.
   */
  const cells = [
    { value: String(Math.floor(totalSeconds / 86400)), label: copy.labels.countdownDays },
    {
      value: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'),
      label: copy.labels.countdownHours,
    },
    {
      value: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
      label: copy.labels.countdownMinutes,
    },
    { value: String(totalSeconds % 60).padStart(2, '0'), label: copy.labels.countdownSeconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span
            className={cn(
              'numeric font-inv-display font-black leading-none text-inv-accent',
              large ? 'text-[2.25rem]' : 'text-2xl',
            )}
          >
            {formatNetigaDigits(cell.value, lang)}
          </span>
          <span className="mt-2 font-inv-body text-xs leading-normal text-inv-muted">
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
  const digits = (value: string) => formatNetigaDigits(value, view.lang);

  /*
   * Two counters, advanced as the leaves are created.
   *
   * `slot` counts every leaf and only drives the alternating tilt. `numbered` is what
   * the guest sees in the band, and it skips the verse leaf, so the visible sequence
   * has no hole in it whether or not this card has a verse, a photo, a message or a
   * line from the couple. React creates elements in source order within one render
   * pass, so both are deterministic and match between server and client.
   */
  let slot = 0;
  let numbered = 0;
  const nextSlot = () => (slot += 1);
  const nextNumber = () => digits(String((numbered += 1)));

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-inv-bg px-4 pt-6 pb-10 text-inv-ink">
      {/* Background board texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ backgroundImage: PULP_BOARD_TILE }}
        aria-hidden="true"
      />

      {/* Top hanger board nail hole */}
      <div className="relative z-10 mb-6 flex flex-col items-center">
        <div className="h-4 w-4 rounded-full border-2 border-inv-line/80 bg-inv-ink/20 shadow-inner" />
        <div className="h-2 w-0.5 bg-inv-line/60" />
      </div>

      <div className={cn('relative z-10', LEAF_RHYTHM)}>
        {/* LEAF 1: NAMES. The band carries the occasion — the masthead a guest reads. */}
        <Leaf
          slot={nextSlot()}
          indexLabel={nextNumber()}
          headerTitle={copy.eventName[view.eventType]}
        >
          <div className="text-center">
            {copy.familiesPrefix ? (
              <p className="mb-4 font-inv-body text-[0.8125rem] leading-relaxed text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="font-inv-display text-[2.5rem] font-bold leading-[1.2] text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-1 block text-xl font-normal text-inv-accent" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>
          </div>
        </Leaf>

        {/* LEAF 2: INVITATION LINE */}
        <Leaf slot={nextSlot()} indexLabel={nextNumber()}>
          <p className="text-center font-inv-body text-[0.9375rem] leading-[1.9] text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </Leaf>

        {/* LEAF 3: BISMILLAH + VERSE. The one leaf that is not dated furniture. */}
        {copy.bismillah && copy.verse ? (
          <Leaf slot={nextSlot()} bare>
            <div className="text-center">
              {/*
                U+FDFD is around eleven times wider than its font size, so it is capped
                against the viewport as well as set in rem — at 342px of leaf the plain
                2.375rem the spec asks for is 200px wider than the measure.
              */}
              <p
                className="font-inv-verse text-[length:min(1.4375rem,5.75vw)] leading-none text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>

              <p className="mt-6 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
                {copy.verse}
              </p>

              {copy.verseSource ? (
                <p className="mt-4 font-inv-body text-xs leading-relaxed text-inv-muted">
                  {digits(copy.verseSource)}
                </p>
              ) : null}
            </div>
          </Leaf>
        ) : null}

        {/* LEAF 5: PHOTO, or the loud second date leaf when there is none. */}
        {hasPhoto ? (
          <Leaf slot={nextSlot()} indexLabel={nextNumber()}>
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
          <Leaf
            slot={nextSlot()}
            indexLabel={nextNumber()}
            headerTitle={copy.labels.countdownHeading[view.eventType]}
          >
            <NetigaCountdown
              targetMs={view.eventInstantMs}
              copy={copy}
              eventType={view.eventType}
              lang={view.lang}
              large
            />
          </Leaf>
        )}

        {/* LEAF 6: THE HERO DATE LEAF. The only place besides the bands that is red. */}
        <Leaf slot={nextSlot()} indexLabel={nextNumber()} headerTitle={date.weekday}>
          <div className="flex flex-col items-center text-center">
            <span className="numeric font-inv-display text-[9.5rem] font-black leading-none text-inv-accent select-none">
              {digits(date.day)}
            </span>

            {/* The step down off the hero: 152px, then 28, then 20, then the 13px band. */}
            <p className="mt-3 font-inv-display text-[1.75rem] font-bold leading-snug text-inv-ink">
              {date.month}{' '}
              <span className="numeric text-xl font-normal text-inv-muted">
                {digits(date.year)}
              </span>
            </p>
          </div>
        </Leaf>

        {/* LEAF 7: TIME. The label lives in the band, which leaves the leaf to set the
            clock at a size worth a page of the pad. */}
        <Leaf slot={nextSlot()} indexLabel={nextNumber()} headerTitle={copy.labels.time}>
          <div className="text-center">
            <p className="numeric font-inv-display text-[2rem] font-bold leading-none text-inv-ink">
              {digits(time.clock)}
            </p>
            <p className="mt-2 font-inv-body text-[0.9375rem] leading-relaxed text-inv-muted">
              {time.period}
            </p>
          </div>
        </Leaf>

        {/* LEAF 8: VENUE */}
        <Leaf slot={nextSlot()} indexLabel={nextNumber()} headerTitle={copy.labels.venue}>
          <div className="text-center">
            <p className="font-inv-body text-xl font-semibold leading-snug text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-inv-accent px-4 py-3 font-inv-body text-[0.8125rem] font-semibold text-white shadow-xs hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
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

        {/* LEAF 9: COUNTDOWN, when the photo took the loud leaf above. */}
        {hasPhoto ? (
          <Leaf
            slot={nextSlot()}
            indexLabel={nextNumber()}
            headerTitle={copy.labels.countdownHeading[view.eventType]}
          >
            <NetigaCountdown
              targetMs={view.eventInstantMs}
              copy={copy}
              eventType={view.eventType}
              lang={view.lang}
            />
          </Leaf>
        ) : null}

        {/* LEAF 10: MESSAGE */}
        {view.customMessage ? (
          <Leaf slot={nextSlot()} indexLabel={nextNumber()}>
            <p className="text-center font-inv-body text-[0.9375rem] leading-[1.9] text-inv-muted text-pretty">
              {view.customMessage}
            </p>
          </Leaf>
        ) : null}

        {/* LEAF 11: THE COUPLE'S OWN LINE. Empty when they chose none. */}
        {copy.poetry ? (
          <Leaf slot={nextSlot()} indexLabel={nextNumber()}>
            <p className="text-center font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </Leaf>
        ) : null}

        {/* LEAF 12: FOOTER. The credit is a link, so it is a thumb-sized one. */}
        <Leaf slot={nextSlot()} indexLabel={nextNumber()}>
          <div className="text-center">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press inline-flex items-center justify-center rounded-sm px-4 font-inv-body text-xs leading-relaxed text-inv-muted hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </div>
        </Leaf>
      </div>
    </div>
  );
}
