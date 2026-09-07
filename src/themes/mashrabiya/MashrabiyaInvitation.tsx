'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  BobbinDivider,
  HexagonalVoid,
  LATTICE_TILE,
  SixLobedRosette,
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
 * Content does not sit on a page; it sits in holes cut through a turned-wood lattice screen.
 * Consecutive voids alternate which side they hang from (center -> start -> end -> center).
 * The usable measure inside each hexagonal void is 244px.
 * The lattice ground parallaxes at 0.35x on scroll.
 */

function MashrabiyaCountdown({
  targetMs,
  copy,
}: {
  targetMs: number;
  copy: InvitationCopy;
}) {
  const { totalSeconds, hasPassed } = useCountdownParts(targetMs);

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
    <div className="grid grid-cols-4 gap-2 text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center">
          <span className="font-inv-display text-2xl font-bold leading-none text-inv-accent">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-1 font-inv-body text-[9px] text-inv-muted">
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
      className="relative min-h-dvh overflow-hidden bg-inv-bg text-inv-ink px-3 py-16"
    >
      {/* Scroll-linked full bleed turned-wood lattice layer */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 select-none will-change-transform"
        style={{
          y: latticeY,
          backgroundImage: LATTICE_TILE,
        }}
        aria-hidden="true"
      />

      {/* Main Stream of Alternating Hexagonal Aperture Voids */}
      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col">

        {/* 1. NAMES: center void, 380px tall with 180px rosette behind at 30% */}
        <Reveal immediate>
          <HexagonalVoid align="center" className="min-h-[380px] flex flex-col justify-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30" aria-hidden="true">
              <SixLobedRosette size={180} />
            </div>

            <div className="relative z-10 py-4">
              {copy.familiesPrefix ? (
                <p className="mb-3 font-inv-body text-xs text-inv-muted tracking-wider">
                  {copy.familiesPrefix}
                </p>
              ) : null}

              <h1 className="font-inv-display text-[2.75rem] font-bold leading-tight text-inv-ink text-balance">
                <span className="block">{view.name1}</span>
                <span className="my-1.5 block text-xl text-inv-accent font-normal" aria-hidden="true">
                  {copy.nameSeparator}
                </span>
                <span className="block">{view.name2}</span>
              </h1>

              <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
                {copy.eventName[view.eventType]}
              </p>
            </div>
          </HexagonalVoid>
        </Reveal>

        {/* 2. BISMILLAH + VERSE: inline-start hung void, 300px tall */}
        {copy.bismillah && copy.verse ? (
          <Reveal>
            <HexagonalVoid align="start" className="min-h-[300px] flex flex-col justify-center">
              <p
                className="font-inv-verse text-2xl text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-3 font-inv-verse text-[1.0625rem] leading-[2] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-[11px] text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </HexagonalVoid>
          </Reveal>
        ) : null}

        {/* 3. POETRY: small center void, 200px tall with bobbin divider */}
        <Reveal>
          <HexagonalVoid align="center" className="min-h-[200px] flex flex-col justify-center">
            <BobbinDivider className="my-2" />
            <p className="font-inv-body text-base leading-[1.9] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 4. INVITATION LINE: inline-end hung void */}
        <Reveal>
          <HexagonalVoid align="end">
            <p className="font-inv-body text-[17px] leading-relaxed text-inv-ink text-pretty py-2">
              {copy.inviteLine[view.eventType]}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 5. ROLES: center void with bobbin divider */}
        <Reveal>
          <HexagonalVoid align="center">
            <div className="py-2">
              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                  {copy.roleGroom}
                </span>
                <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                  {view.name1}
                </p>
              </div>

              <BobbinDivider className="my-3" />

              <div>
                <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                  {copy.roleBride}
                </span>
                <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                  {view.name2}
                </p>
              </div>
            </div>
          </HexagonalVoid>
        </Reveal>

        {/* 6. PHOTO / NO PHOTO VOID */}
        <Reveal>
          <HexagonalVoid align="start">
            {hasPhoto ? (
              <div className="relative mx-auto inline-block overflow-hidden rounded-2xl border-2 border-inv-accent-soft p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.photoUrl!}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="block h-[220px] w-[200px] rounded-xl object-cover"
                />
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <SixLobedRosette size={160} />
              </div>
            )}
          </HexagonalVoid>
        </Reveal>

        {/* 7 & 8. DATE & TIME: inline-start hung void */}
        <Reveal>
          <HexagonalVoid align="end" className="min-h-[240px] flex flex-col justify-center">
            <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
              {date.weekday}
            </p>
            <p className="mt-1 font-inv-display text-5xl font-bold leading-none text-inv-accent">
              <span className="numeric">{date.day}</span>
            </p>
            <p className="mt-2 font-inv-display text-base text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>

            <BobbinDivider className="my-2" />

            <p className="font-inv-body text-sm text-inv-muted">
              {copy.labels.time}: <span className="numeric font-semibold">{time.clock}</span> {time.period}
            </p>
          </HexagonalVoid>
        </Reveal>

        {/* 9. VENUE: center void with Maps button */}
        <Reveal>
          <HexagonalVoid align="center">
            <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
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
                className="tap-target press mt-4 inline-flex items-center gap-2 rounded-full border border-inv-accent px-6 py-2 font-inv-body text-xs font-semibold text-inv-accent transition hover:bg-inv-panel active:scale-95"
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
          </HexagonalVoid>
        </Reveal>

        {/* 10. COUNTDOWN: wide 170px void */}
        <Reveal>
          <HexagonalVoid align="start" className="min-h-[170px] flex flex-col justify-center">
            <p className="mb-3 font-inv-body text-xs text-inv-muted">
              {copy.labels.countdownHeading}
            </p>
            <MashrabiyaCountdown targetMs={view.eventInstantMs} copy={copy} />
          </HexagonalVoid>
        </Reveal>

        {/* 11. MESSAGE: inline-end void */}
        {view.customMessage ? (
          <Reveal>
            <HexagonalVoid align="end">
              <p className="font-inv-body text-sm leading-relaxed text-inv-muted text-pretty py-2">
                {view.customMessage}
              </p>
            </HexagonalVoid>
          </Reveal>
        ) : null}

        {/* 12. FOOTER: small center void */}
        <footer className="my-8 text-center">
          <HexagonalVoid align="center" className="py-4">
            <BobbinDivider className="my-1" />
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inv-body text-[11px] text-inv-muted transition hover:text-inv-accent"
            >
              {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
            </a>
          </HexagonalVoid>
        </footer>
      </div>
    </div>
  );
}
