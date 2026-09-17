import { boothReservationHistory, boothReservations } from '@/lib/db';
import { revalidateBoothAvailability } from '@/lib/photobooth/cache';
import {
  createReservation,
  getReservationById,
  updateReservation,
} from '@/lib/photobooth/reservations';
import { boothDeposit, matchPackageByPrice } from '@/lib/photobooth/config';
import { isValidDateString } from '@/lib/photobooth/availability';
import { createPage, getPage, isNotionConfigured, updatePage, type NotionPage } from './client';
import { fromNotionPage, hashReservation, toNotionProperties } from './booth-schema';
import type { BoothReservation } from '@/lib/types';

/**
 * Keeping Firestore and Notion saying the same thing.
 *
 * Two systems that can both be edited is a distributed system with a human at each end,
 * and the three problems that come with it are all solved here rather than hoped away:
 *
 *   Echoes. Every write to Notion comes straight back as a webhook. The hash of the
 *   synced fields is stored on the reservation; an inbound page that hashes to the same
 *   value is our own write returning and is dropped.
 *
 *   Conflicts. Notion's last_edited_time is compared against the reservation's
 *   updatedAt, and the newer one wins. The loser is written into a history
 *   subcollection rather than discarded, because "the date changed back on its own" is
 *   otherwise an unanswerable support question.
 *
 *   Failure. Every push can fail, so every reservation carries a syncState. A failed
 *   push leaves it 'error' with the reason; the reconcile job retries everything that
 *   is not 'ok'. Nothing is ever lost because a request timed out.
 */

/* ---------------------------------------------------------------- outbound */

/**
 * Pushes one reservation to Notion, creating its page if it has none.
 *
 * Never throws. Called from `after()` on a request the customer is waiting on, and from
 * a cron job; in neither place should a Notion outage become a failure the caller sees.
 * The failure is recorded on the row instead, where the reconcile job will find it.
 */
