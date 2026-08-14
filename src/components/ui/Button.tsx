import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

const BASE =
  'tap-target inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-center font-medium leading-none transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-white shadow-[0_6px_20px_-8px_rgba(138,106,50,0.75)] hover:bg-gold-deep',
  secondary: 'border border-line bg-white/70 text-ink hover:bg-white',
  quiet: 'text-ink-soft underline underline-offset-4 hover:text-ink',
};

/**
 * Shared as a class string rather than a component so a link and a button can look
 * identical without one of them pretending to be the other.
 */
export function buttonClass(variant: ButtonVariant = 'primary', extra?: string): string {
  return cn(BASE, VARIANTS[variant], extra);
}
