import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';
import { buildSampleView } from '@/lib/sample';
import { getBySlug } from '@/lib/invitations';
import { isValidSlug } from '@/lib/slug';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'qlty.events';

/**
 * Cached with the page rather than computed per request.
 *
 * Every guest who is sent this link makes WhatsApp fetch this image, so a wedding with
 * three hundred guests would otherwise mean three hundred renders of the same picture.
 * Activating or editing the invitation calls revalidatePath on the route, which throws
 * this away along with the HTML and rebuilds both.
 */
export const revalidate = false;

export default async function InvitationOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const invitation = isValidSlug(slug) ? await getBySlug(slug).catch(() => null) : null;

  // A slug with no live invitation still has to return an image, because the metadata
  // already promised one. A neutral card is better than a broken image icon sitting in
  // a WhatsApp thread.
  if (!invitation || invitation.status !== 'ACTIVE' || !invitation.eventDate) {
    const fallback = buildSampleView('AR');
    return renderOgImage({
      name1: 'qlty',
      name2: 'events',
      eventType: fallback.eventType,
      eventDate: fallback.eventDate,
      venueName: 'qlty.events',
      lang: 'AR',
      themeId: fallback.themeId,
    });
  }

  return renderOgImage({
    name1: invitation.name1,
    name2: invitation.name2,
    eventType: invitation.eventType,
    eventDate: invitation.eventDate,
    venueName: invitation.venueName,
    lang: invitation.invitationLang,
    themeId: invitation.themeId,
  });
}
