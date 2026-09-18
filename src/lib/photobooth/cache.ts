import { revalidateTag } from 'next/cache';

/**
 * The one tag every cached view of the calendar carries.
 *
 * Named once, here, because it is written in two places that must agree: the cache
 * wrapper around the availability read, and every code path that changes a booking. A
 * typo in either is invisible. The calendar simply keeps serving a date that has been
 * sold, and nobody finds out until two couples arrive on the same Saturday.
 */
export const BOOTH_AVAILABILITY_TAG = 'booth-availability';

/**
 * Called after anything that changes what the calendar should say: a request, a hold, a
 * confirmation, a cancellation, a date change, a block, a settings edit, or an inbound
 * Notion webhook.
 *
 * `'max'` rather than the bare one argument call, which Next 16 deprecated. It marks
 * the tag stale and serves the old answer while fetching the new one, so a visitor
 * never waits on a revalidation somebody else's booking triggered. The stale window is
 * the same sixty seconds the cache already allows, and it is survivable for exactly one
 * reason: the calendar is advisory. Nothing is actually sold by reading it. The booking
 * transaction re-checks the day under a lock and refuses if it has gone, so the worst a
 * stale square can do is cost one customer one apologetic message with three other
 * dates in it.
 */
export function revalidateBoothAvailability(): void {
  /*
   * Tolerates being called with no request around it.
   *
   * `revalidateTag` reaches for Next's per request store and throws an invariant when
   * there is not one. Every path that changes a booking funnels through here, and two
   * of them are plain Node processes rather than requests: `npm run notion:import` and
   * anything else run from scripts/. Without this guard the import throws after the
   * reservation has already been written, which leaves the database correct, the
   * script reporting total failure, and somebody re-running it to fix a problem that
   * does not exist.
   *
   * Swallowing it is right rather than merely convenient: outside a request there is no
   * rendered cache to invalidate, so there is nothing being skipped. The running site
   * picks the change up through the sixty second expiry, and the reconcile job that
   * follows an import runs inside a route handler where the call works normally.
   */
  try {
    revalidateTag(BOOTH_AVAILABILITY_TAG, 'max');
  } catch {
    // No request context. See above.
  }
}
