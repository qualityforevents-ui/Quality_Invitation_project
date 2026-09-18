import type { BoothDay, BoothSettings, BoothStatus } from '@/lib/types';

/**
 * Whether a booth can be booked on a given day, and why not when it cannot.
 *
 * Every function here is pure. Nothing in this file reads Firestore, reads the clock
 * without being handed it, or knows what a transaction is, and that is deliberate: this
 * is the one piece of booth logic where being wrong means selling the same Saturday
 * twice, and logic that can only be exercised by standing up a database is logic that
 * does not get exercised. The Firestore side lives in ./reservations.ts and calls into
 * these.
 *
 * Dates are Cairo calendar days as "YYYY-MM-DD" strings throughout, never Date objects.
 * See the note on BoothReservation.eventDate for why.
 */

export type DayStatus =
  /** Bookable. */
  | 'available'
  /** Bookable, and this is the last booth. Said out loud to the customer. */
  | 'last'
  /** Every booth is taken. */
  | 'full'
  /** Not offered at all: in the past, inside the notice period, closed, or blacked out. */
  | 'unavailable';

/** The counters, as they are needed here. A BoothDay satisfies this. */
export type Occupancy = Pick<BoothDay, 'unitsConfirmed' | 'unitsHeld' | 'unitsBlocked'>;

export const EMPTY_OCCUPANCY: Occupancy = {
  unitsConfirmed: 0,
  unitsHeld: 0,
  unitsBlocked: 0,
};

/**
 * The statuses that take a booth off the calendar.
 *
 * REQUESTED is deliberately not among them. Somebody filling in a form has not yet
 * spoken to us and may never; letting a form submission close a Saturday night would
 * hand anyone with a browser the ability to empty the calendar. The unit is taken at
 * the WhatsApp handoff instead, which is the first act that costs the customer
 * something and involves a real conversation.
 */
const OCCUPYING: ReadonlySet<BoothStatus> = new Set<BoothStatus>([
  'HELD',
  'CONFIRMED',
  'BLOCKED',
]);

export function statusOccupiesUnit(status: BoothStatus): boolean {
  return OCCUPYING.has(status);
}

export function occupiedUnits(occupancy: Occupancy): number {
  return occupancy.unitsConfirmed + occupancy.unitsHeld + occupancy.unitsBlocked;
}

/* ------------------------------------------------------------- calendar maths */

/**
 * Day arithmetic on the calendar, not on a timeline.
 *
 * Done in UTC on purpose, which looks wrong for a Cairo product and is not. These
 * strings are calendar days with no time in them, so the only thing the arithmetic has
 * to get right is "what is the next day", and UTC is the one zone with no daylight
 * saving to make a day 23 hours long. Egypt does observe DST, so doing this in
 * Africa/Cairo would produce a day that has two of one date or none of another, twice a
 * year, and the calendar would skip a day in April.
 */
export function addDays(date: string, days: number): string {
  const time = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(time)) throw new Error(`addDays: not a date: ${date}`);
  return new Date(time + days * 86_400_000).toISOString().slice(0, 10);
}

/** Whole days from one calendar day to another. Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) throw new Error('daysBetween: not a date');
  return Math.round((b - a) / 86_400_000);
}

/** JavaScript day number, 0 = Sunday, for a "YYYY-MM-DD" string. */
export function weekdayOf(date: string): number {
  const time = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(time)) throw new Error(`weekdayOf: not a date: ${date}`);
  return new Date(time).getUTCDay();
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  /*
   * Two separate checks, and both are needed.
   *
   * "2026-13-01" matches the shape and parses to NaN, so the guard has to come before
   * any use of the Date. Calling toISOString on it throws a RangeError rather than
   * returning something falsy, and this function is reached from a public query string:
   * that throw is a 500 on the availability endpoint for anybody who types a URL badly.
   *
   * "2026-02-31" matches the shape and parses fine, to the 3rd of March. Round tripping
   * is what catches a day that does not exist in the month it claims.
   */
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time)) return false;

  return new Date(time).toISOString().slice(0, 10) === value;
}

/* ------------------------------------------------------------------- the rule */

/**
 * A hold that has run out stops holding anything.
 *
 * Expiry is evaluated on read rather than by a job that sweeps the database, because
 * the alternative is a calendar that shows a date as taken for up to fifteen minutes
 * after it became free. The sweep still exists in the reconcile job, to make the stored
 * counters agree with what every reader has already been computing, but no correctness
 * depends on it having run.
 */
