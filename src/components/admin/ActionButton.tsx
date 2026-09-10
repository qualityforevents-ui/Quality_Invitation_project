'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'quiet';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-adm-accent text-white shadow-sm',
  secondary: 'border border-adm-control bg-adm-panel text-adm-text',
  danger: 'border border-adm-danger/50 bg-adm-panel text-adm-danger',
  quiet: 'text-adm-muted',
};

const SIZES = {
  lg: 'w-full rounded-xl px-5 py-4 text-base font-bold',
  md: 'w-full rounded-xl px-4 py-3 text-sm font-semibold',
  sm: 'rounded-lg px-3 py-2 text-xs font-semibold',
} as const;

/**
 * Every button in the admin that submits a form.
 *
 * The old ones were bare `<button type="submit">`, which on this surface is a real
 * problem rather than a missing flourish. Activation writes to Firestore, revalidates
 * three cached paths and redirects; on a phone on mobile data that is a second or two
 * of a screen that looks exactly like a screen that ignored you. The operator taps
 * again. `disabled` while pending is the actual fix — the label change is just so the
 * wait is legible.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'press tap-target inline-flex items-center justify-center gap-2 text-center disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/**
 * A destructive submit that asks once.
 *
 * Rejecting an invitation and killing a live link are both one tap and both visible to
 * the customer within seconds — a rejection writes a reason onto their waiting screen,
 * and deactivation takes down a link that may already be in a hundred guests' hands.
 * Neither has an undo. This is not a modal, which on a phone would be a second surface
 * to dismiss for something done a dozen times a day; the button just changes into the
 * confirmation and changes back on its own if it was a mis-tap.
 */
export function ConfirmSubmit({
  children,
  confirmLabel,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!armed) return;

    // Moves the keyboard to the button that now does the thing, so confirming is the
    // same gesture as arming rather than a hunt for where focus went.
    confirmRef.current?.focus();

    timerRef.current = window.setTimeout(() => setArmed(false), 5000);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={cn(
          'press tap-target w-full rounded-xl border border-adm-danger/50 bg-adm-panel px-4 py-3 text-sm font-semibold text-adm-danger',
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <ArmedButton ref={confirmRef} pendingLabel={pendingLabel} className={className}>
      {confirmLabel}
    </ArmedButton>
  );
}

function ArmedButton({
  ref,
  children,
  pendingLabel,
  className,
}: {
  ref: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      ref={ref}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'press tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-adm-danger px-4 py-3 text-sm font-bold text-white disabled:opacity-60',
        className,
      )}
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
