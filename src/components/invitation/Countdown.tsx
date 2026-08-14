'use client';

import { useEffect, useState } from 'react';
import type { InvitationCopy } from '@/i18n/invitation';

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(targetMs: number, nowMs: number): Parts {
  const remaining = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Live countdown to the event.
 *
 * The first render deliberately uses the target itself as the clock, so the server and
 * the client agree and hydration is quiet. The real time takes over on mount, one tick
 * later.
 *
 * Each number is isolated as left to right text. Without that the bidi algorithm
 * reorders a two digit number sitting next to Arabic label text, and the count starts
 * showing days as though they were seconds.
 */
export function Countdown({ targetMs, copy }: { targetMs: number; copy: InvitationCopy }) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = partsUntil(targetMs, nowMs ?? targetMs);
  const hasPassed = nowMs !== null && targetMs - nowMs <= 0;

  const cells: Array<{ value: number; label: string }> = [
    { value: parts.days, label: copy.labels.countdownDays },
    { value: parts.hours, label: copy.labels.countdownHours },
    { value: parts.minutes, label: copy.labels.countdownMinutes },
    { value: parts.seconds, label: copy.labels.countdownSeconds },
  ];

  if (hasPassed) {
    return (
      <p className="font-inv-display text-2xl text-inv-accent">{copy.labels.started}</p>
    );
  }

  return (
    <div>
      <p className="font-inv-body text-sm tracking-wide text-inv-muted">
        {copy.labels.countdownHeading}
      </p>

      {/* Four rings rather than four filled tiles. Lighter on the page, and it keeps
          the countdown from reading as a row of interface buttons. */}
      <div className="mt-4 flex justify-center gap-2.5">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full border border-inv-line"
          >
            <span className="numeric font-inv-display text-xl leading-none text-inv-ink">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-1.5 font-inv-body text-[0.625rem] text-inv-muted">{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
