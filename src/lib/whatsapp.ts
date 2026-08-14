import { PRICE_EGP, whatsappLink } from './constants';
import type { Lang } from '@/generated/prisma/enums';

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
}: {
  lang: Lang;
  requestId: string;
  name1: string;
  name2: string;
}): string {
  if (lang === 'AR') {
    return [
      'السلام عليكم',
      `رقم الطلب: ${requestId}`,
      `دعوة: ${name1} و ${name2}`,
      `المبلغ: ${PRICE_EGP} جنيه`,
      '',
      'برجاء إرفاق صورة التحويل مع الرسالة',
    ].join('\n');
  }

  return [
    'Hello',
    `Request ID: ${requestId}`,
    `Invitation: ${name1} & ${name2}`,
    `Amount: ${PRICE_EGP} EGP`,
    '',
    'Please attach the transfer screenshot with this message',
  ].join('\n');
}

export function buildPaymentLink(args: {
  lang: Lang;
  requestId: string;
  name1: string;
  name2: string;
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
