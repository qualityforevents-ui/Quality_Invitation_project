import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signNotionBody, verifyNotionSignature } from './signature';
import { syncHashOf, type SyncedFields } from './booth-schema';

/**
 * The two pure pieces of the Notion integration that are worth being certain about.
 *
 * The signature check is the only thing between a public URL and a token that can
 * rewrite every booking. The sync hash is the only thing stopping the two systems
 * writing to each other in a loop. Neither needs a network or a database to test, and
 * both fail in ways that are invisible until they matter.
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
    units: 1,
    packageId: 'FULL_NIGHT',
    price: 5500,
    depositAmount: 1650,
    depositPaid: true,
    customerName: 'Moaaz',
    customerPhone: '01012345678',
    venue: 'Fairmont',
    area: 'CAIRO',
    eventType: 'WEDDING',
    notes: null,
    source: 'site',
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
    const a = syncHashOf({ ...fields, venue: 'Fairmont', area: 'CAIRO' });
    const b = syncHashOf({ ...fields, venue: 'Fairmont,CAIRO', area: '' });
    assert.notEqual(a, b);
  });

  it('is not disturbed by anything Notion does not carry', () => {
    // updatedAt, the status token and the Notion bookkeeping fields are deliberately
    // not in the hash. A reservation object carrying them must hash the same as the
    // bare fields, or every push would look like an edit.
    const withExtras = {
      ...fields,
      id: 'firestore-doc-id',
      statusToken: 'a-secret',
      updatedAt: new Date(),
      syncState: 'ok',
    } as unknown as SyncedFields;

    assert.equal(syncHashOf(fields), syncHashOf(withExtras));
  });
});
