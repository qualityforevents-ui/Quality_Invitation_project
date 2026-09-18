export const PRICE_EGP = 300;

/** Every event this product serves happens in Egypt. */
export const EVENT_TIMEZONE = 'Africa/Cairo';

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201010014346';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qlty.events').replace(
  /\/+$/,
  '',
);

/*
 * The InstaPay and Vodafone Cash configuration used to live here: an app link, an
 * address, a recipient name, a dialer code, and a clipboard copy on every pay button.
 *
 * All of it is gone. Payment is a conversation now — the customer taps through to
 * WhatsApp with the request id and the amount already written, and a person settles it.
 * Card payments are coming and will replace that; nothing in between is worth the three
 * apps and four steps the old flow asked a customer to get right.
 *
 * The constants were already unused by every component before being deleted here.
 */

/**
 * Holds the editToken. httpOnly, so only the server reads it. This is the whole of
 * the "returning visitor resumes automatically" mechanism, and the reason there is
 * no customer login anywhere in this product.
 */
export const EDIT_TOKEN_COOKIE = 'qlty_edit';

/**
 * Holds the booth booking's statusToken. httpOnly, the invitations cookie's twin.
 *
 * Separate from qlty_edit rather than shared, because one person can legitimately be
 * both: a couple who booked the booth and also built an invitation. One cookie holding
 * whichever token was written last would lose them one of the two.
 */
export const BOOTH_STATUS_COOKIE = 'qlty_booth';

/** Remembers the builder language across visits. Readable by the client. */
export const UI_LANG_COOKIE = 'qlty_lang';

/**
 * How far through the flow this device got, as a section id.
 *
 * The flow is one page now, so "where was I" is no longer answerable from the URL, and
 * it cannot be inferred from the row either: createDraft writes a default event date and
 * a default time into every draft it creates, so a stored date is not evidence that
 * anybody chose one. Guessing wrong is not a small cost, it means a returning customer
 * either gets asked again for what they already answered or, worse, sees a date they
 * never picked sitting in their answers as though they had.
 *
 * A cookie rather than a column, deliberately. The database is shared by three people
 * and a migration alters the live schema for all of them, which is not a thing to spend
 * on a resume hint. It is also the same shape of state as the language cookie beside it:
 * per device, not per customer, and losing it costs a few taps and nothing else.
 *
 * Readable by the client so the flow can write it without a round trip. It holds no
 * secret; the editToken beside it is the thing that is httpOnly.
 */
export const FLOW_STEP_COOKIE = 'qlty_step';

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const DEFAULT_THEME_ID = 'hadiqa';

/**
 * How long a link stays live after the event. Guests reopen invitations for a while
 * afterwards to look at the photo, so this is deliberately generous.
 */
export const DEFAULT_EXPIRY_DAYS_AFTER_EVENT = 30;

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function publicInvitationUrl(slug: string): string {
  return `${SITE_URL}/${slug}`;
}

export function editUrl(editToken: string): string {
  return `${SITE_URL}/edit/${editToken}`;
}

export function statusUrl(editToken: string): string {
  return `${SITE_URL}/build/status/${editToken}`;
}

/** Where a customer watches their booth booking. Addressed by the secret status token. */
export function boothStatusUrl(statusToken: string): string {
  return `${SITE_URL}/photobooth/request/${statusToken}`;
}

/**
 * Review length limits.
 *
 * Here rather than in lib/reviews because the submission form is a client component,
 * and importing them from a module that touches the Admin SDK drags firebase-admin into
 * the browser bundle. The build fails on dns, fs and net, which is a confusing way to
 * discover you crossed the server boundary for two numbers.
 */
export const REVIEW_MAX_BODY = 400;
export const REVIEW_MAX_NAME = 60;
