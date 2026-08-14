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
 * Holds the editToken. httpOnly, so only the server reads it. This is the whole of
 * the "returning visitor resumes automatically" mechanism, and the reason there is
 * no customer login anywhere in this product.
 */
export const EDIT_TOKEN_COOKIE = 'qlty_edit';

/** Remembers the builder language across visits. Readable by the client. */
export const UI_LANG_COOKIE = 'qlty_lang';

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const DEFAULT_THEME_ID = 'classic';

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
