'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  MosqueLamp,
  PLUMB_LENGTHS,
  PLUMB_TILE,
  PlumbLine,
} from './QandeelOrnaments';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * قنديل, revealed. The axis is SUSPENSION AND Z-DEPTH.
 *
 * Everything hangs on plumb lines of an authored irregular sequence:
 * [40, 96, 62, 130, 78, 54, 112, 68] px.
 * Three depth planes (far at 0.35x, mid at 0.7x, near at 1.0x).
 * Content is strictly on NEAR at 342px measure. No CSS blur.
 */

function HungBlock({
  drop,
  children,
  className,
}: {
  drop: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn('relative my-6 flex flex-col items-center text-center', className)}>
      <PlumbLine length={drop} />
      <div className="mt-2 w-full">{children}</div>
    </Reveal>
  );
}

function QandeelCountdown({
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
    return <p className="font-inv-display text-xl text-inv-accent">{copy.labels.started}</p>;
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
          <span className="font-inv-display text-3xl font-bold leading-none text-inv-accent">
            {cell.value.toString().padStart(2, '0')}
          </span>
          <span className="mt-1.5 font-inv-body text-[10px] text-inv-muted">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function QandeelInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Scroll signatures for the two background depth planes
  const farY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 320]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden bg-inv-bg text-inv-ink px-4 py-16"
    >
      {/* ================= FAR DEPTH LAYER (0.35x, petrol green tint) ================= */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 select-none"
        style={{
          y: farY,
          scale: 0.82,
          backgroundImage: PLUMB_TILE,
        }}
        aria-hidden="true"
      >
        {/* Maximum 6 background decorative elements */}
        <div className="absolute top-[180px] start-[12%] text-inv-accent-soft opacity-60">
          <MosqueLamp size={68} variant="outline" lit={false} />
        </div>
        <div className="absolute top-[520px] end-[15%] text-inv-accent-soft opacity-60">
          <MosqueLamp size={76} variant="outline" lit={false} />
        </div>
        <div className="absolute top-[900px] start-[20%] text-inv-accent-soft opacity-60">
          <MosqueLamp size={68} variant="outline" lit={false} />
        </div>
      </motion.div>

      {/* ================= MID DEPTH LAYER (0.7x) ================= */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-70 select-none"
        style={{
          y: midY,
          scale: 0.92,
        }}
        aria-hidden="true"
      >
        <div className="absolute top-[320px] end-[8%] text-inv-accent/80">
          <MosqueLamp size={88} variant="outline" />
        </div>
        <div className="absolute top-[760px] start-[10%] text-inv-accent/80">
          <MosqueLamp size={96} variant="outline" />
        </div>
      </motion.div>

      {/* ================= NEAR DEPTH LAYER: The Invitation Content (342px measure) ================= */}
      <div className="relative z-10 mx-auto w-full max-w-[342px] flex flex-col items-center">

        {/* 1. NAMES — hung on 40px line with 190px hero lamp behind at 30% */}
        <div className="relative w-full text-center">
          <div className="pointer-events-none absolute -top-8 inset-x-0 flex justify-center opacity-30" aria-hidden="true">
            <MosqueLamp size={190} />
          </div>

          <HungBlock drop={PLUMB_LENGTHS.names}>
            {copy.familiesPrefix ? (
              <p className="mb-3 font-inv-body text-xs text-inv-muted tracking-wider">
                {copy.familiesPrefix}
              </p>
            ) : null}

            <h1 className="font-inv-display text-4xl sm:text-5xl font-bold leading-tight text-inv-ink text-balance">
              <span className="block">{view.name1}</span>
              <span className="my-1.5 block text-2xl text-inv-accent font-normal" aria-hidden="true">
                {copy.nameSeparator}
              </span>
              <span className="block">{view.name2}</span>
            </h1>

            <p className="mt-4 font-inv-body text-xs uppercase tracking-widest text-inv-accent">
              {copy.eventName[view.eventType]}
            </p>
          </HungBlock>
        </div>

        {/* 2. BISMILLAH + VERSE — hung on 96px line, parallax explicitly disabled */}
        {copy.bismillah && copy.verse ? (
          <HungBlock drop={PLUMB_LENGTHS.verse}>
            <div className="py-2">
              <p
                className="font-inv-verse text-2xl text-inv-ink"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>
              <p className="mt-4 font-inv-verse text-[1.125rem] leading-[2.1] text-inv-ink text-pretty">
                {copy.verse}
              </p>
              {copy.verseSource ? (
                <p className="mt-2 font-inv-body text-xs text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </div>
          </HungBlock>
        ) : null}

        {/* 3. POETRY — hung on 62px line */}
        <HungBlock drop={PLUMB_LENGTHS.poetry}>
          <p className="font-inv-body text-lg leading-[1.9] text-inv-muted text-pretty">
            {copy.poetry}
          </p>
        </HungBlock>

        {/* 4. INVITATION LINE — hung on 130px line (longest drop) */}
        <HungBlock drop={PLUMB_LENGTHS.invite}>
          <p className="font-inv-body text-[17px] leading-relaxed text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
        </HungBlock>

        {/* 5. ROLES — hung on 78px line with 26px solid lamp */}
        <HungBlock drop={PLUMB_LENGTHS.roles}>
          <div className="mb-3 flex justify-center">
            <MosqueLamp size={26} variant="solid" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                {copy.roleGroom}
              </span>
              <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                {view.name1}
              </p>
            </div>
            <div>
              <span className="font-inv-body text-[11px] text-inv-muted [word-spacing:0.3em] uppercase">
                {copy.roleBride}
              </span>
              <p className="mt-1 font-inv-body text-lg font-bold text-inv-ink">
                {view.name2}
              </p>
            </div>
          </div>
        </HungBlock>

        {/* 6. PHOTO / NO PHOTO — hung on 96px line with suspension wires */}
        <HungBlock drop={PLUMB_LENGTHS.photo}>
          {hasPhoto ? (
            <div className="relative mx-auto inline-block border-[1.5px] border-inv-accent p-1 shadow-md bg-inv-panel">
              {/* Corner suspension wire accents */}
              <span className="absolute -top-3 start-2 h-3 w-px bg-inv-accent" />
              <span className="absolute -top-3 end-2 h-3 w-px bg-inv-accent" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.photoUrl!}
                alt={`${view.name1} & ${view.name2}`}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="block max-h-[260px] w-auto object-cover"
              />
            </div>
          ) : (
            /* NO PHOTO: 120px lamp at same hung height, rhythm preserved to the pixel */
            <div className="flex justify-center py-2">
              <MosqueLamp size={120} />
            </div>
          )}
        </HungBlock>

        {/* 7 & 8. DATE & TIME — hung on 54px line */}
        <HungBlock drop={PLUMB_LENGTHS.date}>
          <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
            {date.weekday}
          </p>
          <p className="mt-1 font-inv-display text-[4.25rem] font-semibold leading-none text-inv-accent">
            <span className="numeric">{date.day}</span>
          </p>
          <p className="mt-2 font-inv-display text-lg text-inv-ink">
            {date.month} <span className="numeric">{date.year}</span>
          </p>
          <p className="mt-3 font-inv-body text-sm text-inv-muted">
            {copy.labels.time} <span className="mx-1.5 text-inv-accent">·</span>
            <span className="numeric">{time.clock}</span> {time.period}
          </p>
        </HungBlock>

        {/* 9. VENUE — hung on 112px line with Maps button */}
        <HungBlock drop={PLUMB_LENGTHS.venue}>
          <p className="font-inv-body text-[11px] text-inv-muted uppercase tracking-wider">
            {copy.labels.venue}
          </p>
          <p className="mt-1.5 font-inv-body text-xl font-medium text-inv-ink text-balance">
            {view.venueName}
          </p>

          {view.venueMapUrl ? (
            <a
              href={view.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target press mt-5 inline-flex items-center gap-2 rounded border border-inv-accent bg-inv-panel/60 px-8 py-3 font-inv-body text-xs font-semibold text-inv-accent shadow-xs transition hover:bg-inv-panel active:scale-95"
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
        </HungBlock>

        {/* 10. COUNTDOWN — hung on 68px line */}
        <HungBlock drop={PLUMB_LENGTHS.countdown}>
          <p className="mb-4 font-inv-body text-xs text-inv-muted">
            {copy.labels.countdownHeading}
          </p>
          <QandeelCountdown targetMs={view.eventInstantMs} copy={copy} />
        </HungBlock>

        {/* 11. MESSAGE — hung on 40px line */}
        {view.customMessage ? (
          <HungBlock drop={PLUMB_LENGTHS.message}>
            <p className="font-inv-body text-sm leading-relaxed text-inv-muted text-pretty">
              {view.customMessage}
            </p>
          </HungBlock>
        ) : null}

        {/* 12. FOOTER — shortest hang with 26px solid lamp */}
        <footer className="mt-12 flex flex-col items-center text-center">
          <PlumbLine length={24} />
          <div className="my-2">
            <MosqueLamp size={22} variant="solid" />
          </div>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inv-body text-[11px] text-inv-muted transition hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </footer>
      </div>
    </div>
  );
}
