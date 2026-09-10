'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { copyText } from '@/lib/clipboard';

/**
 * A value the operator has to move somewhere else, with the move done for them.
 *
 * The request id goes into a WhatsApp reply, the public link goes to the customer, the
 * InstaPay reference gets checked against a bank app. All of it used to be text you
 * selected by long-pressing, on a phone, in a right-to-left layout where the selection
 * handles land on the wrong ends of a Latin string.
 */
export function CopyValue({
  value,
  label,
  className,
  mono = true,
}: {
  value: string;
  label: string;
  className?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  async function handleCopy() {
    if (!(await copyText(value))) return;
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label}: اتنسخ` : `انسخ ${label}`}
      className={cn(
        'press inline-flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 text-start',
        copied ? 'text-adm-success' : 'text-adm-text',
        className,
      )}
    >
      {/*
        bdi rather than dir="ltr": both order a Latin value correctly inside Arabic, but
        forcing direction also drags it to the far edge away from its own label.
      */}
      <span className={cn('min-w-0 truncate', mono && 'font-mono')}>
        <bdi>{value}</bdi>
      </span>
      {copied ? (
        <Check aria-hidden className="size-3.5 shrink-0" />
      ) : (
        <Copy aria-hidden className="size-3.5 shrink-0 text-adm-muted" />
      )}
    </button>
  );
}
