'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  BobbinDivider,
  HexagonalVoid,
  LATTICE_TILE,
  LATTICE_TILE_SIZE,
  SixLobedRosette,
  TurnedGrille,
} from './MashrabiyaOrnaments';
import { useCountdownParts } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * مشربية, revealed. The axis is APERTURE.
 *
 * Content does not sit on a page; it sits in holes cut through a turned-wood lattice
 * screen. Nothing here may become a column of cards on a plain ground: the lattice must
 * stay full-bleed and visible between the voids, the voids must stay opaque holes with
 * a cut edge, and consecutive voids must keep hanging from alternating sides. Centring
 * the stack, dropping the lattice, or letting a block sit on the ground with no rim
 * would each end the theme.
 *
 * THE STAGGER. Three positions, one 28px step: a void is the column less that step, hung
 * inline-start, centred, or hung inline-end. Consecutive voids rotate through the three,
 * so no two neighbours share a side and every edge in the card is one of two values.
 * The rotation survives the optional blocks — the verse (Arabic only), the couple's
 * message and the couple's own line — because the sequence was assigned against the
 * order they actually render in.
 *
 * VERTICAL RHYTHM. One scale, and every gap on the card is a member of it:
 *   56px  between voids (gap-14) — the band of solid lattice the theme is named for
 *   28px  between the parts of a void (mt-7 / my-7)
 *   20px  between a group and what follows it (mt-5 / my-5)
 *   12px  between lines of one statement (mt-3)
 *    8px  between a label and its value (mt-2)
 *
 * TYPE SCALE. 12 / 14 / 17 / 21 / 28 / 40, then the names on top. Each tier is roughly
 * 1.25-1.4x the one below it, so nothing on the card steps from a numeral straight to a
 * caption. Arabic body copy never goes below 1.9 leading.
 *
 * MEASURE. 244px at a 360px viewport — the void less its side padding. Identical in
 * every void; only the stagger moves it.
 */

