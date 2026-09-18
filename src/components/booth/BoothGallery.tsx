import { SiteImage } from '@/components/media/SiteImage';
import { BOOTH_MEDIA } from '@/lib/photobooth/config';
import type { Dictionary } from '@/i18n/ui';

/**
 * Photographs from real events.
 *
 * Every tile is a placeholder frame until real files are uploaded, which is deliberate
 * and is the honest state: stock photography of somebody else's photo booth, on a page
 * asking for eight thousand pounds, is a lie that the first customer to arrive at the
 * event will discover.
 *
 * Two columns on a phone rather than three. A booth photograph is a group of people and
 * their faces are the whole point of it; at a third of a 375px screen they are too
 * small to read as anybody.
 */
export function BoothGallery({ t }: { t: Dictionary }) {
  return (
    <section>
      <h2 className="text-xl font-bold">{t.photobooth.galleryTitle}</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {BOOTH_MEDIA.gallery.map((path, index) => (
          <SiteImage
            key={path}
            path={path}
            // Decorative as a set: the heading above says what these are, and six
            // identical alt texts is noise in a screen reader rather than information.
            alt=""
            width={400}
            height={400}
            sizes="(max-width: 768px) 50vw, 240px"
            className="aspect-square rounded-lg object-cover"
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
