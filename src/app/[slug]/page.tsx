import type { Metadata } from 'next';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import { NotAvailable } from '@/components/invitation/NotAvailable';
import { ViewBeacon } from '@/components/invitation/ViewBeacon';
import { getInvitationCopy } from '@/i18n/invitation';
import { getBySlug } from '@/lib/invitations';
import { isValidSlug } from '@/lib/slug';
import { toInvitationView } from '@/lib/invitation-view';
import { formatEventDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

type Params = { params: Promise<{ slug: string }> };

/**
 * An invitation is frozen content once it is live. Nobody edits it during the event,
 * so there is nothing for a time based revalidation to catch, and the page is cached
 * until something explicitly throws it away.
 *
 * The list is empty on purpose. Invitations are created long after the build, so there
 * is nothing to pre render, and reaching for the database during a build would make
 * deployments fail whenever Supabase is briefly unavailable. Each slug is rendered on
 * its first request and cached from then on.
 *
 * Guests therefore never touch the database, which keeps function invocations near
 * zero and, usefully, means live invitations keep working through a database outage.
 * Activating or editing calls revalidatePath to rebuild the page: see
 * src/app/admin/actions.ts and the autosave route.
 */
export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

/**
 * Reads the invitation for a public slug, treating a database failure the same as a
 * missing row.
 *
 * Once stage 8 lands, a guest is served cached HTML and never reaches this at all. The
 * quiet failure matters for the window before that, and for the first request after a
 * cache eviction: an outage should show a neutral page, not a stack trace on a link
 * that has been sent to three hundred people.
 */
async function loadActiveInvitation(slug: string): Promise<Invitation | null> {
  // This route catches everything at the root, including /favicon.ico and any other
  // stray asset a browser decides to probe for. No generated slug ever contains a dot
  // or an uppercase letter, so anything failing this check cannot match a row, and
  // querying for it would spend a function invocation and a pooler connection to
  // confirm as much.
  if (!isValidSlug(slug)) return null;

  try {
    const invitation = await getBySlug(slug);
    if (!invitation) return null;
    return invitation.status === 'ACTIVE' ? invitation : null;
  } catch (error) {
    console.error('[invitation] lookup failed', slug, error);
    return null;
  }
}

/**
 * The WhatsApp preview. Every guest sees this before they decide whether to tap, so it
 * carries the names, the occasion, the date and the venue and nothing else.
 *
 * The image is generated once at activation and stored, which is stage 13.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await loadActiveInvitation(slug);

  if (!invitation) {
    return { title: 'qlty.events', robots: { index: false, follow: false } };
  }

  const copy = getInvitationCopy(invitation.invitationLang);
  const isArabic = invitation.invitationLang === 'AR';

  const title = `${invitation.name1} ${copy.nameSeparator} ${invitation.name2} | ${copy.eventName[invitation.eventType]}`;
  const date = formatEventDate(invitation.eventDate, invitation.invitationLang);
  const description = isArabic
    ? `${date} | ${invitation.venueName}`
    : `${date} at ${invitation.venueName}`;

  return {
    title,
    description,
    // The image itself is not listed here. It comes from opengraph-image.tsx alongside
    // this file, which Next links automatically. Setting images explicitly would
    // override that, and an empty array would override it with nothing.
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_EG' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function InvitationPage({ params }: Params) {
  const { slug } = await params;
  const invitation = await loadActiveInvitation(slug);

  if (!invitation) return <NotAvailable />;

  return (
    <>
      <InvitationShell view={toInvitationView(invitation)} />
      <ViewBeacon slug={invitation.slug} />
    </>
  );
}
