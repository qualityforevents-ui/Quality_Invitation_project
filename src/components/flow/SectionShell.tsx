'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

/**
 * The one question that is alive on screen.
 *
 * Everything the flow asks arrives in this shell, so a question is a title, an optional
 * line of help, one control, and a way onward. Sections that answer themselves by being
 * chosen pass no `onNext` and get no button at all, which is the whole feel the flow is
 * after: tapping the answer is the advance.
 *
 * The primary control is never `disabled`. A disabled button on a phone is a button
 * that gives no reason, and the customer's next move is to tap it harder. It stays live
 * and says underneath what it is waiting for.
 */
export function SectionShell({
  title,
  hint,
  children,
  onNext,
  nextLabel,
  blockedReason,
  onSkip,
  skipLabel,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  /** Omitted by sections that advance on choice. */
  onNext?: () => void;
  nextLabel?: string;
  /** Shown under the primary control while it will not advance. */
  blockedReason?: string;
  onSkip?: () => void;
  skipLabel?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rise rounded-2xl border bg-card px-5 py-5 shadow-[0_10px_30px_-24px_rgba(35,32,27,0.55)]',
        className,
      )}
    >
      <h2 className="text-xl font-bold text-balance">{title}</h2>
      {hint ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{hint}</p> : null}

      <div className="mt-4">{children}</div>

      {onNext || onSkip ? (
        <div className="mt-5 flex flex-col gap-1.5">
          {onNext && nextLabel ? (
            <Button type="button" size="lg" onClick={onNext} className="w-full rounded-full text-base">
              {nextLabel}
            </Button>
          ) : null}

          {blockedReason ? (
            <p className="rise text-center text-xs text-destructive">{blockedReason}</p>
          ) : null}

          {onSkip && skipLabel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="w-full rounded-full text-muted-foreground"
            >
              {skipLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