function MashrabiyaCountdown({
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
    return <p className="font-inv-display text-[21px] text-inv-accent">{copy.labels.started[eventType]}</p>;
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-1 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="numeric font-inv-display text-[28px] leading-none font-bold text-inv-accent">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-2 font-inv-body text-[12px] text-inv-muted">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MashrabiyaInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Motion signature: 0.35x scroll parallax on lattice ground
  const latticeY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden bg-inv-bg px-5 pt-12 pb-20 text-inv-ink"
    >
      {/*
        Scroll-linked full bleed turned-wood lattice layer.

        `backgroundSize` is not optional and not a tuning knob: without it the three
        gradients size themselves to the viewport and paint one ring in the corner
        instead of a screen. See the note on LATTICE_TILE_SIZE.
      */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-70 select-none will-change-transform"
        style={{
          y: latticeY,
          backgroundImage: LATTICE_TILE,
          backgroundSize: LATTICE_TILE_SIZE,
        }}
        aria-hidden="true"
      />

      {/* Main Stream of Alternating Hexagonal Aperture Voids */}
      <div className="relative z-10 mx-auto flex w-full max-w-[350px] flex-col gap-14">

        {/* 1. NAMES: centred void, the rosette as its crest */}
        <Reveal immediate>
          <HexagonalVoid align="center">
            {/*
              The rosette is over the names, not under them.

              A 180px rosette at 30% centred on inset-0 put its lobes straight through
              the couple's names — and a shape that reads through type is not a
              watermark, it is interference. Turned into a crest at the head of the
              void, it still fills the hexagonal opening the theme is built on and the
              names get their own air.
            */}
            <span className="mb-7 flex justify-center text-inv-accent-soft" aria-hidden="true">
              <SixLobedRosette size={108} />
            </span>

            {copy.familiesPrefix ? (
              <p className="mb-5 font-inv-body text-[12px] tracking-[0.16em] text-inv-muted">
                {copy.familiesPrefix}
              </p>
            ) : null}

            {/*
              The names are the one place the measure can be beaten by a single long
              word, so the size is bound to the viewport as well as capped: عبد الرحمن
              at a flat 44px is wider than the 244px measure on a 360px Android.
            */}
            <h1 className="font-inv-display text-[length:clamp(2.1rem,11.5vw,2.75rem)] leading-[1.18] font-bold text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-2 block text-[21px] font-normal text-inv-accent" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-5 font-inv-body text-[12px] tracking-[0.2em] text-inv-accent uppercase">
              {copy.eventName[view.eventType]}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 4. INVITATION LINE: inline-end hung void */}
        <Reveal>
          <HexagonalVoid align="end">
            <p className="font-inv-body text-[17px] leading-[1.9] text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 2. BISMILLAH + VERSE: inline-start hung void. The void is opaque, so the
            Qur'anic text never sits over the lattice. */}
        {copy.bismillah && copy.verse ? (
          <Reveal>
            <HexagonalVoid align="start">
              {/* U+FDFD is around eleven times wider than its font size, so it is sized
                  against the measure rather than against a fixed number. */}
              <p
                className="font-inv-verse text-[length:min(1.5rem,8cqw)] leading-[1.4] text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-7 font-inv-verse text-[17px] leading-[2] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-[12px] tracking-[0.1em] text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </HexagonalVoid>
          </Reveal>
        ) : null}

        {/* 5. ROLES: centred void, a three-bobbin run between the two people */}
        <Reveal>
          <HexagonalVoid align="center">
            <p className="font-inv-body text-[12px] tracking-[0.18em] text-inv-muted uppercase [word-spacing:0.3em]">
              {copy.roleGroom}
            </p>
            <p className="mt-2 font-inv-body text-[21px] font-bold text-inv-ink text-balance">
              {view.name1}
            </p>

            <BobbinDivider className="my-7" />

            <p className="font-inv-body text-[12px] tracking-[0.18em] text-inv-muted uppercase [word-spacing:0.3em]">
              {copy.roleBride}
            </p>
            <p className="mt-2 font-inv-body text-[21px] font-bold text-inv-ink text-balance">
              {view.name2}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 6. PHOTO: inline-end hung void. The photograph fills the opening; with no
            photograph the opening shows the screen itself. */}
        <Reveal>
          <HexagonalVoid align="end">
            {hasPhoto ? (
              <div className="overflow-hidden rounded-[20px] border-2 border-inv-accent-soft p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.photoUrl!}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="block h-[220px] w-full rounded-[16px] object-cover"
                />
              </div>
            ) : (
              <span className="flex justify-center" aria-hidden="true">
                <TurnedGrille size={150} />
              </span>
            )}
          </HexagonalVoid>
        </Reveal>

        {/* 7 & 8. DATE & TIME: inline-start hung void, one bobbin at the seam */}
        <Reveal>
          <HexagonalVoid align="start">
            <p className="font-inv-body text-[14px] tracking-[0.14em] text-inv-muted">
              {date.weekday}
            </p>
            <p className="mt-3 font-inv-display text-[40px] font-bold leading-none text-inv-accent">
              <span className="numeric">{date.day}</span>
            </p>
            <p className="mt-3 font-inv-display text-[21px] text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>

            <BobbinDivider count={1} className="my-5" />

            <p className="font-inv-body text-[14px] text-inv-muted">
              {copy.labels.time}: <span className="numeric font-semibold text-inv-ink">{time.clock}</span> {time.period}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 9. VENUE: centred void with the Maps button inside it, never over lattice */}
        <Reveal>
          <HexagonalVoid align="center">
            <p className="font-inv-body text-[12px] tracking-[0.18em] text-inv-muted uppercase">
              {copy.labels.venue}
            </p>
            <p className="mt-2 font-inv-body text-[21px] font-medium text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              /* Full measure rather than a hugging pill: موقع القاعة على الخريطة is a
                 six-word label, and a pill sized to it overruns the 204px measure of a
                 320px phone. At full width it wraps instead of overflowing. */
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-inv-accent px-4 py-3 font-inv-body text-[14px] font-semibold text-inv-accent hover:bg-inv-panel"
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
          </HexagonalVoid>
        </Reveal>

        {/* 10. COUNTDOWN: inline-end hung void */}
        <Reveal>
          <HexagonalVoid align="end">
            <p className="font-inv-body text-[12px] tracking-[0.14em] text-inv-muted">
              {copy.labels.countdownHeading[view.eventType]}
            </p>
            <div className="mt-5">
              <MashrabiyaCountdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />
            </div>
          </HexagonalVoid>
        </Reveal>

        {/* 11. MESSAGE: centred void, so the rotation still alternates when it is absent
            and the couple's own line follows the countdown directly. */}
        {view.customMessage ? (
          <Reveal>
            <HexagonalVoid align="center">
              <p className="font-inv-body text-[17px] leading-[1.9] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </HexagonalVoid>
          </Reveal>
        ) : null}

        {/* 3. THE COUPLE'S OWN LINE: inline-start hung void. Empty when they chose none. */}
        {copy.poetry ? (
          <Reveal>
            <HexagonalVoid align="start">
              <BobbinDivider className="mb-5" />
              <p className="font-inv-body text-[17px] leading-[1.9] text-inv-muted text-pretty">
                {copy.poetry}
              </p>
            </HexagonalVoid>
          </Reveal>
        ) : null}

        {/*
          12. FOOTER CREDIT: on the screen, not in a hole.

          It had a void of its own, with the same rim and the same bobbin run as the
          couple's line above it, which gave a platform credit the weight of the
          invitation. The voids are for the invitation. This is the one thing on the
          page that is not part of it, so it sits on the lattice — quiet, and still a
          44px target because it is the only other thing on the card you can tap.
        */}
        <footer className="text-center">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target press inline-flex items-center justify-center px-4 font-inv-body text-[12px] tracking-[0.08em] text-inv-muted hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </footer>
      </div>
    </div>
  );
}
