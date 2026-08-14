'use client';

import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/ui/Button';

/**
 * Floats over the preview. The only chrome the customer sees on this screen, so it
 * stays out of the way of the card and never scrolls off.
 */
export function PreviewBar({
  backLabel,
  continueLabel,
}: {
  backLabel: string;
  continueLabel: string;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md gap-3 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {/* Both refresh first, so neither step is drawn from a cached copy taken
            before the customer's most recent change. */}
        <button
          type="button"
          onClick={() => {
            router.refresh();
            router.push('/build/theme');
          }}
          className={buttonClass('secondary', 'flex-1 px-4')}
        >
          {backLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            router.refresh();
            router.push('/build/payment');
          }}
          className={buttonClass('primary', 'flex-[1.35] px-4')}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
