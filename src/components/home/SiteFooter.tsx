import Link from 'next/link';
import { AtSign, MapPin, MessageCircle } from 'lucide-react';
import { INSTAGRAM_URL } from '@/lib/photobooth/config';
import { whatsappLink } from '@/lib/constants';
import type { Dictionary } from '@/i18n/ui';

/**
 * The end of the home page.
 *
 * The service area is in it because it is the question this business is asked most
 * often after price, and a booth that cannot reach Alexandria should say so before
 * somebody in Alexandria fills in a booking form.
 */
export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="mt-12 border-t border-line pt-6 pb-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
        <a
          href={whatsappLink(t.home.supportMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-2 text-ink-soft transition hover:text-ink"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {t.home.footerWhatsapp}
        </a>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-2 text-ink-soft transition hover:text-ink"
        >
          <AtSign className="size-4" aria-hidden="true" />
          {t.home.footerInstagram}
        </a>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-faint">
        <MapPin className="size-4" aria-hidden="true" />
        <span>
          {t.home.footerAreasLabel} {t.home.footerAreas}
        </span>
      </p>

      <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/invitations" className="press text-ink-soft transition hover:text-ink">
          {t.home.navInvitations}
        </Link>
        <Link href="/photobooth" className="press text-ink-soft transition hover:text-ink">
          {t.home.navBooth}
        </Link>
        <Link href="/sample" className="press text-ink-soft transition hover:text-ink">
          {t.landing.sample}
        </Link>
      </nav>
    </footer>
  );
}
