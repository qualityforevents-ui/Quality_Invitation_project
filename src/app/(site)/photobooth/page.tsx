import type { Metadata } from 'next';
import { BoothBooking } from '@/components/booth/BoothBooking';
import { BoothFaq } from '@/components/booth/BoothFaq';
import { BoothGallery } from '@/components/booth/BoothGallery';
import { BoothHero } from '@/components/booth/BoothHero';
import { BoothPackages } from '@/components/booth/BoothPackages';
import { BoothViewedBeacon } from '@/components/booth/BoothViewedBeacon';
import { HomeHeader } from '@/components/home/HomeHeader';
import { SiteFooter } from '@/components/home/SiteFooter';
import { getDictionary } from '@/i18n/ui';
import { SITE_URL } from '@/lib/constants';
import { DEFAULT_BOOTH_PACKAGE, isValidBoothPackage } from '@/lib/photobooth/config';
import { getUiLang } from '@/lib/session';

/**
 * Renders on every request, because the calendar on it is a claim about tonight.
 *
 * The availability itself is fetched by the client after paint, so this being dynamic
 * is about the language cookie rather than about the dates. It is stated here because
 * the obvious optimisation, making this page static, would be wrong for a reason that
 * is not obvious: the copy is bilingual and the language lives in a cookie.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUiLang());

  return {
    title: t.photobooth.metaTitle,
    description: t.photobooth.metaDescription,
    alternates: { canonical: '/photobooth' },
    openGraph: {
      title: t.photobooth.metaTitle,
      description: t.photobooth.metaDescription,
      url: `${SITE_URL}/photobooth`,
      type: 'website',
    },
  };
}

/**
 * Photo booth hire.
 *
 * Inside the (site) group, so it inherits the fonts, the direction wrapper and the Meta
 * pixel from the layout without saying anything about any of them. That inheritance is
 * the whole reason the route lives here rather than at the top level beside /sample.
 *
 * The order is deliberate and is not the order a brochure would use. The photograph and
 * the price come first because they are what somebody arriving from Instagram wants;
 * the calendar comes before the packages in the visitor's attention through the hero
 * button, because the question that actually stops a booking is whether the night is
 * free, not which tier to buy.
 */
export default async function PhotoBoothPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const { package: requested } = await searchParams;

  // An ad can land somebody on a tier already chosen. Anything unrecognised falls back
  // rather than erroring, because this value comes from a URL somebody else wrote.
  const initialPackage =
    requested && isValidBoothPackage(requested) ? requested : DEFAULT_BOOTH_PACKAGE;

  return (
    // pb-24 clears the floating WhatsApp bubble, which is fixed to the viewport.
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-24">
      <BoothViewedBeacon packageId={initialPackage} />

      <HomeHeader lang={lang} t={t} />

      <BoothHero t={t} />

      <div className="mt-14">
        <BoothPackages lang={lang} t={t} />
      </div>

      <div className="mt-14">
        <BoothGallery t={t} />
      </div>

      {/* The anchor the hero button scrolls to. scroll-mt clears the sticky nothing
          above it and gives the heading a little air when it lands. */}
      <div id="booking" className="mt-14 scroll-mt-4">
        <BoothBooking lang={lang} t={t} initialPackage={initialPackage} />
      </div>

      <div className="mt-14">
        <BoothFaq t={t} />
      </div>

      {/*
        The support bubble is rendered by BoothBooking rather than here, because on this
        page it is not a constant. Somebody asking a question after choosing a Saturday
        and a package has already said most of what the answer depends on, and only the
        booking component knows what they picked.
      */}
      <SiteFooter t={t} />
    </main>
  );
}
