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
  revalidateTag(BOOTH_AVAILABILITY_TAG, 'max');
}
