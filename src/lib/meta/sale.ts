import { sendMetaEvent } from './capi';
import { META_CURRENCY } from './events';
import { toUserData } from './request';
import { packagePrice } from '@/lib/packages';
import { SITE_URL } from '@/lib/constants';
import type { Invitation } from '@/lib/types';

/**
 * Reports a confirmed sale to Meta.
 *
 * There is exactly one caller — the admin action that activates an invitation — and
 * that is the whole design. This product has no card checkout: the customer taps
 * through to WhatsApp, a human settles the payment, and the operator presses Activate.
 * That press is the only event in the system that means money arrived, so it is the
 * only thing allowed to be a Purchase. Everything earlier is intent, and intent is
 * reported under its own names.
 *
 * The cost of being correct here is a delay of hours between the click and the
 * conversion. That is fine: Meta attributes within a seven day click window, so a sale
 * confirmed the next morning is still credited to the ad that produced it, provided the
 * event carries the click. Which is what `metaAttribution` on the invitation is for —
 * captured while the customer was still on the site, because by now their browser is
 * long gone and this code is running in the operator's session, on the operator's
 * machine, with the operator's cookies.
 */
export async function reportPurchase(invitation: Invitation): Promise<void> {
  /*
   * Deterministic, not random.
   *
   * An activation can be run twice — a double click, a retried server action, an
   * operator reactivating something after fixing a rejection. Meta drops a repeat of an
   * event id it has already seen within a 48 hour window, so deriving the id from the
   * invitation makes those repeats free. A fresh uuid here would report a second sale
   * on every one of them, and there is no way to withdraw a conversion once sent.
   */
  const eventId = `purchase-${invitation.id}`;

  await sendMetaEvent({
    eventName: 'Purchase',
    eventId,
    // Where the sale was actually made, so the numbers in Events Manager point at
    // something a person can open.
    eventSourceUrl: `${SITE_URL}/${invitation.slug}`,
    /*
     * `system_generated`, not `website`. No browser took part in this: it is a server
     * raising an event about something that happened on WhatsApp and was confirmed in
     * an admin screen. Meta treats the two differently when it judges data quality, and
     * claiming a website event with no browser signals of its own is how an integration
     * ends up with a poor match quality score it cannot explain.
     */
    actionSource: 'system_generated',
    userData: toUserData(invitation.metaAttribution, {
      phone: invitation.customerPhone,
      externalId: invitation.editToken,
    }),
    customData: {
      value: packagePrice(invitation.package),
      currency: META_CURRENCY,
      content_type: 'product',
      content_ids: [invitation.package],
      content_name: invitation.package,
      // The one server side event that is not built through metaTrack, so the category
      // the type system enforces everywhere else has to be written by hand here.
      content_category: 'invitation',
      num_items: 1,
      // The operator's own reference for this sale, so a conversion in Events Manager
      // and a row in the admin can be matched up by hand when a number is disputed.
      order_id: invitation.requestId,
    },
  });
}
