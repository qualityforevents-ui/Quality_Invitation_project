import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

/**
 * The four pages that are actually public.
 *
 * Listed by hand rather than generated from the route tree, and that is deliberate: a
 * generated sitemap on this codebase would enumerate every invitation slug, which is
 * the one thing that must never happen. Guests were sent those links; publishing them
 * would put a couple's home address and the night they will be out of it into a search
 * index. A list that has to be edited when a page is added is a much smaller problem.
 *
 * No lastModified. These pages change when they are deployed, and a date that is always
 * "today" tells a crawler nothing it did not already know from the response.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/photobooth`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/invitations`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/sample`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