export function isHoldExpired(holdExpiresAt: Date | null, now: Date): boolean {
  return holdExpiresAt !== null && holdExpiresAt.getTime() <= now.getTime();
}

export type DayStatusInput = {
  date: string;
  /** Today in Cairo. Passed in, never read from the clock here. */
  today: string;
  occupancy: Occupancy;
  settings: Pick<
    BoothSettings,
    'unitCount' | 'minNoticeDays' | 'maxAdvanceDays' | 'closedWeekdays' | 'blackoutDates'
  >;
};

/**
 * What one day looks like to a customer.
 *
 * The order of these checks is the design. Everything that makes a day not offered at
 * all is settled before anything is counted, so a day in the past reads as
 * "unavailable" rather than "available" merely because nobody has booked it, and a
 * blacked out day never advertises that it has room.
 */
export function dayStatus({ date, today, occupancy, settings }: DayStatusInput): DayStatus {
  const offset = daysBetween(today, date);

  // The past, and today, and however many days of notice the booth needs. A booth has
  // to be loaded, driven and built by people, so "tonight" is not a thing we sell.
  if (offset < settings.minNoticeDays) return 'unavailable';

  if (offset > settings.maxAdvanceDays) return 'unavailable';

  if (settings.closedWeekdays.includes(weekdayOf(date))) return 'unavailable';

  if (settings.blackoutDates.includes(date)) return 'unavailable';

  const free = settings.unitCount - occupiedUnits(occupancy);

  if (free <= 0) return 'full';

  /*
   * "Last booth" is only information when there is more than one.
   *
   * A business that owns a single booth would otherwise have every free night on the
   * calendar labelled "last one", which is true, useless, and indistinguishable from
   * the scarcity theatre that fake booking sites run. Somebody looking at a month of
   * identical warnings learns to ignore the one night it would actually have mattered
   * on. With two or more booths the label means what it says: one is gone.
   */
  if (free === 1 && settings.unitCount > 1) return 'last';

  return 'available';
}

export function isBookable(status: DayStatus): boolean {
  return status === 'available' || status === 'last';
}

/**
 * The next few days somebody could actually book.
 *
 * Handed to a customer whose chosen date was taken between the page loading and the
 * form being submitted. "That date has gone" is a dead end; "that date has gone, here
 * are the next three" is a booking that still happens.
 */
export function nextAvailableDates({
  from,
  today,
  occupancyFor,
  settings,
  count = 3,
  horizon = 120,
}: {
  from: string;
  today: string;
  /** Whatever is known about a day. Unknown days are empty, which is the common case. */
  occupancyFor: (date: string) => Occupancy;
  settings: DayStatusInput['settings'];
  count?: number;
  /** How far to look before giving up, in days. */
  horizon?: number;
}): string[] {
  const found: string[] = [];

  for (let offset = 1; offset <= horizon && found.length < count; offset += 1) {
    const date = addDays(from, offset);
    if (isBookable(dayStatus({ date, today, occupancy: occupancyFor(date), settings }))) {
      found.push(date);
    }
  }

  return found;
}

/**
 * The counters for a day, recomputed from the reservations that touch it.
 *
 * The stored BoothDay is a cache. This is the truth it is a cache of, and the reconcile
 * job uses it to repair drift. Expired holds count for nothing here, which is what
 * makes a stale HELD row release its unit without anything having to sweep it.
 */
export function occupancyFromReservations(
  reservations: readonly { status: BoothStatus; units: number; holdExpiresAt: Date | null }[],
  now: Date,
): Occupancy {
  let unitsConfirmed = 0;
  let unitsHeld = 0;
  let unitsBlocked = 0;

  for (const reservation of reservations) {
    const units = Math.max(1, reservation.units);

    switch (reservation.status) {
      case 'CONFIRMED':
        unitsConfirmed += units;
        break;
      case 'HELD':
        if (!isHoldExpired(reservation.holdExpiresAt, now)) unitsHeld += units;
        break;
      case 'BLOCKED':
        unitsBlocked += units;
        break;
      default:
        // REQUESTED, COMPLETED and CANCELLED hold nothing. COMPLETED is in the past by
        // definition and CANCELLED gave its unit back when it was cancelled.
        break;
    }
  }

  return { unitsConfirmed, unitsHeld, unitsBlocked };
}
