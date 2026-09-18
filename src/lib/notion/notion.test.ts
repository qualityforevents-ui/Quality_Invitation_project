import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signNotionBody, verifyNotionSignature } from './signature';
import {
  formatNotionTime,
  parseNotionPrice,
  parseNotionTime,
  statusFromNotion,
  syncHashOf,
  type SyncedFields,
} from './booth-schema';

/**
 * The two pure pieces of the Notion integration that are worth being certain about.
 *
 * The signature check is the only thing between a public URL and a token that can
 * rewrite every booking. The sync hash is the only thing stopping the two systems
 * writing to each other in a loop. Neither needs a network or a database to test, and
 * both fail in ways that are invisible until they matter.
 */

/*
 * Obviously not a real token. It was the example from Notion's own webhook
 * documentation, which is public, but a credential shaped string sitting in a
 * repository is a secret scanner alert and a minute of somebody's worry either way.
 */
const SECRET = 'test-verification-token-not-a-real-secret';

describe('webhook signature', () => {
  const body = JSON.stringify({ type: 'page.properties_updated', entity: { id: 'abc' } });

  it('accepts a body signed with the right secret', () => {
    assert.equal(
      verifyNotionSignature({
        rawBody: body,
        signature: signNotionBody(body, SECRET),
        secret: SECRET,
      }),
      true,
    );
  });

  it('refuses a body signed with a different secret', () => {
    assert.equal(
      verifyNotionSignature({
        rawBody: body,
        signature: signNotionBody(body, 'some other secret'),
        secret: SECRET,
      }),
      false,
    );
  });

  /* The attack this whole mechanism exists for: a real signature, a changed body. */
  it('refuses a body that was altered after signing', () => {
    const signature = signNotionBody(body, SECRET);
    const tampered = JSON.stringify({
      type: 'page.properties_updated',
      entity: { id: 'somebody-elses-page' },
    });

    assert.equal(
      verifyNotionSignature({ rawBody: tampered, signature, secret: SECRET }),
      false,
    );
  });

  it('refuses a missing signature', () => {
    assert.equal(verifyNotionSignature({ rawBody: body, signature: null, secret: SECRET }), false);
  });

  /*
   * Never true when the secret is unset. Without this, an environment that forgot
   * NOTION_WEBHOOK_SECRET would verify every request against an empty key, which is to
   * say it would accept anything from anyone.
   */
  it('refuses everything when the secret is empty', () => {
    assert.equal(
      verifyNotionSignature({ rawBody: body, signature: signNotionBody(body, ''), secret: '' }),
      false,
    );
  });

  /* timingSafeEqual throws on a length mismatch rather than returning false. */
  it('refuses a signature of the wrong length without throwing', () => {
    assert.equal(
      verifyNotionSignature({ rawBody: body, signature: 'sha256=short', secret: SECRET }),
      false,
    );
  });
});

describe('the sync hash that stops the loop', () => {
  const fields: SyncedFields = {
    bookingId: 'QLB-7K4M9P',
    status: 'CONFIRMED',
    eventDate: '2026-06-12',
    startTime: '20:00',
    hours: 4,
    price: 2999,
    depositAmount: 500,
    depositPaid: true,
    customerName: 'Moaaz',
    customerPhone: '01012345678',
    venue: 'Fairmont',
    eventType: 'Wedding',
    notes: null,
  };

  it('is stable for the same booking', () => {
    assert.equal(syncHashOf(fields), syncHashOf({ ...fields }));
  });

  it('changes when the date changes', () => {
    assert.notEqual(syncHashOf(fields), syncHashOf({ ...fields, eventDate: '2026-06-13' }));
  });

  it('changes when the status changes', () => {
    assert.notEqual(syncHashOf(fields), syncHashOf({ ...fields, status: 'CANCELLED' }));
  });

  it('changes when the deposit is ticked', () => {
    assert.notEqual(syncHashOf(fields), syncHashOf({ ...fields, depositPaid: false }));
  });

  it('treats an absent note and an empty note as the same', () => {
    assert.equal(syncHashOf({ ...fields, notes: null }), syncHashOf({ ...fields, notes: '' }));
  });

  /*
   * The reason the hash is built from an explicitly ordered array rather than from
   * JSON.stringify of the object: two different bookings must not collide because one
   * field's text ran into the next.
   */
  it('does not collide when text is shuffled between adjacent fields', () => {
    const a = syncHashOf({ ...fields, venue: 'Fairmont', eventType: 'Wedding' });
    const b = syncHashOf({ ...fields, venue: 'Fairmont,Wedding', eventType: '' });
    assert.notEqual(a, b);
  });

  it('is not disturbed by anything Notion does not carry', () => {
    /*
     * The operator's database has no column for the area, the unit count, the package
     * id or where a booking came from, and it never sees the status token or updatedAt.
     * A reservation carrying all of them must hash the same as the mapped fields alone,
     * or a purely local change would look like a Notion edit and start a write loop.
     */
    const withExtras = {
      ...fields,
      id: 'firestore-doc-id',
      statusToken: 'a-secret',
      updatedAt: new Date(),
      syncState: 'ok',
      area: 'CAIRO',
      units: 1,
      packageId: 'BOOTH_GUESTBOOK',
      source: 'site',
    } as unknown as SyncedFields;

    assert.equal(syncHashOf(fields), syncHashOf(withExtras));
  });
});

