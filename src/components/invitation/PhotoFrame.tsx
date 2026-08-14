'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { InvitationView } from '@/lib/invitation-view';

export type PhotoShape = 'arch' | 'circle' | 'rounded' | 'square';

const SHAPES: Record<PhotoShape, string> = {
  // An arched top, the shape most wedding stationery reaches for.
  arch: 'rounded-t-[999px] rounded-b-2xl',
  circle: 'rounded-full',
  rounded: 'rounded-[2rem]',
  square: 'rounded-none',
};

/**
 * The photo, always framed and never edge to edge.
 *
 * A raw phone photo dropped straight into a card looks like a mistake. A soft border, a
 * shape and a faint inner shadow make an average snapshot look placed rather than
 * pasted, which is most of the difference between this and the cheap end of the market.
 *
 * If the image fails to load, the whole block removes itself and the card falls back to
 * its no photo layout. That version is a real design rather than a gap, so an ImageKit
 * outage becomes something nobody notices instead of a broken icon in the middle of
 * somebody's wedding invitation.
 */
export function PhotoFrame({
  view,
  shape = 'arch',
  className,
}: {
  view: InvitationView;
  shape?: PhotoShape;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!view.photoUrl || failed) return null;

  return (
    <div className={cn('mx-auto w-full max-w-[17rem]', className)}>
      <div
        className={cn(
          'relative overflow-hidden border border-inv-line bg-inv-panel shadow-[0_18px_40px_-26px_rgba(0,0,0,0.55)]',
          SHAPES[shape],
        )}
        style={{ aspectRatio: shape === 'circle' ? '1 / 1' : '4 / 5' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={view.photoUrl}
          alt={`${view.name1} & ${view.name2}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />

        {/* Ties the photo to the card's palette so it never sits on the page as a
            foreign rectangle. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-inv-accent/12 to-transparent"
          aria-hidden="true"
        />
        <div
          className={cn('pointer-events-none absolute inset-1 border border-white/25', SHAPES[shape])}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
