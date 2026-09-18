/**
 * Sends one of each event to Meta and reports what Meta said.
 *
 * Run with: npm run check:meta
 *
 * Every event goes through `sendMetaEvent`, the same function the site uses, so this
 * exercises the real payload, the real hashing and the real credentials rather than a
 * hand written approximation that could pass while the app fails.
 *
 * It refuses to run without META_TEST_EVENT_CODE. Without that code these events land
 * in the live dataset, and a handful of invented purchases in the real pixel is not
 * something that can be taken back.
 */
import 'dotenv/config';
import { isCapiConfigured, sendMetaEvent } from '../src/lib/meta/capi';
import { CUSTOM_EVENTS, STANDARD_EVENTS, newEventId } from '../src/lib/meta/events';

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
const TEST_CODE = process.env.META_TEST_EVENT_CODE || '';

async function main(): Promise<void> {
  if (!isCapiConfigured()) {
    console.error('NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN must both be set.');
    process.exit(1);
  }

  if (!TEST_CODE) {
    console.error(
      'META_TEST_EVENT_CODE is not set. Refusing to run: without it these events go to\n' +
        'the live dataset, and invented conversions cannot be withdrawn.',
    );
    process.exit(1);
  }

  console.log(`pixel ${PIXEL_ID}, test code ${TEST_CODE}\n`);

  /*
   * A representative event from each funnel, plus the one that only ever comes from a
   * server. The user data is deliberately fake but correctly shaped: a real Egyptian
   * mobile in local form, so the hashing and country prefixing are exercised.
   */
  const cases = [
    { name: 'PageView' as const, category: 'home', data: {} },
    { name: 'ViewContent' as const, category: 'photobooth', data: { value: 2995, currency: 'EGP' } },
    { name: 'AvailabilityChecked' as const, category: 'photobooth', data: { date_status: 'available' } },
    { name: 'Lead' as const, category: 'photobooth', data: { value: 2995, currency: 'EGP' } },
    { name: 'BoothWhatsAppHandoff' as const, category: 'photobooth', data: { value: 2995, currency: 'EGP' } },
    { name: 'ServiceSelected' as const, category: 'home', data: {} },
    { name: 'StartFlow' as const, category: 'invitation', data: {} },
    { name: 'InitiateCheckout' as const, category: 'invitation', data: { value: 300, currency: 'EGP' } },
    { name: 'Purchase' as const, category: 'photobooth', data: { value: 2995, currency: 'EGP' } },
  ];

  let sent = 0;

  for (const test of cases) {
    const ok = await sendMetaEvent({
      eventName: test.name,
      eventId: `check-${newEventId()}`,
      eventSourceUrl: 'https://qlty.events/photobooth',
      // system_generated for the one event no browser ever raises, website for the rest.
      actionSource: test.name === 'Purchase' ? 'system_generated' : 'website',
      userData: {
        phone: '01012345678',
        externalId: 'check-meta-script',
        clientIp: '156.200.0.1',
        userAgent: 'qlty check:meta',
      },
      customData: { ...test.data, content_category: test.category },
    });

    console.log(`${ok ? '  ok  ' : ' FAIL '} ${test.name.padEnd(22)} ${test.category}`);
    if (ok) sent += 1;
  }

  console.log(`\n${sent} of ${cases.length} accepted by Meta.`);
  console.log(
    'They are in Events Manager, Test Events, under the code above. Nothing reached the\n' +
      'live dataset.',
  );

  /*
   * Deduplication cannot be proven from here, because it needs the browser's copy of
   * the same event id to arrive as well. Walking the site with the pixel live is what
   * shows "Browser and Server" against one row.
   */
  console.log(
    '\nWhat this does NOT prove: deduplication. That needs the pixel firing in a real\n' +
      'browser with the same event id. Walk the site and watch Test Events for rows\n' +
      'marked "Browser and Server".',
  );

  process.exit(sent === cases.length ? 0 : 1);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
