import { whatsappLink } from './constants';
import { BOOTH_WHATSAPP_NUMBER } from './photobooth/config';
import { getPackage } from './packages';
import type { Lang, Package } from '@/lib/types';

/**
 * The message the customer sends the operator alongside their transfer.
 *
 * The reminder to attach the screenshot is the last line on purpose. A prefilled
 * wa.me link cannot carry an attachment, and the screenshot is the only thing that
 * lets the operator match a transfer to a request, so the instruction sits where it
 * will still be on screen when the customer starts typing.
 *
 * The language follows the builder language, not the invitation language. Somebody
 * building an English card for their guests may well want to message in Arabic.
 */
export function buildPaymentMessage({
  lang,
  requestId,
  name1,
  name2,
  packageId,
}: {
  lang: Lang;
  requestId: string;
  name1: string;
  name2: string;
  packageId: Package;
}): string {
  // Named as well as priced. The operator is matching a transfer against a tier, and
  // "500" alone does not say which package was bought.
  const tier = getPackage(packageId);

  if (lang === 'AR') {
    return [
      'السلام عليكم',
      `رقم الطلب: ${requestId}`,
      `دعوة: ${name1} و ${name2}`,
      `الباقة: ${tier.nameAr}`,
      `المبلغ: ${tier.price} جنيه`,
      '',
      'عايز أكمل الطلب ده',
    ].join('\n');
  }

  return [
    'Hello',
    `Request ID: ${requestId}`,
    `Invitation: ${name1} & ${name2}`,
    `Package: ${tier.nameEn}`,
    `Amount: ${tier.price} EGP`,
    '',
    'I would like to go ahead with this request',
  ].join('\n');
}

export function buildPaymentLink(args: {
  lang: Lang;
  requestId: string;
  name1: string;
  name2: string;
  packageId: Package;
}): string {
  return whatsappLink(buildPaymentMessage(args));
}

/**
 * A link that opens a chat with the customer, used by the operator from the admin.
 *
 * Distinct from whatsappLink, which always addresses the operator's own number. Using
 * that one here would open the operator a chat with themselves, containing the message
 * they meant to send somebody else.
 *
 * Numbers are stored in Egyptian local form, "01xxxxxxxxx", and wa.me needs them in
 * international form without a plus.
 */
export function customerWhatsappLink(localPhone: string, message = ''): string {
  const digits = localPhone.replace(/\D/g, '');
  const international = digits.startsWith('20') ? digits : `20${digits.replace(/^0/, '')}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${international}${query}`;
}

/** Support message for the waiting screen, which quotes the request id. */
export function buildSupportMessage(lang: Lang, requestId: string): string {
  return lang === 'AR'
    ? `السلام عليكم، عندي استفسار عن طلب رقم ${requestId}`
    : `Hello, I have a question about request ${requestId}`;
}

/**
 * The nudge to somebody who built an invitation and never paid.
 *
 * Deliberately not a sales pitch. They already chose names, a date and a venue and then
 * stopped, which usually means a question they did not ask rather than a decision they
 * made, so this opens the door and says nothing about money. The request id is in it
 * because the reply comes back without one otherwise, and then the operator is searching
 * for a name.
 */
export function buildDraftNudgeMessage(requestId: string, name1: string, name2: string): string {
  const couple = [name1, name2].filter(Boolean).join(' و ');

  return [
    'السلام عليكم',
    couple ? `بخصوص دعوة ${couple}` : 'بخصوص الدعوة اللي بدأتوها',
    `رقم الطلب: ${requestId}`,
    '',
    'لقيناها لسه مش مكتملة. لو في أي حاجة محتاجين مساعدة فيها، إحنا هنا.',
  ].join('\n');
}

/* ---------------------------------------------------------------- photo booth */

/**
 * The message a customer sends to confirm a booth booking.
 *
 * Shaped like buildPaymentMessage and for the same reason: the operator is matching a
 * transfer against a job, from a WhatsApp thread, on a phone. The booking id leads
 * because it is the only thing that is unique; a date and a name are not, and "the
 * Saturday one" is how a double booking starts.
 *
 * The date is the plain stored string rather than a formatted one. This message is read
 * by the operator and by the customer, and a localised date in a WhatsApp thread is one
 * more thing that can disagree with what the calendar recorded.
 */
export function buildBoothBookingMessage({
  lang,
  bookingId,
  eventDate,
  startTime,
  packageName,
  venue,
  price,
  deposit,
}: {
  lang: Lang;
  bookingId: string;
  eventDate: string;
  startTime: string;
  packageName: string;
  venue: string;
  price: number;
  deposit: number;
}): string {
  if (lang === 'AR') {
    return [
      'السلام عليكم',
      `رقم الحجز: ${bookingId}`,
      `فوتوبوث يوم: ${eventDate}`,
      `الساعة: ${startTime}`,
      `الباقة: ${packageName}`,
      `المكان: ${venue}`,
      `الإجمالي: ${price} جنيه`,
      `العربون: ${deposit} جنيه`,
      '',
      'عايز أأكد الحجز ده',
    ].join('\n');
  }

  return [
    'Hello',
    `Booking ID: ${bookingId}`,
    `Photo booth on: ${eventDate}`,
    `Start time: ${startTime}`,
    `Package: ${packageName}`,
    `Venue: ${venue}`,
    `Total: ${price} EGP`,
    `Deposit: ${deposit} EGP`,
    '',
    'I would like to confirm this booking',
  ].join('\n');
}

/** Opens a chat with the booth number, which falls back to the main one. */
export function boothWhatsappLink(message: string): string {
  return `https://wa.me/${BOOTH_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Support message for the booth status page, which quotes the booking id. */
export function buildBoothSupportMessage(lang: Lang, bookingId: string): string {
  return lang === 'AR'
    ? `السلام عليكم، عندي استفسار عن حجز الفوتوبوث رقم ${bookingId}`
    : `Hello, I have a question about photo booth booking ${bookingId}`;
}
