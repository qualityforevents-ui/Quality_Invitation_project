'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The reasons an invitation actually gets rejected, as buttons.
 *
 * Whatever is typed here is shown to the customer on their waiting screen, so it is
 * customer-facing copy being written on a phone keyboard in the middle of a queue. In
 * practice it was the same three sentences every time, retyped, with the typos that
 * come of retyping. The chips fill the field rather than submitting, because the reason
 * is often one of these with a detail added to it.
 */
const PRESETS = [
  'التحويل مش واصل',
  'المبلغ ناقص',
  'صورة التحويل مش واضحة',
  'مرجع التحويل غلط',
];

export function RejectReasonField({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setValue(preset);
              inputRef.current?.focus();
            }}
            aria-pressed={value === preset}
            className={cn(
              'press rounded-full border px-3 py-1.5 text-xs',
              value === preset
                ? 'border-adm-danger bg-adm-danger/10 font-semibold text-adm-danger'
                : 'border-adm-line text-adm-muted',
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        name="reason"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="سبب الرفض، هيظهر للعميل"
        className="w-full rounded-xl border border-adm-control bg-adm-panel px-4 py-3 text-sm text-adm-text outline-none placeholder:text-adm-muted focus:border-adm-danger focus:ring-2 focus:ring-adm-danger/20"
      />
    </div>
  );
}
