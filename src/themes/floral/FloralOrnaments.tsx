import { cn } from '@/lib/cn';

/**
 * Botanical line work, drawn rather than illustrated.
 *
 * Kept to strokes and small filled leaves so it stays light over mobile data and takes
 * its colour from the theme, which means the blush and the sage both come from the same
 * two variables the rest of the card uses.
 */

/** A sprig used at the corners of the card. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={cn('h-16 w-16', className)} aria-hidden="true">
      <path
        d="M8 72C8 48 22 26 46 12"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path d="M20 52c-6-2-9-8-8-14 6 1 10 6 10 12" fill="currentColor" opacity="0.28" />
      <path d="M28 40c-2-6 1-12 6-15 2 6-1 12-5 16" fill="currentColor" opacity="0.32" />
      <path d="M38 26c0-6 4-11 10-12 0 6-4 11-9 13" fill="currentColor" opacity="0.26" />
      <circle cx="47" cy="11" r="2.6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** Divider: a stem with a leaf either side. */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center', className)} aria-hidden="true">
      <svg viewBox="0 0 220 20" fill="none" className="w-52 max-w-[64%] text-inv-accent">
        <path d="M14 10H92" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <path d="M128 10H206" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <path d="M110 3c5 3 7 8 5 13-5-2-7-8-5-13Z" fill="currentColor" opacity="0.55" />
        <path d="M110 17c-5-3-7-8-5-13 5 2 7 8 5 13Z" fill="currentColor" opacity="0.35" />
        <circle cx="99" cy="10" r="1.8" fill="currentColor" opacity="0.45" />
        <circle cx="121" cy="10" r="1.8" fill="currentColor" opacity="0.45" />
      </svg>
    </div>
  );
}