/**
 * The two parsers that read the operator's own handwriting.
 *
 * Every string in the first block is a real value out of the live Bookings database.
 * These are not invented cases: they are what six months of typing at midnight actually
 * produced, and getting any of them wrong moves somebody's booking.
 */
describe('reading the Time column', () => {
  const cases: [string, string | null, number | null][] = [
    // [what is in Notion, expected start, expected hours]
    ['7 to 12', '19:00', 5],
    ['6 to 12', '18:00', 6],
    ['6 to 11', '18:00', 5],
    ['6 to 10', '18:00', 4],
    ['5 to 8', '17:00', 3],
    ['7 to 10', '19:00', 3],
    ['3 to 5:30', '15:00', 2.5],
    ['6', '18:00', null],
    ['3 hours', null, 3],
  ];

  for (const [raw, startTime, hours] of cases) {
    it(`reads ${JSON.stringify(raw)}`, () => {
      assert.deepEqual(parseNotionTime(raw), { startTime, hours });
    });
  }

  it('gives up rather than guessing', () => {
    assert.deepEqual(parseNotionTime(null), { startTime: null, hours: null });
    assert.deepEqual(parseNotionTime(''), { startTime: null, hours: null });
    assert.deepEqual(parseNotionTime('evening'), { startTime: null, hours: null });
  });

  /*
   * The assumption the whole parser rests on. An Egyptian wedding at "7" is seven in
   * the evening, and reading it as seven in the morning would put a five hour booking
   * on a booth that finishes before lunch.
   */
  it('treats a bare hour as the evening', () => {
    assert.equal(parseNotionTime('8').startTime, '20:00');
    assert.equal(parseNotionTime('11').startTime, '23:00');
  });

  it('leaves an unambiguous 24 hour time alone', () => {
    assert.equal(parseNotionTime('19:30').startTime, '19:30');
  });

  it('writes back the way the operator writes', () => {
    assert.equal(formatNotionTime('20:00', 4), '8 to 12');
    assert.equal(formatNotionTime('18:00', 6), '6 to 12');
    assert.equal(formatNotionTime('15:00', 2.5), '3 to 5:30');
  });

  /* A value the site wrote must read back as the same booking. */
  it('round trips', () => {
    for (const [, startTime, hours] of cases) {
      if (!startTime || hours === null) continue;
      assert.deepEqual(parseNotionTime(formatNotionTime(startTime, hours)), {
        startTime,
        hours,
      });
    }
  });
});

describe('reading the Package Price column', () => {
  /* All six options that exist in the live database, typed six different ways. */
  it('reads every spelling in use', () => {
    assert.equal(parseNotionPrice('1500'), 1500);
    assert.equal(parseNotionPrice('2000EGP'), 2000);
    assert.equal(parseNotionPrice('2999 EGP'), 2999);
    assert.equal(parseNotionPrice('3500 EGP'), 3500);
    assert.equal(parseNotionPrice('3700EGP'), 3700);
    assert.equal(parseNotionPrice('4000 EGP'), 4000);
  });

  it('returns null rather than zero when there is nothing to read', () => {
    assert.equal(parseNotionPrice(null), null);
    assert.equal(parseNotionPrice(''), null);
    assert.equal(parseNotionPrice('TBC'), null);
  });
});

describe('reading a status from a row that predates the Status column', () => {
  /*
   * All 26 bookings that existed before this integration have an empty Status and are
   * described entirely by two checkboxes. Reading them wrong would either resell a
   * confirmed Saturday or hide a finished job in the queue forever.
   */
  it('reads a finished job', () => {
    assert.equal(statusFromNotion(null, true, true), 'COMPLETED');
    assert.equal(statusFromNotion(null, false, true), 'COMPLETED');
  });

  it('reads a paid booking as confirmed', () => {
    assert.equal(statusFromNotion(null, true, false), 'CONFIRMED');
  });

  /*
   * Null, not REQUESTED. An unpaid row says nothing about whether the site should hold
   * the date, so the caller keeps whatever it already had rather than being told to
   * downgrade a booking on every sync.
   */
  it('says nothing about a row with neither box ticked', () => {
    assert.equal(statusFromNotion(null, false, false), null);
  });

  it('prefers an explicit status once one is set', () => {
    assert.equal(statusFromNotion('Cancelled', true, true), 'CANCELLED');
    assert.equal(statusFromNotion('Held', false, false), 'HELD');
    assert.equal(statusFromNotion('Blocked', false, false), 'BLOCKED');
  });

  it('ignores an option nobody in this code has heard of', () => {
    assert.equal(statusFromNotion('Maybe', true, false), 'CONFIRMED');
  });
});
