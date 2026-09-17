import { NextResponse } from 'next/server';
import { sendMetaEvent } from '@/lib/meta/capi';
import { isBrowserReportable, isKnownEvent } from '@/lib/meta/events';
import {
  isAttributionUpgrade,
  readRequestSignals,
  toStoredAttribution,
  toUserData,
} from '@/lib/meta/request';
import { getByEditToken, recordMetaAttribution } from '@/lib/invitations';
import { getEditToken } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Mirrors one browser event to Meta's Conversions API.
 *
 * Every event the pixel fires is also posted here, carrying the same event id, so Meta
 * receives two copies and collapses them into one conversion. The point is the copies
 * that arrive alone: an ad blocker or Safari's cookie expiry silences the pixel, and
 * this request still lands, because it is a first party call to this site's own origin.
 *
 * The browser sends only the event name, its id and its parameters. Who the visitor is
 * is worked out here instead — the Meta cookies and the address come in with the
 * request, and the phone number is read out of the draft the editToken cookie points
 * at. A browser is never asked to tell the server who it is, because a browser that can
 * assert its own identity to a reporting endpoint is a browser that can assert somebody
 * else's.
 *
 * Always answers 204. The caller is fire and forget, and a visitor has no business
 * learning anything about the ad account from a failed report.
 */
export async function POST(request: Request) {
  const signals = await readRequestSignals();

  /*
   * A public endpoint that speaks to Meta holding a server token, so it is rate limited.
   * Without it, one script can spend an afternoon writing events into the dataset and
   * the cost is not a bill, it is a pixel whose audiences and optimisation are polluted
   * with traffic that never existed — and unlike a bad bill, that cannot be refunded.
   *
   * Sixty an hour is generous next to real use: a customer who works through the whole
   * builder in one sitting fires somewhere around twenty five.
   */
  const key = `meta:${signals.clientIp ?? 'unknown'}`;
  if (!checkRateLimit(key, 60, 60 * 60 * 1000).allowed) {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const { eventName, eventId, eventSourceUrl, customData } = (body ?? {}) as {
    eventName?: unknown;
    eventId?: unknown;
    eventSourceUrl?: unknown;
    customData?: unknown;
  };

  /*
   * An allowlist, not a pass-through. This route holds a token that can write anything
   * into the dataset, so the event name has to be one of the names this app actually
   * reports — and `Purchase`, which only the admin's activation raises, is refused even
   * though it is a name this app knows. A browser cannot know that money arrived.
   */
  if (!isKnownEvent(eventName) || !isBrowserReportable(eventName)) {
    return new NextResponse(null, { status: 204 });
  }

  if (typeof eventId !== 'string' || eventId.length < 8 || eventId.length > 100) {
    // No usable id means Meta cannot pair this with the pixel's copy, and an unpaired
    // copy is a double count. Dropping it is the conservative failure.
    return new NextResponse(null, { status: 204 });
  }

  const sourceUrl = typeof eventSourceUrl === 'string' ? eventSourceUrl.slice(0, 1000) : null;

  try {
    // The draft on this device, when there is one. It carries the phone number Meta
    // matches on and the editToken that serves as a stable id for this customer.
    const token = await getEditToken();
    const invitation = token ? await getByEditToken(token) : null;

    if (invitation) {
      const fresh = toStoredAttribution(signals, sourceUrl);
      // Written only when it says something the stored copy does not, so a customer
      // working through fifteen questions does not cost fifteen writes of the same
      // four values.
      if (isAttributionUpgrade(invitation.metaAttribution, fresh)) {
        await recordMetaAttribution(invitation.id, fresh).catch((error) => {
          console.error('[api/meta/event] could not store attribution', error);
        });
      }
    }

    await sendMetaEvent({
      eventName,
      eventId,
      eventSourceUrl: sourceUrl,
      actionSource: 'website',
      userData: toUserData(
        {
          fbp: signals.fbp,
          fbc: signals.fbc,
          clientIp: signals.clientIp,
          userAgent: signals.userAgent,
          sourceUrl,
        },
        {
          phone: invitation?.customerPhone ?? null,
          // The editToken, which is already this product's stand-in for a customer
          // account. It never leaves the server unhashed, and Meta only ever sees the
          // digest, so using it here tells Meta "these events are one person" without
          // telling it anything about who.
          externalId: invitation?.editToken ?? null,
        },
      ),
      customData:
        customData && typeof customData === 'object'
          ? (customData as Record<string, unknown>)
          : undefined,
    });
  } catch (error) {
    console.error('[api/meta/event] failed', error);
  }

  return new NextResponse(null, { status: 204 });
}
