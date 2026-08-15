import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

/*
 * `leading-snug` rather than `leading-none`. A line height of exactly 1 crops Arabic:
 * the descending tails of ج ح خ ع and the dots below ب ي get cut by the button's own
 * box, which is invisible in English and wrong in the language most of these buttons
 * are read in.
 *
 * The press comes from the shared `press` utility, so every pressable surface in the
 * product uses one scale and one curve. `transition-colors` handles the hover and
 * disabled tints separately, which keeps the transform on its own timing.
 */
const BASE =
  'press tap-target inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-center font-medium leading-snug disabled:pointer-events-none';

const VARIANTS: Record<ButtonVariant, string> = {
  /*
   * Disabled is a change of substance rather than a blanket fade. At 45% opacity the
   * old treatment left gold-on-white looking like a slightly tired button that was
   * still worth tapping; flattening the shadow removes the lift that reads as pressable.
   */
  primary:
    'bg-gold text-white shadow-[0_6px_20px_-8px_rgba(138,106,50,0.75)] hover:bg-gold-deep disabled:bg-gold/40 disabled:shadow-none',
  secondary:
    'border border-line bg-white/70 text-ink hover:bg-white disabled:bg-white/40 disabled:text-ink-faint',
  quiet: 'text-ink-soft underline underline-offset-4 hover:text-ink disabled:no-underline disabled:text-ink-faint',
};

/**
 * Shared as a class string rather than a component so a link and a button can look
 * identical without one of them pretending to be the other.
 */
export function buttonClass(variant: ButtonVariant = 'primary', extra?: string): string {
  return cn(BASE, VARIANTS[variant], extra);
}
