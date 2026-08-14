'use client';

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-faint transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25';

function FieldShell({
  id,
  label,
  optionalLabel,
  hint,
  error,
  children,
  trailing,
}: {
  id: string;
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {optionalLabel ? (
            <span className="ms-2 text-xs font-normal text-ink-faint">{optionalLabel}</span>
          ) : null}
        </label>
        {trailing}
      </div>

      {children}

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  optionalLabel,
  hint,
  error,
  className,
  ...props
}: {
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} optionalLabel={optionalLabel} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, error && 'border-danger focus:border-danger focus:ring-danger/20', className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  optionalLabel,
  hint,
  error,
  maxLength,
  counterSuffix,
  value,
  className,
  ...props
}: {
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  counterSuffix?: string;
  value: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();

  const remaining = typeof maxLength === 'number' ? maxLength - value.length : null;

  return (
    <FieldShell
      id={id}
      label={label}
      optionalLabel={optionalLabel}
      hint={hint}
      error={error}
      trailing={
        remaining !== null ? (
          <span className="text-xs text-ink-faint">
            <span className="numeric">{remaining}</span> {counterSuffix}
          </span>
        ) : null
      }
    >
      <textarea
        id={id}
        rows={3}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, 'resize-none', error && 'border-danger', className)}
        {...props}
      />
    </FieldShell>
  );
}

/**
 * A segmented control rather than a select. Three short options are faster to hit with
 * a thumb than a native picker is to open, scroll, and dismiss.
 */
export function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                'tap-target rounded-xl border px-2 py-3 text-sm font-medium transition',
                selected
                  ? 'border-gold bg-gold-wash text-gold-deep'
                  : 'border-line bg-white text-ink-soft hover:border-gold/40',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SaveIndicator({
  status,
  savingLabel,
  savedLabel,
  errorLabel,
}: {
  status: string;
  savingLabel: string;
  savedLabel: string;
  errorLabel: string;
}) {
  if (status === 'idle') return null;

  // Kept to one short line and never allowed to wrap. It sits beside a heading, and a
  // sentence here squeezes that heading into a column two words wide.
  if (status === 'error') {
    return (
      <span className="shrink-0 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-danger">
        {errorLabel}
      </span>
    );
  }

  const isBusy = status === 'saving' || status === 'pending';

  return (
    <span
      aria-live="polite"
      className={cn(
        'shrink-0 text-xs whitespace-nowrap transition-opacity',
        isBusy ? 'text-ink-faint' : 'text-success',
      )}
    >
      {isBusy ? savingLabel : savedLabel}
    </span>
  );
}
