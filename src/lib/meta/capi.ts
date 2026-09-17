import { createHash } from 'node:crypto';
import { META_CURRENCY, type MetaEventName } from './events';

/**
 * The server half of the Meta integration: the Conversions API.
 *
 * The browser pixel on its own has not been a complete picture for years. Safari caps
 * the _fbp cookie at seven days, every ad blocker on the market removes the pixel
 * outright, and iOS strips a large share of what is left. Somewhere between a quarter
 * and a half of real conversions never reach Meta from the browser alone, and the ones
 * lost are not random — they skew toward exactly the mobile traffic this product lives
 * on. Sending the same events from here, server to server, is what closes that gap.
 *
 * Two rules keep this honest and both are enforced below:
 *
 *   Nothing here ever throws into a caller. Reporting a conversion is not worth failing
 *   a customer's request over. Every failure is logged and swallowed.
 *
 *   Personal data is hashed before it leaves this file. Meta requires SHA-256 of a
 *   normalised value for every matching field, and sending a raw phone number would be
 *   both a rejected payload and a thing this product has no business doing.
 */

const GRAPH_VERSION = 'v21.0';

/** The dataset id. Same number as the pixel id; Meta renamed it, not you. */
const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/**
 * A system user access token from Events Manager, not a page token and not the pixel id.
 *
 * Server side only — deliberately without the NEXT_PUBLIC_ prefix, because a token with
 * this prefix would be inlined into the JavaScript bundle and handed to every visitor,
 * and anyone holding it can write events into the ad account.
 */
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';

/**
 * Routes events to the Test Events tab in Events Manager instead of live reporting.
 *
 * Set it while wiring this up so you can watch events arrive and confirm the browser
 * and server copies are being deduplicated, then unset it. Left set in production, no
 * conversion ever reaches the live dataset and every campaign optimises on nothing.
 */
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

export function isCapiConfigured(): boolean {
  return Boolean(PIXEL_ID && ACCESS_TOKEN);
}

/**
 * SHA-256 of a normalised value, which is the only form Meta accepts for matching.
 *
 * Normalisation is not cosmetic: Meta hashes its own copy the same way and compares the
 * digests, so " Ahmed@Example.COM " and "ahmed@example.com" have to become the same
 * string here or the match simply fails and the conversion is attributed to nobody.
 */
function hash(value: string | null | undefined): string | null {
  const normalised = (value ?? '').trim().toLowerCase();
  if (!normalised) return null;
  return createHash('sha256').update(normalised).digest('hex');
}

/**
 * An Egyptian phone number in the form Meta expects: digits only, country code included,
 * no plus sign, before hashing.
 *
 * The builder stores whatever the customer typed, which in Egypt is usually a local
 * 01xxxxxxxxx. Hashed as typed it matches nothing, because the number Meta holds for
 * that person came off a profile that carries the country code.
 */
function hashPhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return null;

  const withCountry = digits.startsWith('20')
    ? digits
    : digits.startsWith('0')
      ? `20${digits.slice(1)}`
      : `20${digits}`;

  return createHash('sha256').update(withCountry).digest('hex');
}

/**
 * Everything known about who did this, in Meta's field names.
 *
 * The two cookie values matter more than anything else here. `_fbp` is the browser id
 * the pixel sets, and `_fbc` encodes the click that brought somebody here — when an ad
 * click lands on the site with an `fbclid` in the URL, that is what turns into `_fbc`,
 * and it is the single strongest attribution signal there is. An event sent without it
 * can still be matched, but an event sent with it is attributed to a specific ad.
 */
export type MetaUserData = {
  phone?: string | null;
  /** Stable per-customer id. The invitation's editToken, hashed. */
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  country?: string | null;
};

function buildUserData(user: MetaUserData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  const ph = hashPhone(user.phone);
  if (ph) data.ph = [ph];

  const externalId = hash(user.externalId);
  if (externalId) data.external_id = [externalId];

  // Two letter ISO, hashed like every other matching field. Every event this product
  // serves is an Egyptian one, so this is a free improvement to the match quality.
  const country = hash(user.country ?? 'eg');
  if (country) data.country = [country];

  // Not hashed. Meta treats these four as connection data rather than personal data,
  // and hashing them makes the payload invalid rather than more private.
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;
  if (user.clientIp) data.client_ip_address = user.clientIp;
  if (user.userAgent) data.client_user_agent = user.userAgent;

  return data;
}

export type MetaServerEvent = {
  eventName: MetaEventName;
  /** Must be identical to the browser copy's id, or the pair is counted twice. */
  eventId: string;
  /** Seconds, not milliseconds. Meta rejects anything older than seven days. */
  eventTime?: number;
  eventSourceUrl?: string | null;
  /**
   * Where the event physically happened. `website` for anything a browser did;
   * `system_generated` for the Purchase raised by the admin activating an invitation,
   * because no browser was involved in that at all and claiming otherwise misreports it.
   */
  actionSource?: 'website' | 'system_generated';
  userData: MetaUserData;
  customData?: Record<string, unknown>;
};

/**
 * Sends one event and returns whether Meta accepted it.
 *
 * Awaited by callers that can afford the round trip and left as a floating promise by
 * the ones that cannot. It never rejects either way.
 */
export async function sendMetaEvent(event: MetaServerEvent): Promise<boolean> {
  if (!isCapiConfigured()) {
    // Not an error. The integration is simply not configured yet, which is the normal
    // state of a local checkout, and shouting about it on every page view is noise.
    return false;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: event.actionSource ?? 'website',
        ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
        user_data: buildUserData(event.userData),
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
  };

  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        // This is reporting. It must never hold a customer's request open.
        signal: AbortSignal.timeout(4000),
      },
    );

    if (!response.ok) {
      // The body carries Meta's actual complaint — a malformed hash, an expired token,
      // an event older than seven days — and without it every failure looks the same.
      const body = await response.text().catch(() => '');
      console.error(`[meta/capi] ${event.eventName} rejected (${response.status})`, body.slice(0, 500));
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[meta/capi] ${event.eventName} failed`, error);
    return false;
  }
}

/** The shape every purchase-like event carries. Currency is never optional to Meta. */
export function purchaseData(value: number, extra?: Record<string, unknown>): Record<string, unknown> {
  return { value, currency: META_CURRENCY, ...extra };
}
