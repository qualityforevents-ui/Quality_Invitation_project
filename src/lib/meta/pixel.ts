'use client';

import {
  META_CURRENCY,
  isBrowserReportable,
  isStandardEvent,
  newEventId,
  type MetaEventName,
} from './events';

/**
 * The browser half of the Meta integration.
 *
 * Every call here does two things: it fires the pixel, and it posts the same event to
 * this app's own server so the Conversions API can send a second copy. Both copies
 * carry the same event id, which is what tells Meta they are one conversion rather than
 * two. That pairing is the entire reason this is a module and not three lines of `fbq`
 * scattered through the components — the moment a call site fires `fbq` directly, it
 * fires a conversion the server never mirrors, and the funnel quietly develops a hole
 * exactly where an ad blocker is installed.
 *
 * Nothing in here throws. Analytics that can break a wedding invitation builder is
 * worse than no analytics.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export function isPixelConfigured(): boolean {
  return META_PIXEL_ID.length > 0;
}

type Fbq = {
  (...args: unknown[]): void;
  queue?: unknown[];
  loaded?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const MIRROR_ENDPOINT = '/api/meta/event';

/**
 * Mirrors one event to the server, which forwards it to the Conversions API.
 *
 * The parameters are sent, but who the visitor is deliberately is not: the cookies, the
 * address and the user agent all arrive with the request on their own, and the phone
 * number is read out of the draft server side. Nothing personal is put into this body,
 * so nothing personal is sitting in a request the browser's own devtools will show to
 * whoever is looking over the customer's shoulder.
 *
 * `keepalive` matters more than it looks. The two most valuable events in this funnel —
 * the WhatsApp handoff and the step that reveals payment — happen at the exact instant
 * the page navigates away, and a normal fetch is cancelled by that navigation. This is
 * the same reason the confirm call beside it in the payment panel sets the flag.
 */
function mirror(
  eventName: MetaEventName,
  eventId: string,
  params: Record<string, unknown> | undefined,
): void {
  try {
    void fetch(MIRROR_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: params ?? {},
      }),
      keepalive: true,
    }).catch(() => {
      // A dropped report is a dropped report. It is not worth a console full of red on
      // a customer's screen, and there is nothing useful to retry into.
    });
  } catch {
    // Same.
  }
}

/**
 * Reports one event from the browser and from the server, as a single conversion.
 *
 * Returns the event id, which callers almost never need — it exists so a test can
 * assert the two copies agree.
 */
export function metaTrack(
  eventName: MetaEventName,
  params?: Record<string, unknown>,
): string | null {
  if (typeof window === 'undefined') return null;

  /*
   * A guard rather than a trusting call. `Purchase` is server-only in this product,
   * because payment is settled by a human on WhatsApp and a browser cannot know that
   * money arrived. If it ever gets called from here it is a mistake, and a mistake that
   * inflates every revenue number in the ad account rather than breaking visibly.
   */
  if (!isBrowserReportable(eventName)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[meta/pixel] ${eventName} is reported server side only. Ignored.`);
    }
    return null;
  }

  const eventId = newEventId();

  try {
    // The pixel may legitimately be absent: no id configured, or an ad blocker removed
    // it. The server copy still goes out, which is most of the point of sending two.
    if (window.fbq) {
      window.fbq(
        isStandardEvent(eventName) ? 'track' : 'trackCustom',
        eventName,
        params ?? {},
        { eventID: eventId },
      );
    }
  } catch {
    // Never let a reporting call take a click handler down with it.
  }

  mirror(eventName, eventId, params);

  /*
   * Visible in development, silent in production.
   *
   * Wiring a pixel up is otherwise done blind: the pixel's own network calls are the
   * first thing an ad blocker hides, Events Manager lags by minutes, and the server copy
   * leaves no trace in the browser at all. One line per event, carrying the id that ties
   * the two copies together, turns "is this firing?" into something answerable by
   * opening the console.
   */
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[meta] ${eventName}`, { eventId, ...(params ?? {}) });
  }

  return eventId;
}

/** A priced event's parameters, so no call site has to remember the currency. */
export function priced(value: number, extra?: Record<string, unknown>): Record<string, unknown> {
  return { value, currency: META_CURRENCY, ...extra };
}
