import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { buildPhotoUrl } from '@/lib/photo-url';
import { isPlaceholderMedia } from '@/lib/photobooth/config';
import { cn } from '@/lib/cn';

/**
 * A photograph from ImageKit, or an honest empty frame where one has not been supplied.
 *
 * The booth pages were built before a single booth photo existed. The alternative to
 * this component was either stock photography, which would be a picture of somebody
 * else's booth presented as ours, or broken image icons all over a page we are asking
 * people to spend eight thousand pounds on. So an unreplaced path renders a quiet
 * framed placeholder at the right aspect ratio, and the layout it sits in is already
 * final: dropping in real paths changes the pictures and moves nothing.
 *
 * Sized through ImageKit rather than by the browser. f-auto and q-80 come from the same
 * transform builder the invitation photos use, so a booth gallery on a phone on
 * Egyptian mobile data is a handful of WebP files and not six full resolution JPEGs.
 */
export function SiteImage({
  path,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 768px',
}: {
  path: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** True only for the one image above the fold. */
  priority?: boolean;
  sizes?: string;
}) {
  if (isPlaceholderMedia(path)) {
    return (
      <div
        // The aspect ratio is held by the real dimensions, so nothing reflows when the
        // photograph arrives. This is the whole reason the placeholder is not a div of
        // arbitrary height.
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn(
          'flex w-full items-center justify-center bg-cream-deep text-ink-faint',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="size-8 opacity-40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={buildPhotoUrl(path, null, { width, height })}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn('w-full object-cover', className)}
    />
  );
}
