import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

/**
 * What a crawler may look at, which is four pages and nothing else.
 *
 * Most of this site is private by construction rather than by obscurity, and the
 * disallow list says so out loud:
 *
 *   /[slug] is a wedding invitation. It carries a couple's names, their venue and the
 *   date they will be away from home, and it was sent to a guest list rather than
 *   published. It is not in the sitemap and it is disallowed here.
 *
 *   /edit and /build/status are addressed by a secret token. They already carry a
 *   noindex header from next.config, and this is the second lock.
 *
 *   /photobooth/request is the same shape of thing for a booth booking.
 *
 * A disallow is a request, not a control, which is exactly why the tokened routes have
 * the header as well. What this file does is stop a well behaved crawler from spending
 * its budget on pages that can never rank and should never be seen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/edit/',
        '/build/',
        '/photobooth/request/',
        '/api/',
        // The diagnostic and card dump pages, which are development tooling.
        '/zz',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
