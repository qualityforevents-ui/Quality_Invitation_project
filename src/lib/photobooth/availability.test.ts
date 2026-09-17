import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  dayStatus,
  daysBetween,
  isBookable,
  isHoldExpired,
  isValidDateString,
  nextAvailableDates,
  occupancyFromReservations,
  occupiedUnits,
  statusOccupiesUnit,
  weekdayOf,
  EMPTY_OCCUPANCY,
  type Occupancy,
} from './availability';

/**
 * The rules that decide whether a Saturday is still for sale.
 *
 * Run with `npm test`. No database, no network and no clock: every function under test
 * is handed its "today" and its "now", which is the reason this file can exist at all
 * and the reason the Firestore half was kept in a different module.
 */

const SETTINGS = {
  unitCount: 2,
  minNoticeDays: 2,
  maxAdvanceDays: 365,
  closedWeekdays: [] as number[],
  blackoutDates: [] as string[],
};

const TODAY = '2026-03-10';

function occupancy(partial: Partial<Occupancy>): Occupancy {
  return { ...EMPTY_OCCUPANCY, ...partial };
}

describe('calendar maths', () => {
  it('moves forward and backward across a month boundary', () => {
    assert.equal(addDays('2026-03-31', 1), '2026-04-01');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  });

  it('handles a leap day', () => {
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addDays('2028-02-29', 1), '2028-03-01');
  });

  /*
   * The reason addDays works in UTC rather than in Africa/Cairo. Egypt puts its clocks
   * forward on the last Friday of April, so a Cairo day that week is 23 hours long and
   * naive millisecond arithmetic in local time would land back on the day it started.
   */
  it('does not lose a day across the Egyptian clock change', () => {
    const before = '2026-04-23';
    const seen = new Set<string>();
    let cursor = before;
    for (let i = 0; i < 10; i += 1) {
      cursor = addDays(cursor, 1);
      seen.add(cursor);
    }
    assert.equal(seen.size, 10, 'ten calls should produce ten distinct days');
    assert.equal(cursor, '2026-05-03');
  });

  it('counts days in both directions', () => {
    assert.equal(daysBetween('2026-03-10', '2026-03-13'), 3);
    assert.equal(daysBetween('2026-03-13', '2026-03-10'), -3);
    assert.equal(daysBetween('2026-03-10', '2026-03-10'), 0);
  });

  it('knows the weekday', () => {
    // 2026-03-14 is a Saturday.
    assert.equal(weekdayOf('2026-03-14'), 6);
    assert.equal(weekdayOf('2026-03-15'), 0);
  });

  it('rejects dates that are only shaped like dates', () => {
    assert.equal(isValidDateString('2026-03-10'), true);
    assert.equal(isValidDateString('2026-02-31'), false);
    assert.equal(isValidDateString('2026-13-01'), false);
    assert.equal(isValidDateString('10-03-2026'), false);
    assert.equal(isValidDateString(''), false);
    assert.equal(isValidDateString(null), false);
  });
});

describe('which statuses take a booth', () => {
  it('counts held, confirmed and blocked', () => {
    assert.equal(statusOccupiesUnit('HELD'), true);
    assert.equal(statusOccupiesUnit('CONFIRMED'), true);
    assert.equal(statusOccupiesUnit('BLOCKED'), true);
  });

  /*
   * The load bearing one. If a bare form submission took a unit, anyone with a browser
   * could close every Saturday for a year in an afternoon.
   */
  it('does not count a request that has not reached WhatsApp', () => {
    assert.equal(statusOccupiesUnit('REQUESTED'), false);
  });

  it('does not count a cancelled or completed booking', () => {
    assert.equal(statusOccupiesUnit('CANCELLED'), false);
    assert.equal(statusOccupiesUnit('COMPLETED'), false);
  });

  it('adds the three kinds together', () => {
    assert.equal(
      occupiedUnits({ unitsConfirmed: 1, unitsHeld: 1, unitsBlocked: 2 }),
      4,
    );
  });
});

