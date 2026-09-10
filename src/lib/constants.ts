export const PRICE_EGP = 300;

/** Every event this product serves happens in Egypt. */
export const EVENT_TIMEZONE = 'Africa/Cairo';

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201010014346';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qlty.events').replace(
  /\/+$/,
  '',
);

export const INSTAPAY_ADDRESS = process.env.NEXT_PUBLIC_INSTAPAY_ADDRESS || 'qlty@instapay';
export const INSTAPAY_NAME = process.env.NEXT_PUBLIC_INSTAPAY_NAME || 'QLTY EVENTS';

/**
 * What the two pay buttons open.
 *
 * Both are configuration rather than constants, and that is the whole point. Neither
 * InstaPay nor Vodafone Cash publishes a documented link that opens their app with a
 * recipient and an amount already filled in, so what actually works has to be found on a
 * real phone and pasted in here rather than guessed at in the source. The defaults open
 * each app and nothing more.
 *
 * Because that is all they can be relied on to do, every pay button copies the recipient
 * to the clipboard as it opens the app. If the app lands on its own home screen, the
 * address is already waiting to be pasted, which is the difference between an awkward
 * payment and an impossible one.
 *
 * Vodafone Cash is off unless a number is set. A payment method that has not been
 * configured is worse than one that is missing: it takes the customer into an app with
 * nowhere to send the money.
 */
/**
 * The InstaPay payment link, e.g. https://ipn.eg/S/<handle>/instapay/<code>.
 *
 * Empty by default, and deliberately not `instapay://`. That bare scheme was the
 * default here for a long time and it is not a link to anything: it opens the app on
 * its own home screen with no recipient, no amount and nothing to confirm, which every
 * customer reads as the pay button being broken. An unset link now renders no button at
 * all, and the address underneath — which is what they actually need — is promoted.
 */
export const INSTAPAY_APP_LINK = process.env.NEXT_PUBLIC_INSTAPAY_LINK || '';

export const VODAFONE_CASH_NUMBER = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || '';

/** `*9#` opens the Vodafone Cash menu in the dialer. `#` has to be percent encoded. */
export const VODAFONE_CASH_LINK = process.env.NEXT_PUBLIC_VODAFONE_CASH_LINK || 'tel:*9%23';

/**
 * Holds the editToken. httpOnly, so only the server reads it. This is the whole of
 * the "returning visitor resumes automatically" mechanism, and the reason there is
 * no customer login anywhere in this product.
 */
export const EDIT_TOKEN_COOKIE = 'qlty_edit';

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
