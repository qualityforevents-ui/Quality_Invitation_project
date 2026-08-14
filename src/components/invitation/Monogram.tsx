import { cn } from '@/lib/cn';
import { initialOf } from '@/lib/initials';

/**
 * The couple's initials inside a ringed seal.
 *
 * A monogram is a long standing device on formal invitations and it gives the card a
 * mark of its own rather than another line of text. It carries no information the card
 * does not already state, so it is hidden from assistive technology.
 *
 * The initials are set as HTML rather than SVG text, so they pick up the theme's
 * display face the same way every other piece of type on the card does.
 */
export function Monogram({
  name1,
  name2,
  size = 'md',
  className,
}: {
  name1: string;
  name2: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const first = initialOf(name1);
  const second = initialOf(name2);

  if (!first && !second) return null;

  const box = size === 'lg' ? 'h-24 w-24' : 'h-16 w-16';
  const type = size === 'lg' ? 'text-2xl' : 'text-base';

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center text-inv-accent', box, className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
        <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="0.6" opacity="0.22" />
        {/* Four small marks at the compass points, a common seal motif. */}
        <path d="M50 0.5L52.6 4.5L50 8.5L47.4 4.5Z" fill="currentColor" opacity="0.7" />
        <path d="M50 91.5L52.6 95.5L50 99.5L47.4 95.5Z" fill="currentColor" opacity="0.7" />
        <path d="M0.5 50L4.5 47.4L8.5 50L4.5 52.6Z" fill="currentColor" opacity="0.7" />
        <path d="M91.5 50L95.5 47.4L99.5 50L95.5 52.6Z" fill="currentColor" opacity="0.7" />
      </svg>

      <span className={cn('font-inv-display leading-none text-inv-ink', type)}>
        {first}
        <span className="mx-1 text-inv-accent opacity-70">·</span>
        {second}
      </span>
    </div>
  );
}
