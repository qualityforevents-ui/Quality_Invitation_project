// An at sign rather than the Instagram glyph: lucide dropped its brand icons at v1,
// and redrawing somebody's trademark to fill the gap is not ours to do.
import { AtSign } from 'lucide-react';
import { SiteImage } from '@/components/media/SiteImage';
import { INSTAGRAM_TILES, INSTAGRAM_URL } from '@/lib/photobooth/config';
import type { Dictionary } from '@/i18n/ui';

/**
 * Four squares linking to the profile.
 *
 * Static images and an anchor, deliberately not Instagram's embed script. That script
 * is third party JavaScript on the first paint of the page most of this business's
 * traffic lands on, it ships an iframe per post, and what it renders is four pictures.
 * The trade is a manual swap when the grid changes, which is a minute of somebody's
 * time against a second of everybody's.
 */
export function InstagramStrip({ t }: { t: Dictionary }) {
  return (
    <section>
      <h2 className="text-base font-bold">{t.home.instagramTitle}</h2>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {INSTAGRAM_TILES.map((path, index) => (
          <a
            key={path}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="press overflow-hidden rounded-md"
            // The strip as a whole is one destination. Naming each tile would have a
            // screen reader read "Instagram, Instagram, Instagram, Instagram".
            aria-hidden={index > 0 ? 'true' : undefined}
            tabIndex={index > 0 ? -1 : undefined}
            aria-label={index === 0 ? t.home.instagramCta : undefined}
          >
            <SiteImage
              path={path}
              alt=""
              width={220}
              height={220}
              sizes="25vw"
              className="aspect-square object-cover"
            />
          </a>
        ))}
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold-deep"
      >
        <AtSign className="size-4" aria-hidden="true" />
        {t.home.instagramCta}
      </a>
    </section>
  );
}
