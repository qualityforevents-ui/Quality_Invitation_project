'use client';

import { Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * A question that has been answered, collapsed to one line.
 *
 * This row is the whole reason the flow can ask one thing at a time without the
 * customer losing track of what they have said. It is also the way back: there is no
 * step nav any more, because there is one URL, so tapping the answer is how you change
 * it. Changing something here does not rewind anything after it, which is what makes
 * fixing a misspelled name in question three cost nothing at question twelve.
 *
 * The whole row is the target rather than the pencil, because a 16px icon is not a tap
 * target on a phone and the pencil is there to say the row is tappable, not to be aimed
 * at.
 */
export function AnsweredRow({
  label,
  value,
  onEdit,
  editLabel,
  muted = false,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  editLabel: string;
  /** For an answer that is an absence, such as a skipped photo. */
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`${editLabel}: ${label}`}
      className="press tap-target group flex w-full items-center gap-3 rounded-xl border border-transparent bg-secondary/50 px-4 py-2.5 text-start hover:border-border hover:bg-secondary"
    >
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm font-medium',
          muted ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        <bdi>{value}</bdi>
      </span>
      <Pencil
        className="size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary"
        aria-hidden="true"
      />
    </button>
  );
}
