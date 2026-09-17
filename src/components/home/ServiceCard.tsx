import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteImage } from '@/components/media/SiteImage';
import { Button } from '@/components/ui/button';
import { isPlaceholderMedia } from '@/lib/photobooth/config';

/**
 * One of the two things QLTY sells, as a card.
 *
 * A photograph, one sentence, a price and a way in. No feature list and no chips: the
 * decision being made here is which of two services the visitor wants, not which tier
 * of one, and every extra word spent on detail is a word spent before that decision.
 *
 * The video is muted, looping and playsInline because an autoplaying clip that is any of
 * those things is a clip iOS refuses to start, and a still poster is better than a play
 * button the visitor has to find. It falls back to the photograph when no clip exists,
 * which today is always.
 */
export function ServiceCard({
  title,
  body,
  href,
  cta,
  imagePath,
  videoPath = '',
  imageAlt,
  priority = false,
  tag,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  imagePath: string;
  /** Optional short muted loop. Empty means the photograph is used instead. */
  videoPath?: string;
  imageAlt: string;
  priority?: boolean;
  /** The price tag. Rendered on the booth card only, which is the motif's one use. */
  tag?: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white/60">
      <div className="relative">
        {videoPath && !isPlaceholderMedia(videoPath) ? (
          <video
            src={videoPath}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label={imageAlt}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <SiteImage
            path={imagePath}
            alt={imageAlt}
            width={720}
            height={540}
            priority={priority}
            className="aspect-[4/3] object-cover"
          />
        )}

        {/* Hung over the corner of the photograph rather than placed under it, which is
            what a tag on a physical thing does. */}
        {tag ? <div className="absolute bottom-0 end-4 translate-y-1/2">{tag}</div> : null}
      </div>

      <div className={tag ? 'px-5 pt-8 pb-5' : 'p-5'}>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft text-pretty">{body}</p>

        <Button asChild className="mt-4 w-full">
          <Link href={href}>{cta}</Link>
        </Button>
      </div>
    </article>
  );
}
