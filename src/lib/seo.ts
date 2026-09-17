import { SITE_URL } from '@/lib/constants';
import { PACKAGES } from '@/lib/packages';
import { BOOTH_PACKAGES, INSTAGRAM_URL } from '@/lib/photobooth/config';
import type { Dictionary } from '@/i18n/ui';

/**
 * Structured data for the home.
 *
 * One LocalBusiness with two offers, rather than two businesses. QLTY is one company in
 * Cairo that sells invitations and rents a photo booth, and describing it as two would
 * have the two records compete for the same brand query and split whatever authority
 * the domain earns.
 *
 * The prices are the cheapest tier of each service, read from the same constants the
 * pages render, so structured data cannot drift from the page the way a hand written
 * JSON LD block always eventually does. Google treats a price in markup that disagrees
 * with the price on the page as a reason to drop the rich result.
 *
 * `areaServed` is Cairo and Giza because that is where the booth can actually go. It is
 * the one field here that is a business fact rather than a derived one, and it matches
 * what the footer tells a human.
 */
export function homeJsonLd(t: Dictionary): Record<string, unknown> {
  const invitationFrom = Math.min(...PACKAGES.map((p) => p.price));
  const boothFrom = Math.min(...BOOTH_PACKAGES.map((p) => p.price));

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'QLTY',
    url: SITE_URL,
    description: t.home.metaDescription,
    image: `${SITE_URL}/logo.svg`,
    priceRange: 'EGP',
    sameAs: [INSTAGRAM_URL],
    areaServed: [
      { '@type': 'City', name: 'Cairo' },
      { '@type': 'City', name: 'Giza' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'QLTY',
      itemListElement: [
        {
          '@type': 'Offer',
          url: `${SITE_URL}/photobooth`,
          priceCurrency: 'EGP',
          price: boothFrom,
          itemOffered: {
            '@type': 'Service',
            name: t.home.boothTitle,
            description: t.home.boothBody,
          },
        },
        {
          '@type': 'Offer',
          url: `${SITE_URL}/invitations`,
          priceCurrency: 'EGP',
          price: invitationFrom,
          itemOffered: {
            '@type': 'Service',
            name: t.home.invitationsTitle,
            description: t.home.invitationsBody,
          },
        },
      ],
    },
  };
}
