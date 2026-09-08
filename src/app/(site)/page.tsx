import { cookies } from 'next/headers';
import { InvitationFlow } from '@/components/flow/InvitationFlow';
import { SupportButton } from '@/components/SupportButton';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Reviews } from '@/components/landing/Reviews';
import { getDictionary } from '@/i18n/ui';
import { FLOW_STEP_COOKIE } from '@/lib/constants';
import { loadDraft } from '@/lib/draft';
import { todayInCairo } from '@/lib/format';
import { clampFurthest, valuesFromInvitation } from '@/lib/flow/values';
import { isValidSectionId, type SectionId } from '@/lib/flow/sections';
import { isImageKitConfigured } from '@/lib/imagekit';
import { isValidPackage } from '@/lib/packages';
import { getApprovedReviews } from '@/lib/reviews';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * The whole customer product, on one page.
 *
 * There were four routes here until this rebuild: details, design, preview, payment.
 * They are gone, and what replaced them is a single sequence of questions that reveal
 * themselves one at a time. That is a change of shape rather than of scope, so
 * everything the four steps knew has to be assembled here instead and handed to the
 * client in one go.
 *
 * Three of those things are the reason this stays a server component rather than
 * becoming a client page that fetches:
 *
 * The editToken cookie is httpOnly, so only the server can read it, and it is the
 * entire mechanism by which somebody comes back tomorrow and finds their draft where
 * they left it. There are no accounts anywhere in this product.
 *
 * `todayInCairo()` must be resolved here. Asking the browser what day it is gets a
 * different answer from the one the server gives for the last three hours of every
 * Egyptian evening, and a date input whose `min` differs between the two renders is a
 * hydration mismatch, which can cost the whole tree its event handlers. That failure
 * looks exactly like a page where nothing responds to a tap.
 *
 * And a returning customer's position in the flow is read here too, so they land on
 * their unanswered question on first paint rather than watching the page rearrange
 * itself after hydration.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const [{ invitation, unavailable }, reviews, store, { package: requestedPackage }] =
    await Promise.all([loadDraft(), getApprovedReviews(), cookies(), searchParams]);

  /*
   * `?package=` survives the deleted /build route, which redirects here carrying its
   * query string. An explicit choice still beats whatever the draft was beginning to
   * hold: arriving through a package link is somebody deciding, just now, and ignoring
   * that because they started a draft last week would be the app arguing with them.
   */
  const chosenPackage =
    requestedPackage && isValidPackage(requestedPackage) ? requestedPackage : null;

  const values = valuesFromInvitation(invitation, chosenPackage);

  const rememberedRaw = store.get(FLOW_STEP_COOKIE)?.value;
  const remembered: SectionId | null =
    rememberedRaw && isValidSectionId(rememberedRaw) ? rememberedRaw : null;

  // Never trusted as given. A cookie outlives the draft it describes and can be edited
  // by hand, so it is clamped against what is actually stored and can never open the
  // payment panel on an invitation with no bride's name in it.
  const furthest = invitation ? clampFurthest(remembered, values) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-16">
      {/*
        Keyed on which invitation this is, so the flow remounts when that changes.
        Its answers live in a useReducer seeded from initialValues, and a reducer's
        initial state is read once: without a key change, clearing the cookie would
        re-render the page with empty values while the customer carried on looking at
        the old ones. This is what makes "start over" actually start over.
      */}
      <InvitationFlow
        key={invitation?.requestId ?? 'fresh'}
        lang={lang}
        t={t}
        initialValues={values}
        initialFurthest={furthest}
        today={todayInCairo()}
        photoEnabled={isImageKitConfigured()}
        invitation={
          invitation
            ? {
                requestId: invitation.requestId,
                editToken: invitation.editToken,
                status: invitation.status,
                slug: invitation.slug,
              }
            : null
        }
        databaseUnavailable={unavailable}
      />

      {/*
        Below the fold, and mounted the whole time rather than only before the flow
        starts. Somebody halfway through, about to be asked for money by a business they
        have never heard of, is exactly who needs to be able to scroll down and read how
        this works and what other couples said.
      */}
      <div className="mt-8">
        <HowItWorks t={t} />
      </div>

      <div className="mt-8">
        <Reviews reviews={reviews} lang={lang} t={t} />
      </div>

      <SupportButton message={t.landing.supportMessage} label={t.landing.support} />
    </main>
  );
}