export async function pushReservationToNotion(id: string): Promise<void> {
  if (!isNotionConfigured()) return;

  const reservation = await getReservationById(id);
  if (!reservation) return;

  try {
    const properties = toNotionProperties(reservation);

    const page = reservation.notionPageId
      ? await updatePage(reservation.notionPageId, properties)
      : await createPage(properties);

    /*
     * The hash is taken from what was sent, and stored with the page's new
     * last_edited_time. Together they are what lets the webhook this write is about to
     * trigger be recognised as an echo and ignored.
     *
     * Written straight to the document rather than through updateReservation, which
     * would run the day recounting transaction for a change that cannot affect any
     * day's occupancy, and would bump updatedAt and so make this row look newer than
     * the Notion page it just agreed with.
     */
    await boothReservations().doc(id).update({
      notionPageId: page.id,
      notionLastEditedTime: new Date(page.last_edited_time),
      syncHash: hashReservation(reservation),
      lastSyncedAt: new Date(),
      syncState: 'ok',
      syncError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[notion] push failed for ${reservation.bookingId}`, error);

    await boothReservations()
      .doc(id)
      .update({ syncState: 'error', syncError: message.slice(0, 500) })
      .catch(() => {
        // The database is unreachable too. Nothing useful is left to do here, and
        // throwing would take down the request this is running after.
      });
  }
}

/* ----------------------------------------------------------------- inbound */

export type InboundResult =
  | { action: 'created'; id: string }
  | { action: 'updated'; id: string }
  | { action: 'cancelled'; id: string }
  | { action: 'ignored'; reason: string };

/**
 * Brings one Notion page into Firestore.
 *
 * Fetches the page rather than trusting a webhook body, because webhook payloads do not
 * carry properties: they say which page changed and leave the reading to us. That is
 * also what makes this safe to call from the reconcile job, which has only a page.
 */
export async function pullPageFromNotion(pageId: string): Promise<InboundResult> {
  if (!isNotionConfigured()) return { action: 'ignored', reason: 'not configured' };

  let page: NotionPage;
  try {
    page = await getPage(pageId);
  } catch (error) {
    // A page we cannot read is usually one that was deleted or unshared between the
    // webhook firing and this running. Treated as a deletion below by the caller.
    console.error(`[notion] could not read page ${pageId}`, error);
    return { action: 'ignored', reason: 'unreadable' };
  }

  if (page.in_trash || page.archived) {
    return cancelForDeletedPage(pageId);
  }

  const incoming = fromNotionPage(page);
  const existing = await findByNotionPageOrBookingId(pageId, incoming.bookingId);

  if (!existing) return createFromNotion(page, incoming);

  /*
   * The echo guard.
   *
   * The site wrote this page a moment ago, Notion fired a webhook about it, and what
   * has come back is byte for byte what was sent. Writing it again would trigger
   * another webhook, and so on until something rate limits.
   */
  const incomingHash = hashReservation(mergeOntoReservation(existing, incoming));
  if (existing.syncHash && incomingHash === existing.syncHash) {
    return { action: 'ignored', reason: 'unchanged' };
  }

  /*
   * The conflict rule: newer wins, by comparing Notion's own clock against ours.
   *
   * A minute of slack, because the two clocks are not the same clock and a push that
   * lands at the same moment as an admin edit should not flip back and forth. Without
   * it, two systems a few hundred milliseconds apart can each decide the other is
   * stale.
   */
  const notionEditedAt = new Date(page.last_edited_time);
  const siteIsNewer = existing.updatedAt.getTime() > notionEditedAt.getTime() + 60_000;

  if (siteIsNewer) {
    // Notion loses, but is not silently thrown away: what it said is kept so somebody
    // can answer "I changed it in Notion and it changed back".
    await recordLosingVersion(existing.id, 'notion', incoming, notionEditedAt);
    return { action: 'ignored', reason: 'site is newer' };
  }

  await recordLosingVersion(existing.id, 'site', existing, existing.updatedAt);

  const merged = mergeOntoReservation(existing, incoming);

  await updateReservation(existing.id, {
    status: merged.status,
    eventDate: merged.eventDate,
    startTime: merged.startTime,
    hours: merged.hours,
    price: merged.price,
    depositAmount: merged.depositAmount,
    depositPaid: merged.depositPaid,
    customerName: merged.customerName,
    customerPhone: merged.customerPhone,
    venue: merged.venue,
    eventType: merged.eventType,
    notes: merged.notes,
    notionPageId: pageId,
    notionLastEditedTime: notionEditedAt,
    syncHash: incomingHash,
    lastSyncedAt: new Date(),
    syncState: 'ok',
    syncError: null,
  });

  revalidateBoothAvailability();

  return { action: 'updated', id: existing.id };
}

/**
 * A page created by hand in Notion, with no booking id.
 *
 * Perfectly valid, and the common way the operator will block out a week they are away
 * or record a booking taken over the phone. The site assigns the booking id and writes
 * it back, which is what the push at the end does.
 */
async function createFromNotion(
  page: NotionPage,
  incoming: ReturnType<typeof fromNotionPage>,
): Promise<InboundResult> {
  if (!incoming.eventDate || !isValidDateString(incoming.eventDate)) {
    // A row with no date is somebody part way through typing. Not an error, and not
    // something that can become a booking yet.
    return { action: 'ignored', reason: 'no date' };
  }

  /*
   * The tier is inferred from the price, because the operator's database has no package
   * column: it has a price select, and the price is what the conversation was actually
   * about. matchPackageByPrice finds the nearest tier so the admin has something to
   * show, and the price itself is stored as given rather than being rounded to a tier.
   */
  const price = incoming.price ?? 0;
  const tier = matchPackageByPrice(price);

  const created = await createReservation({
    eventDate: incoming.eventDate,
    startTime: incoming.startTime ?? '20:00',
    hours: incoming.hours ?? tier.hours,
    // Notion has no unit column. Every hand written row is one job.
    units: 1,
    packageId: tier.id,
    price: price || tier.price,
    depositAmount: incoming.depositAmount ?? boothDeposit(price || tier.price),
    extras: null,
    customerName: incoming.customerName || 'Notion',
    customerPhone: incoming.customerPhone ?? '',
    venue: incoming.venue ?? '',
    // No area column either. Left empty rather than guessed at from the venue text.
    area: '',
    eventType: incoming.eventType ?? '',
    notes: incoming.notes,
    lang: 'AR',
    source: 'notion',
    metaAttribution: null,
    /*
     * Whatever Notion says, and when it says nothing, something that holds the date.
     *
     * This is the most consequential default in the integration. A row in the operator's
     * Bookings database is a commitment they have already made, whether or not a deposit
     * has landed: three of the live rows are future weddings with the deposit box
     * unticked, and the operator is certainly not expecting the website to resell those
     * nights. Defaulting to REQUESTED would leave them holding nothing and the first
     * anybody would hear of it is two couples arriving at the same venue.
     *
     * CONFIRMED for a row with a customer's name on it, BLOCKED for one without, which
     * is how "Blocked" and the two empty rows in the live data read. `depositPaid` still
     * carries the truth about the money, separately, straight from the checkbox.
     *
     * Note that this does not raise a Purchase. Only the admin's own Confirm button
     * does, which is what stops importing six months of history from reporting twenty
     * six sales to Meta on a Tuesday afternoon.
     */
    status: incoming.status ?? (incoming.customerName ? 'CONFIRMED' : 'BLOCKED'),
  });

  await boothReservations().doc(created.id).update({
    notionPageId: page.id,
    notionLastEditedTime: new Date(page.last_edited_time),
    syncState: 'pending',
  });

  // Writes the booking id the site just minted back into the page.
  await pushReservationToNotion(created.id);

  revalidateBoothAvailability();

  return { action: 'created', id: created.id };
}

/**
 * A page that was deleted or moved to the trash in Notion.
 *
 * Cancelled, never hard deleted. A booking is a commitment to a person, and a row that
 * vanishes because somebody tidied a Notion view is not evidence that the commitment
 * ended. Cancelling gives the date back, which is the part that matters operationally,
 * and leaves the record and the reason behind.
 */
async function cancelForDeletedPage(pageId: string): Promise<InboundResult> {
  const snapshot = await boothReservations().where('notionPageId', '==', pageId).limit(1).get();
  if (snapshot.empty) return { action: 'ignored', reason: 'no reservation for page' };

  const id = snapshot.docs[0].id;
  const existing = await getReservationById(id);
  if (!existing || existing.status === 'CANCELLED') {
    return { action: 'ignored', reason: 'already cancelled' };
  }

  await recordLosingVersion(id, 'site', existing, existing.updatedAt);

  await updateReservation(id, {
    status: 'CANCELLED',
    cancelReason: 'removed in Notion',
    syncState: 'ok',
    lastSyncedAt: new Date(),
  });

  revalidateBoothAvailability();

  return { action: 'cancelled', id };
}

/* ------------------------------------------------------------------ helpers */

async function findByNotionPageOrBookingId(
  pageId: string,
  bookingId: string | null,
): Promise<BoothReservation | null> {
  const byPage = await boothReservations().where('notionPageId', '==', pageId).limit(1).get();
  if (!byPage.empty) return getReservationById(byPage.docs[0].id);

  /*
   * A page with a booking id but no link to a reservation.
   *
   * Happens when somebody duplicates a row in Notion, and when the import script runs
   * against bookings that already exist. Matching on the booking id adopts the page
   * instead of creating a second reservation for a booking that already has one.
   */
  if (!bookingId) return null;

  const byBooking = await boothReservations().where('bookingId', '==', bookingId).limit(1).get();
  return byBooking.empty ? null : getReservationById(byBooking.docs[0].id);
}

/**
 * Notion's version laid over ours, field by field, keeping ours where Notion said
 * nothing.
 *
 * An empty Notion property means "not filled in", not "cleared". A human who has not
 * typed a venue into a row must not wipe the venue the customer entered on the site.
 * Only `depositPaid` is taken as given, because a checkbox genuinely has two states and
 * unticking one is a deliberate act.
 */
function mergeOntoReservation(
  existing: BoothReservation,
  incoming: ReturnType<typeof fromNotionPage>,
): BoothReservation {
  return {
    ...existing,
    status: incoming.status ?? existing.status,
    eventDate: incoming.eventDate ?? existing.eventDate,
    startTime: incoming.startTime ?? existing.startTime,
    hours: incoming.hours ?? existing.hours,
    price: incoming.price ?? existing.price,
    depositAmount: incoming.depositAmount ?? existing.depositAmount,
    depositPaid: incoming.depositPaid,
    customerName: incoming.customerName || existing.customerName,
    customerPhone: incoming.customerPhone ?? existing.customerPhone,
    venue: incoming.venue ?? existing.venue,
    eventType: incoming.eventType ?? existing.eventType,
    notes: incoming.notes ?? existing.notes,
    /*
     * Untouched by Notion, because Notion has no column for any of them. The area, the
     * unit count, the package id and where the booking came from are the site's own
     * knowledge, and an inbound edit must not quietly blank them.
     */
    units: existing.units,
    packageId: existing.packageId,
    area: existing.area,
  };
}

/**
 * Keeps whichever version lost a conflict.
 *
 * Small and append only. The alternative is that a booking's date changes, nobody can
 * explain why, and the only record of what it used to be is in somebody's memory of
 * what they typed.
 */
async function recordLosingVersion(
  reservationId: string,
  losingSide: 'site' | 'notion',
  version: unknown,
  editedAt: Date,
): Promise<void> {
  try {
    await boothReservationHistory(reservationId).add({
      losingSide,
      editedAt,
      recordedAt: new Date(),
      version: JSON.parse(JSON.stringify(version ?? {})),
    });
  } catch (error) {
    // History is a courtesy to a future support conversation. It is never worth
    // failing a sync that is otherwise working.
    console.error('[notion] could not record the losing version', error);
  }
}
