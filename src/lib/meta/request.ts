import { cookies, headers } from 'next/headers';
import type { MetaUserData } from './capi';
import type { MetaAttribution } from '@/lib/types';

/**
 * Pulls everything Meta can match a visitor on out of the incoming request.
 *
 * Kept apart from capi.ts on purpose. This file can only run where `next/headers` works
 * — a route handler, a server component, a server action — while capi.ts is pure and
 * can be called from anywhere, including the admin action that reports a purchase long
 * after the customer's browser has gone. Merging them would drag a request context
 * requirement into the one place that has no request.
 */

/** Set by the pixel on first load. The browser's id, valid for ninety days. */
export const FBP_COOKIE = '_fbp';

/**
 * Set by the pixel when somebody arrives with an `fbclid` in the URL, which is what a
 * Meta ad click looks like. The strongest attribution signal available: an event
 * carrying this is tied to a specific ad, not merely to a person.
 */
export const FBC_COOKIE = '_fbc';

/**
 * The visitor's real address, dug out of the proxy chain.
 *
 * Vercel sits in front of every request, so the socket address is Vercel's. The first
 * entry in x-forwarded-for is the client; everything after it is infrastructure. Taking
 * the last entry — a mistake that looks identical in local testing, where the list has
 * one item — reports a data centre and matches nobody.
 */
function clientIp(headerList: Headers): string | null {
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headerList.get('x-real-ip') || null;
}

export type RequestSignals = {
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  userAgent: string | null;
};

export async function readRequestSignals(): Promise<RequestSignals> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  return {
    fbp: cookieStore.get(FBP_COOKIE)?.value ?? null,
    fbc: cookieStore.get(FBC_COOKIE)?.value ?? null,
    clientIp: clientIp(headerList),
    userAgent: headerList.get('user-agent'),
  };
}

/**
 * What gets written onto the invitation document so a purchase can be attributed later.
 *
 * This is the part that makes the whole integration work for this particular product.
 * Payment is settled by a human on WhatsApp and the sale is confirmed by the operator
 * pressing Activate in the admin, possibly the next day, from a different device, in a
 * session that has none of the customer's cookies. By then the browser signals are
 * unreachable — unless they were saved at the moment the customer was still here. So
 * they are, and the Purchase sent at activation carries the same `_fbc` the original ad
 * click wrote. Without this the biggest conversion in the funnel is the one Meta cannot
 * attribute to any ad.
 */
export function toStoredAttribution(
  signals: RequestSignals,
  sourceUrl: string | null,
): MetaAttribution {
  return {
    fbp: signals.fbp,
    fbc: signals.fbc,
    clientIp: signals.clientIp,
    userAgent: signals.userAgent,
    sourceUrl,
  };
}

/**
 * Whether a newly captured set of signals is worth a database write.
 *
 * The browser mirrors every event through the API route, so without this the site would
 * write the same four cookie values onto the same document on every page view and every
 * step of the flow. Firestore charges per write and none of those repeats say anything
 * new.
 *
 * An upgrade is worth storing: a visitor who arrives with no `_fbc`, browses, and then
 * comes back through an ad has a click id now where there was none before, and that is
 * the value the eventual Purchase most wants to carry.
 */
export function isAttributionUpgrade(
  stored: MetaAttribution | null,
  fresh: MetaAttribution,
): boolean {
  if (!stored) return Boolean(fresh.fbp || fresh.fbc);
  if (fresh.fbc && fresh.fbc !== stored.fbc) return true;
  if (fresh.fbp && !stored.fbp) return true;
  return false;
}

/** Folds stored signals and a phone number into the shape the CAPI sender wants. */
export function toUserData(
  attribution: MetaAttribution | null,
  extra: { phone?: string | null; externalId?: string | null } = {},
): MetaUserData {
  return {
    phone: extra.phone ?? null,
    externalId: extra.externalId ?? null,
    fbp: attribution?.fbp ?? null,
    fbc: attribution?.fbc ?? null,
    clientIp: attribution?.clientIp ?? null,
    userAgent: attribution?.userAgent ?? null,
  };
}
