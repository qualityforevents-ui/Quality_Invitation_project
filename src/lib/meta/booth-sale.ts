import { sendMetaEvent } from './capi';
import { META_CURRENCY } from './events';
import { toUserData } from './request';
import { SITE_URL } from '@/lib/constants';
import type { BoothReservation } from '@/lib/types';

/**
 * Reports a confirmed booth booking to Meta.
 *
 * The twin of reportPurchase in ./sale.ts, and the same argument applies twice over.
 * There is no card checkout on this side either: the customer taps through to WhatsApp,
 * a human watches a deposit land, and somebody presses Confirm in the admin. That press
 * is the only moment in the system that means money arrived, so it is the only thing
 * allowed to be a Purchase.
 *
 * Exactly one caller: the admin's Confirm action.
 *
 * A Notion status change deliberately does not raise one, although a human moving a row
 * to Confirmed in Notion means the same thing. The reason is the import: the live
 * database holds six months of finished bookings, and the first sync would have
 * reported twenty six purchases in an afternoon, every one of them months old and none
 * of them attributable to any ad. A sale is reported when somebody presses the button
 * in the admin, and only then.
 *
 * The value reported is the whole booking, not the deposit. Meta is being told what the
 * sale is worth, and the rest of it arrives on the night. Reporting the deposit would
 * make a booth booking look like a cheaper sale than an invitation and teach the
 * algorithm to chase the wrong one.
 */
export async function reportBoothPurchase(reservation: BoothReservation): Promise<void> {
  /*
   * Deterministic, not random.
   *
   * Confirm can be pressed twice: a double tap, a retried server action, an operator
   * confirming something they had cancelled, or the admin and a Notion edit both
   * landing on Confirmed. Meta drops a repeat of an event id it has already seen inside
   * a 48 hour window, so deriving the id from the reservation makes every one of those
   * free. A fresh uuid would report a second five thousand pound sale each time, and
   * there is no way to withdraw a conversion once it has been sent.
   */
  const eventId = `booth-purchase-${reservation.id}`;

  await sendMetaEvent({
    eventName: 'Purchase',
    eventId,
    eventSourceUrl: `${SITE_URL}/photobooth`,
    /*
     * `system_generated`, not `website`. No browser took part: this is a server raising
     * an event about something that happened on WhatsApp and was confirmed in an admin
     * screen. Claiming a website event with no browser signals of its own is how an
     * integration earns a match quality score nobody can explain.
     */
    actionSource: 'system_generated',
    userData: toUserData(reservation.metaAttribution, {
      phone: reservation.customerPhone,
      /*
       * The status token, which is this customer's only identifier in a product with no
       * accounts. It is hashed before it leaves, like every other user field, so what
       * Meta receives is a stable pseudonym rather than a secret that would let the
       * holder open the customer's booking page.
       */
      externalId: reservation.statusToken,
    }),
    customData: {
      value: reservation.price,
      currency: META_CURRENCY,
      content_type: 'product',
      content_ids: [reservation.packageId],
      content_name: reservation.packageId,
      content_category: 'photobooth',
      num_items: 1,
      // The operator's own reference, so a conversion in Events Manager and a row in
      // the admin can be matched by hand when a number is disputed.
      order_id: reservation.bookingId,
    },
  });
}
