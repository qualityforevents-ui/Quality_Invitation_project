'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { copyText } from '@/lib/clipboard';

/**
 * A value the customer must reproduce exactly, next to a button that reproduces it for
 * them. Wrong InstaPay transfers come from retyped account details, and a mistyped
 * request id is a payment the operator cannot match to an invitation.
 */
export function CopyField({
  label,
  value,
  copyLabel,
  copiedLabel,
  emphasis = false,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
  emphasis?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const ok = await copyText(value);
    if (!ok) return;

    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {/*
          bdi rather than dir="ltr" on the paragraph. Both order the characters of a
          Latin value correctly inside Arabic surroundings, but forcing the direction
          also drags the text to the left edge while its label stays on the right.
          bdi isolates the run and leaves the alignment to the layout.
        */}
        <p
          className={cn(
            'mt-0.5 truncate font-medium text-foreground',
            emphasis ? 'text-xl tracking-wide tabular-nums' : 'text-base',
          )}
        >
          <bdi>{value}</bdi>
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'tap-target shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition active:scale-95',
          copied ? 'border-success/40 bg-success/10 text-success' : 'border-border text-muted-foreground',
        )}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
