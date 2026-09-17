/**
 * The single vocabulary of everything this product reports to Meta.
 *
 * Both halves of the integration import from here: the browser pixel in
 * lib/meta/pixel.ts and the Conversions API sender in lib/meta/capi.ts. That is the
 * point of the file. An event Meta can attribute has to arrive from both sides under
 * the same name and the same id, and the fastest way to lose a conversion is for one
 * side to say `InitiateCheckout` while the other says `Checkout`. Neither side is
 * allowed to invent a string; both read these constants.
 *
 * Meta divides events into two kinds and treats them very differently:
 *
 *   Standard events are the fixed list it recognises. Only these can be optimised for,
 *   used as a campaign objective, or given a value it will compute ROAS from.
 *
 *   Custom events are anything else. They are recorded and can be built into audiences
 *   and custom conversions, but the ad algorithm cannot bid toward them directly.
 *
 * So the rule followed here: the moments that are worth money are standard events, and
 * the moments that describe how somebody moved through the builder are custom ones.
 * Naming a builder step `Purchase` to make it optimisable would work exactly once and
 * then wreck every number in the account.
 */

/** Everything this product sells is priced in Egyptian pounds. */
export const META_CURRENCY = 'EGP';

/**
 * Which service an event belongs to.
 *
 * Sent as `content_category` on every event this product reports, without exception.
 * QLTY sells two things at very different prices, and without this the account has one
 * undifferentiated funnel: a three hundred pound invitation and an eight thousand pound
 * booth booking both arrive as "a Lead", the algorithm optimises for whichever is
 * easier to get, and the custom conversions cannot be split apart afterwards because
 * the events were never labelled in the first place.
 *
 * "home" is its own value rather than being left off. An event from the home is a
 * visitor who has not chosen yet, and that is a real and useful population.
 */
export const CONTENT_CATEGORIES = ['invitation', 'photobooth', 'home'] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

/**
 * Meta's own list, as far as this product uses it.
 *
 * `PageView` is included even though the base pixel snippet fires it on its own,
 * because this app is a single page application: the snippet's automatic PageView
 * happens on the first document load and never again, and every navigation after that
 * is a client side route change the snippet cannot see.
 */
export const STANDARD_EVENTS = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Lead',
  'Contact',
  'Purchase',
] as const;

/**
 * This product's own steps.
 *
 * `FlowStep` carries which question was reached in its parameters rather than being
 * fifteen separate event names. Meta caps an account at a few hundred distinct event
 * names and its reporting gets unreadable long before that cap; one event with a
 * `step_name` parameter is filterable in Events Manager, buildable into an audience
 * through a custom conversion, and does not consume the budget.
 */
export const CUSTOM_EVENTS = [
  /** Tapped Start on the hero. The flow has begun. */
  'StartFlow',
  /** Reached a question. Carries step_name, step_index, step_total, progress_percent. */
  'FlowStep',
  /** Opened the live card, either from the design question or the preview question. */
  'PreviewOpened',
  /** Tapped through to WhatsApp to settle payment. Intent, not money. */
  'PaymentHandoff',
  /** Came back to a builder that already had a draft in it. */
  'FlowResumed',
  /** Chose one of the two services from the home. Carries content_category. */
  'ServiceSelected',
  /** Picked a date on the booth calendar. Carries date_status, which is the useful half:
      a visitor who keeps landing on "full" is a visitor we are losing to capacity. */
  'AvailabilityChecked',
  /** Tapped through to WhatsApp to confirm a booth booking. Intent, not money. The
      booth's counterpart to PaymentHandoff, kept separate so the two funnels can be
      read apart in Events Manager without unpicking a content_category filter. */
  'BoothWhatsAppHandoff',
] as const;

export type StandardEvent = (typeof STANDARD_EVENTS)[number];
export type CustomEvent = (typeof CUSTOM_EVENTS)[number];
export type MetaEventName = StandardEvent | CustomEvent;

const STANDARD = new Set<string>(STANDARD_EVENTS);
const KNOWN = new Set<string>([...STANDARD_EVENTS, ...CUSTOM_EVENTS]);

export function isStandardEvent(name: string): name is StandardEvent {
  return STANDARD.has(name);
}

/**
 * Whether a name is one this app is allowed to report.
 *
 * Used by the API route that mirrors browser events to the Conversions API. That route
 * is a public endpoint that speaks to Meta with a server token, so what it will forward
 * is an allowlist rather than whatever arrives in the body. Without this, the endpoint
 * is a way for anyone on the internet to write arbitrary events, and `Purchase` most of
 * all, into the ad account's dataset.
 */
export function isKnownEvent(name: unknown): name is MetaEventName {
  return typeof name === 'string' && KNOWN.has(name);
}

/**
 * Events the browser is never allowed to ask the server to send.
 *
 * `Purchase` is reported once, server side, from the admin action that activates an
 * invitation, because that is the only moment in this product where money is known to
 * have arrived. Payment is settled by a human on WhatsApp, so a browser claiming a
 * purchase is a browser claiming something it cannot possibly know.
 */
const SERVER_ONLY = new Set<string>(['Purchase']);

export function isBrowserReportable(name: string): boolean {
  return KNOWN.has(name) && !SERVER_ONLY.has(name);
}

/**
 * The id that ties the browser's copy of an event to the server's copy.
 *
 * Every meaningful event in this app is sent twice on purpose: once from the pixel,
 * which carries the browser's cookies and survives nothing else, and once from the
 * Conversions API, which survives ad blockers, Safari's cookie expiry and iOS. Meta
 * collapses the pair back into one conversion when, and only when, both carry the same
 * event name and the same event id. Get it wrong and every number in the account is
 * double what it should be.
 */
export function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
