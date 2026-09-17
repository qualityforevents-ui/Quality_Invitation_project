import type { Metadata } from 'next';
import { ContinueDraft } from '@/components/site/ContinueDraft';
import { Hero } from '@/components/home/Hero';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HowItWorksCompact } from '@/components/home/HowItWorksCompact';
import { InstagramStrip } from '@/components/home/InstagramStrip';
import { PriceTag } from '@/components/home/PriceTag';
import { ServiceCard } from '@/components/home/ServiceCard';
import { SiteFooter } from '@/components/home/SiteFooter';
import { Reviews } from '@/components/landing/Reviews';
import { TrackedSupportButton } from '@/components/site/TrackedSupportButton';
import { getDictionary } from '@/i18n/ui';
import { SITE_URL } from '@/lib/constants';
import { loadDraft } from '@/lib/draft';
import { isEditable } from '@/lib/invitations';
import { BOOTH_MEDIA, INVITATIONS_MEDIA, boothStartingPrice } from '@/lib/photobooth/config';
import { getApprovedReviews } from '@/lib/reviews';
import { getUiLang } from '@/lib/session';
import { homeJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUiLang());

  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: { canonical: '/' },
    openGraph: {
      title: t.home.metaTitle,
      description: t.home.metaDescription,
      url: SITE_URL,
      type: 'website',
    },
  };
}

/**
 * The QLTY home.
 *
 * Two services, one brand, and a visitor who does not yet know which of the two they
 * came for. Almost all of this traffic is a phone opening a link from an Instagram
 * story or a WhatsApp message, so the page is built narrow first and the desktop is the
 * same column with air around it.
 *
 * Restraint is the brief. No chips, no badges, no feature grids, and exactly one thing
 * on the page that is not square to the grid: the gold price tag on the booth card.
 *
 * Dynamic for the same single reason the builder is: the editToken cookie is httpOnly,
 * so only the server can know whether this visitor already has an invitation half
 * built and needs the way back into it.
 */
export default async function HomePage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const [{ invitation }, reviews] = await Promise.all([loadDraft(), getApprovedReviews()]);

  /*
   * A draft the customer can no longer change is not something to offer to continue. An
   * expired or rejected invitation resolves from the cookie exactly like a live one, and
   * sending somebody to the builder to edit it would show them a form that refuses every
   * save. A database outage lands here as "no draft", which is the right way to be
   * wrong: the bar is missing for a minute rather than promising a draft it cannot open.
   */
  const draft = invitation && isEditable(invitation) ? invitation : null;
  const names = draft ? [draft.name1, draft.name2].filter(Boolean).join(' • ') || null : null;

  // pb-24 clears the floating WhatsApp bubble, which is fixed to the viewport and
  // otherwise sits on top of the footer's last two lines.
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-24">
      {/*
        Both services in one LocalBusiness record rather than two. Google reads this as
        one company in Cairo that offers two things, which is what it is, and splitting
        it would compete with itself for the same brand query.
      */}
      <script
        type="application/ld+json"
        // The payload is built from our own constants. No user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(t)) }}
      />

      <HomeHeader lang={lang} t={t} />

      <Hero t={t} />

      {draft ? (
        <div className="mt-8">
          <ContinueDraft lang={lang} t={t} names={names} />
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-6">
        <ServiceCard
          title={t.home.boothTitle}
          body={t.home.boothBody}
          href="/photobooth"
          cta={t.home.boothCta}
          imagePath={BOOTH_MEDIA.hero}
          videoPath={BOOTH_MEDIA.heroVideo}
          imageAlt={t.home.boothTitle}
          category="photobooth"
          priority
          tag={<PriceTag price={boothStartingPrice()} t={t} />}
        />

        <ServiceCard
          title={t.home.invitationsTitle}
          body={t.home.invitationsBody}
          href="/invitations"
          cta={t.home.invitationsCta}
          imagePath={INVITATIONS_MEDIA.hero}
          imageAlt={t.home.invitationsTitle}
          category="invitation"
        />
      </div>

      <div className="mt-12 flex flex-col gap-10">
        <HowItWorksCompact title={t.home.howBoothTitle} steps={t.home.howBoothSteps} />
        <HowItWorksCompact
          title={t.home.howInvitationsTitle}
          steps={t.home.howInvitationsSteps}
        />
      </div>

      <div className="mt-12">
        <Reviews reviews={reviews} lang={lang} t={t} />
      </div>

      <div className="mt-12">
        <InstagramStrip t={t} />
      </div>

      <SiteFooter t={t} />

      <TrackedSupportButton
        message={t.home.supportMessage}
        label={t.landing.support}
        page="home"
        contentCategory="home"
      />
    </main>
  );
}