describe('a day as the customer sees it', () => {
  const on = (date: string, occ: Partial<Occupancy> = {}, settings = SETTINGS) =>
    dayStatus({ date, today: TODAY, occupancy: occupancy(occ), settings });

  it('offers an empty day far enough out', () => {
    assert.equal(on('2026-03-20'), 'available');
  });

  it('says so when one booth is left', () => {
    assert.equal(on('2026-03-20', { unitsConfirmed: 1 }), 'last');
  });

  it('is full when every booth is taken', () => {
    assert.equal(on('2026-03-20', { unitsConfirmed: 2 }), 'full');
  });

  it('is full when the booths are taken by a mix of holds, bookings and blocks', () => {
    assert.equal(on('2026-03-20', { unitsHeld: 1, unitsBlocked: 1 }), 'full');
  });

  it('never offers the past', () => {
    assert.equal(on('2026-03-09'), 'unavailable');
  });

  it('never offers today or tomorrow, with two days of notice', () => {
    assert.equal(on('2026-03-10'), 'unavailable');
    assert.equal(on('2026-03-11'), 'unavailable');
    assert.equal(on('2026-03-12'), 'available');
  });

  it('respects a longer notice period', () => {
    const strict = { ...SETTINGS, minNoticeDays: 7 };
    assert.equal(on('2026-03-14', {}, strict), 'unavailable');
    assert.equal(on('2026-03-17', {}, strict), 'available');
  });

  it('stops at the far horizon', () => {
    assert.equal(on('2027-03-20'), 'unavailable');
  });

  it('closes a weekday that is configured closed', () => {
    const noSundays = { ...SETTINGS, closedWeekdays: [0] };
    assert.equal(on('2026-03-15', {}, noSundays), 'unavailable');
    assert.equal(on('2026-03-16', {}, noSundays), 'available');
  });

  it('closes a blacked out date', () => {
    const away = { ...SETTINGS, blackoutDates: ['2026-03-20'] };
    assert.equal(on('2026-03-20', {}, away), 'unavailable');
  });

  /*
   * Order matters. A day in the past with no bookings must not read as available just
   * because nothing is counted against it, and a blacked out day must not advertise
   * room it is never going to give anybody.
   */
  it('settles being closed before counting anything', () => {
    const away = { ...SETTINGS, blackoutDates: ['2026-03-20'] };
    assert.equal(on('2026-03-20', { unitsConfirmed: 0 }, away), 'unavailable');
    assert.equal(on('2026-03-09', { unitsConfirmed: 0 }), 'unavailable');
  });

  it('reports full rather than negative when a human has overbooked', () => {
    assert.equal(on('2026-03-20', { unitsConfirmed: 5 }), 'full');
  });

  it('knows which statuses can still be booked', () => {
    assert.equal(isBookable('available'), true);
    assert.equal(isBookable('last'), true);
    assert.equal(isBookable('full'), false);
    assert.equal(isBookable('unavailable'), false);
  });
});

describe('holds expiring', () => {
  const now = new Date('2026-03-10T12:00:00Z');

  it('has not expired while there is time left', () => {
    assert.equal(isHoldExpired(new Date('2026-03-10T13:00:00Z'), now), false);
  });

  it('has expired at the instant it runs out', () => {
    assert.equal(isHoldExpired(new Date('2026-03-10T12:00:00Z'), now), true);
  });

  it('treats a missing expiry as never expiring', () => {
    assert.equal(isHoldExpired(null, now), false);
  });
});

describe('rebuilding a day from its reservations', () => {
  const now = new Date('2026-03-10T12:00:00Z');
  const live = new Date('2026-03-10T18:00:00Z');
  const dead = new Date('2026-03-10T06:00:00Z');

  it('counts each kind into its own bucket', () => {
    const result = occupancyFromReservations(
      [
        { status: 'CONFIRMED', units: 1, holdExpiresAt: null },
        { status: 'HELD', units: 1, holdExpiresAt: live },
        { status: 'BLOCKED', units: 1, holdExpiresAt: null },
      ],
      now,
    );
    assert.deepEqual(result, { unitsConfirmed: 1, unitsHeld: 1, unitsBlocked: 1 });
  });

  /* The whole point of evaluating expiry on read. */
  it('gives back the unit held by an expired hold', () => {
    const result = occupancyFromReservations(
      [{ status: 'HELD', units: 1, holdExpiresAt: dead }],
      now,
    );
    assert.equal(occupiedUnits(result), 0);
  });

  it('ignores requests, cancellations and completed jobs', () => {
    const result = occupancyFromReservations(
      [
        { status: 'REQUESTED', units: 1, holdExpiresAt: null },
        { status: 'CANCELLED', units: 1, holdExpiresAt: null },
        { status: 'COMPLETED', units: 1, holdExpiresAt: null },
      ],
      now,
    );
    assert.equal(occupiedUnits(result), 0);
  });

  it('counts a booking that takes two booths as two', () => {
    const result = occupancyFromReservations(
      [{ status: 'CONFIRMED', units: 2, holdExpiresAt: null }],
      now,
    );
    assert.equal(result.unitsConfirmed, 2);
  });

  /* A row written before `units` existed, or by a hand edit in Notion that cleared it. */
  it('treats a missing or zero unit count as one booth', () => {
    const result = occupancyFromReservations(
      [{ status: 'CONFIRMED', units: 0, holdExpiresAt: null }],
      now,
    );
    assert.equal(result.unitsConfirmed, 1);
  });
});

describe('suggesting the next free dates', () => {
  it('skips the days that are full and returns the next three', () => {
    const full = new Set(['2026-03-21', '2026-03-22']);

    const dates = nextAvailableDates({
      from: '2026-03-20',
      today: TODAY,
      settings: SETTINGS,
      occupancyFor: (date) =>
        full.has(date) ? occupancy({ unitsConfirmed: 2 }) : EMPTY_OCCUPANCY,
    });

    assert.deepEqual(dates, ['2026-03-23', '2026-03-24', '2026-03-25']);
  });

  it('starts after the date it was given, never on it', () => {
    const dates = nextAvailableDates({
      from: '2026-03-20',
      today: TODAY,
      settings: SETTINGS,
      occupancyFor: () => EMPTY_OCCUPANCY,
      count: 1,
    });
    assert.deepEqual(dates, ['2026-03-21']);
  });

  it('returns what it found rather than looping forever when nothing is free', () => {
    const dates = nextAvailableDates({
      from: '2026-03-20',
      today: TODAY,
      settings: SETTINGS,
      occupancyFor: () => occupancy({ unitsConfirmed: 2 }),
      horizon: 30,
    });
    assert.deepEqual(dates, []);
  });
});
