import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTENT_CATEGORIES,
  CUSTOM_EVENTS,
  STANDARD_EVENTS,
  isBrowserReportable,
  isKnownEvent,
  isStandardEvent,
  newEventId,
} from './events';

/**
 * The rules that decide what may be written into the ad account.
 *
 * /api/meta/event is a public endpoint that speaks to Meta holding a server token. The
 * only thing standing between it and anybody on the internet writing arbitrary events
 * into the dataset is this allowlist, so it is worth being certain about. A polluted
 * pixel cannot be refunded the way a bad bill can: the audiences and the optimisation
 * are trained on whatever arrived.
 */

describe('what the mirror endpoint will forward', () => {
  it('accepts the events this product actually reports', () => {
    for (const name of [...STANDARD_EVENTS, ...CUSTOM_EVENTS]) {
      assert.equal(isKnownEvent(name), true, `${name} should be known`);
    }
  });

  it('refuses a name this product does not use', () => {
    assert.equal(isKnownEvent('Subscribe'), false);
    assert.equal(isKnownEvent('CompleteRegistration'), false);
    assert.equal(isKnownEvent('AddPaymentInfo'), false);
  });

  it('refuses anything that is not a string', () => {
    assert.equal(isKnownEvent(null), false);
    assert.equal(isKnownEvent(undefined), false);
    assert.equal(isKnownEvent(42), false);
    assert.equal(isKnownEvent({ toString: () => 'Purchase' }), false);
  });

  /*
   * The one that matters most. Payment is settled by a human on WhatsApp, so a browser
   * claiming a purchase is claiming something it cannot possibly know. Both products
   * raise Purchase server side only: invitations from activateInvitation, the booth
   * from the admin's Confirm button.
   */
  it('never lets a browser report a Purchase', () => {
    assert.equal(isKnownEvent('Purchase'), true, 'the server still sends it');
    assert.equal(isBrowserReportable('Purchase'), false, 'the browser never may');
  });

  it('lets a browser report everything else it knows', () => {
    for (const name of [...STANDARD_EVENTS, ...CUSTOM_EVENTS]) {
      if (name === 'Purchase') continue;
      assert.equal(isBrowserReportable(name), true, `${name} should be reportable`);
    }
  });

  it('refuses an unknown name from the browser too', () => {
    assert.equal(isBrowserReportable('Subscribe'), false);
  });
});

describe('standard against custom', () => {
  /*
   * Only standard events can be optimised toward or carry a value Meta computes ROAS
   * from. Getting one of these wrong is not a reporting bug, it is a campaign that
   * cannot bid toward the thing it is meant to bid toward.
   */
  it('knows the standard ones', () => {
    for (const name of STANDARD_EVENTS) {
      assert.equal(isStandardEvent(name), true, `${name} is standard`);
    }
  });

  it('knows the custom ones are not standard', () => {
    for (const name of CUSTOM_EVENTS) {
      assert.equal(isStandardEvent(name), false, `${name} is custom`);
    }
  });

  it('keeps the money moments standard', () => {
    // These four are what campaigns optimise toward, so none of them may quietly
    // become a custom event in a refactor.
    for (const name of ['Lead', 'Purchase', 'InitiateCheckout', 'ViewContent']) {
      assert.equal(isStandardEvent(name), true, `${name} must stay standard`);
    }
  });

  it('keeps the two booth funnels apart from the invitation ones', () => {
    for (const name of ['AvailabilityChecked', 'BoothWhatsAppHandoff', 'ServiceSelected']) {
      assert.equal(isKnownEvent(name), true, `${name} should be known`);
    }
  });
});

describe('the categories every event must carry', () => {
  it('is exactly the two services plus the undecided', () => {
    assert.deepEqual([...CONTENT_CATEGORIES], ['invitation', 'photobooth', 'home']);
  });
});

describe('event ids', () => {
  /*
   * The id is what tells Meta the pixel's copy and the server's copy are one
   * conversion. A collision would merge two real sales into one; a duplicate id across
   * a 48 hour window silently drops the second event.
   */
  it('does not repeat itself', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newEventId()));
    assert.equal(ids.size, 1000);
  });

  it('is long enough for the mirror route to accept', () => {
    // The route refuses an id shorter than 8 or longer than 100 characters, because an
    // unusable id means an unpaired copy, which is a double count.
    const id = newEventId();
    assert.ok(id.length >= 8 && id.length <= 100, `${id} is ${id.length} characters`);
  });
});
