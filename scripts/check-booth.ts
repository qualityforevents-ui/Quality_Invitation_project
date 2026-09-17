/**
 * Proves that two customers cannot take the last booth at the same moment.
 *
 * Run with: npm run check:booth
 *
 * The availability rules themselves are unit tested in
 * src/lib/photobooth/availability.test.ts, which needs no database. This is the other
 * half, and it cannot be a unit test: what is being checked here is that Firestore's
 * transaction actually serialises two writers, which is a property of Firestore and of
 * how the queries are written, not of any function in this repo. The only way to know
 * it holds is to ask a real database.
 *
 * It writes to whatever project the environment points at, and cleans up after itself
 * on the way in and the way out. The date is far enough in the future that it cannot
 * collide with a real booking.
 */
import 'dotenv/config';
import { boothDays, boothReservations } from '../src/lib/db';
import {
  createReservation,
  getAvailability,
  getBoothSettings,
  getReservationById,
  holdReservation,
  updateReservation,
} from '../src/lib/photobooth/reservations';

/**
 * Three hundred days out: inside maxAdvanceDays, so the public form will accept it, and
 * far enough ahead that it cannot collide with a real booking. Computed rather than
 * written down, because a literal date eventually falls into the past and the script
 * then fails for a reason that has nothing to do with what it is testing.
 */
const DATE = new Date(Date.now() + 300 * 86_400_000).toISOString().slice(0, 10);

async function cleanup(): Promise<void> {
  const snapshot = await boothReservations().where('eventDate', '==', DATE).get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
  await boothDays().doc(DATE).delete();
}

function booking(name: string) {
  return {
    eventDate: DATE,
    startTime: '20:00',
    hours: 4,
    units: 1,
    packageId: 'FULL_NIGHT',
    price: 5500,
    depositAmount: 1650,
    extras: null,
    customerName: name,
    customerPhone: '01012345678',
    venue: 'Concurrency test',
    area: 'CAIRO',
    eventType: 'WEDDING',
    notes: null,
    lang: 'AR' as const,
    source: 'site' as const,
    metaAttribution: null,
  };
}

async function main(): Promise<void> {
  const failures: string[] = [];

  function expect(label: string, actual: unknown, wanted: unknown): void {
    const ok = JSON.stringify(actual) === JSON.stringify(wanted);
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}: ${JSON.stringify(actual)}`);
    if (!ok) failures.push(`${label}: wanted ${JSON.stringify(wanted)}, got ${JSON.stringify(actual)}`);
  }

  await cleanup();

  /*
   * Fill the day down to its last free booth before racing for it.
   *
   * This used to assume a capacity of one, which stopped being true the moment the
   * real unit count was read out of the live database: with two booths both customers
   * legitimately won and the script reported a failure that was not one. Reading the
   * configured capacity means the test asks the question it means to ask — "can two
   * people take the *last* booth" — whatever that capacity is set to.
   */
  const { unitCount } = await getBoothSettings();
  console.log(`\ncapacity is ${unitCount}; filling it down to one free booth`);

  for (let i = 0; i < unitCount - 1; i += 1) {
    await createReservation({ ...booking(`Filler ${i + 1}`), status: 'CONFIRMED' });
  }

  expect(
    'one booth is left before the race',
    (await getAvailability(DATE, DATE))[DATE],
    unitCount > 1 ? 'last' : 'available',
  );

  console.log('\ntwo requests for that last booth');

  const a = await createReservation(booking('Customer A'));
  const b = await createReservation(booking('Customer B'));

  /*
   * Neither has been anywhere near WhatsApp, so the last booth is still for sale. This
   * is the rule that stops a form submission from being able to close a Saturday: two
   * REQUESTED rows on a day with one booth left must not have taken it.
   */
  expect(
    'the last booth is still for sale while both are only REQUESTED',
    (await getAvailability(DATE, DATE))[DATE],
    unitCount > 1 ? 'last' : 'available',
  );

  console.log('\nboth tap through to WhatsApp in the same instant');

  const [resultA, resultB] = await Promise.all([holdReservation(a.id), holdReservation(b.id)]);

  const held = [resultA, resultB].filter((result) => result.ok);
  const refused = [resultA, resultB].filter((result) => !result.ok);

  expect('exactly one hold succeeded', held.length, 1);
  expect('exactly one was refused', refused.length, 1);

  const loser = refused[0];
  if (loser && !loser.ok) {
    // A dead end loses the booking. Three dates keeps the conversation alive.
    expect('the one who lost was offered other dates', loser.alternatives.length > 0, true);
  }

  expect('the day now reads full', (await getAvailability(DATE, DATE))[DATE], 'full');

  const day = (await boothDays().doc(DATE).get()).data();
  expect('exactly one unit is held', day?.unitsHeld, 1);
  expect('the day is not marked overbooked', day?.overbooked, false);

  const [freshA, freshB] = await Promise.all([getReservationById(a.id), getReservationById(b.id)]);
  const statuses = [freshA?.status, freshB?.status].sort();
  expect('one HELD, one still REQUESTED', statuses, ['HELD', 'REQUESTED']);

  console.log('\nthe winner cancels');

  await updateReservation(resultA.ok ? a.id : b.id, { status: 'CANCELLED' });
  expect(
    'the last booth comes back',
    (await getAvailability(DATE, DATE))[DATE],
    unitCount > 1 ? 'last' : 'available',
  );

  await cleanup();

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed:`);
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }

  console.log('\nall checks passed');
  process.exit(0);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
