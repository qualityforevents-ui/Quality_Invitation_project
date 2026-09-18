import {
  FieldValue,
  Timestamp,
  boothDays,
  boothReservations,
  boothSettingsDoc,
  defined,
  toDate,
  toDateOr,
} from '@/lib/db';
import { generateBookingId, generateStatusToken } from '@/lib/tokens';
import { todayInCairo } from '@/lib/format';
import {
  BOOTH_CLOSED_WEEKDAYS,
  BOOTH_HOLD_HOURS,
  BOOTH_MAX_ADVANCE_DAYS,
  BOOTH_MIN_NOTICE_DAYS,
  BOOTH_UNIT_COUNT,
} from './config';
import {
  dayStatus,
  isBookable,
  isValidDateString,
  nextAvailableDates,
  occupancyFromReservations,
  occupiedUnits,
  type DayStatus,
  type Occupancy,
} from './availability';
import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Transaction,
} from 'firebase-admin/firestore';
import type { BoothReservation, BoothSettings, BoothStatus, Lang } from '@/lib/types';

/**
 * Reading and writing booth bookings, and the lock that keeps a Saturday from being
 * sold twice.
 *
 * The rules themselves are in ./availability.ts, which is pure and tested. This file is
 * the part that cannot be tested without a database: transactions, mapping, and the
 * ordering that makes concurrent writes safe.
 *
 * The central decision here is that the day counters are never incremented. Every
 * transaction reads the reservations for that day and recomputes the counters from
 * them. Incrementing is faster and is how this is usually written, and it is also how
 * a counter ends up disagreeing with reality forever after one failed write, one
 * retried function, or one hand edit in Notion. Recomputing costs one extra query on a
 * product that takes a few bookings a day, and it means the stored counters cannot
 * drift from the documents they describe.
 */

/* --------------------------------------------------------------- mapping */

function mapReservation(doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot): BoothReservation {
  const data = doc.data() ?? {};

  return {
    id: doc.id,
    bookingId: String(data.bookingId ?? ''),
    statusToken: String(data.statusToken ?? ''),
    status: (data.status ?? 'REQUESTED') as BoothStatus,
    eventDate: String(data.eventDate ?? ''),
    startTime: String(data.startTime ?? ''),
    hours: Number(data.hours ?? 0),
    // A row written before `units` existed, or one whose Notion number was cleared by
    // hand, is one booth rather than zero. Zero would silently make it free.
    units: Math.max(1, Number(data.units ?? 1)),
    packageId: String(data.packageId ?? ''),
    price: Number(data.price ?? 0),
    extras: data.extras ?? null,
    depositAmount: Number(data.depositAmount ?? 0),
    depositPaid: Boolean(data.depositPaid),
    customerName: String(data.customerName ?? ''),
    customerPhone: String(data.customerPhone ?? ''),
    venue: String(data.venue ?? ''),
    area: String(data.area ?? ''),
    eventType: String(data.eventType ?? ''),
    notes: data.notes ?? null,
    lang: (data.lang === 'EN' ? 'EN' : 'AR') as Lang,
    source: data.source ?? 'site',
    holdExpiresAt: toDate(data.holdExpiresAt),
    metaAttribution: data.metaAttribution ?? null,
    notionPageId: data.notionPageId ?? null,
    notionLastEditedTime: toDate(data.notionLastEditedTime),
    lastSyncedAt: toDate(data.lastSyncedAt),
    syncHash: data.syncHash ?? null,
    syncState: data.syncState ?? 'pending',
    syncError: data.syncError ?? null,
    cancelReason: data.cancelReason ?? null,
    createdAt: toDateOr(data.createdAt, new Date(0)),
    updatedAt: toDateOr(data.updatedAt, new Date(0)),
  };
}

/* -------------------------------------------------------------- settings */

/**
 * The booth's operating rules, from the database, falling back to the config file.
 *
 * The config file holds what the business owns and charges; this document holds what
 * the operator can change from their phone at eleven at night without a deploy. Until
 * somebody opens the settings page there is no document, and the config values are
 * used, which is why a fresh install works rather than showing an empty calendar.
 */
export const DEFAULT_BOOTH_SETTINGS: BoothSettings = {
  unitCount: BOOTH_UNIT_COUNT,
  minNoticeDays: BOOTH_MIN_NOTICE_DAYS,
  maxAdvanceDays: BOOTH_MAX_ADVANCE_DAYS,
  holdHours: BOOTH_HOLD_HOURS,
  closedWeekdays: BOOTH_CLOSED_WEEKDAYS,
  blackoutDates: [],
  updatedAt: new Date(0),
};

export async function getBoothSettings(): Promise<BoothSettings> {
  try {
    const snapshot = await boothSettingsDoc().get();
    if (!snapshot.exists) return DEFAULT_BOOTH_SETTINGS;

    const data = snapshot.data() ?? {};

    return {
      unitCount: Number(data.unitCount ?? DEFAULT_BOOTH_SETTINGS.unitCount),
      minNoticeDays: Number(data.minNoticeDays ?? DEFAULT_BOOTH_SETTINGS.minNoticeDays),
      maxAdvanceDays: Number(data.maxAdvanceDays ?? DEFAULT_BOOTH_SETTINGS.maxAdvanceDays),
      holdHours: Number(data.holdHours ?? DEFAULT_BOOTH_SETTINGS.holdHours),
      closedWeekdays: Array.isArray(data.closedWeekdays) ? data.closedWeekdays.map(Number) : [],
      blackoutDates: Array.isArray(data.blackoutDates) ? data.blackoutDates.map(String) : [],
      updatedAt: toDateOr(data.updatedAt, new Date(0)),
    };
  } catch (error) {
    /*
     * A calendar that cannot reach the database shows the configured defaults rather
     * than nothing. The booking itself still runs in a transaction that will fail
     * honestly, so the worst case is a customer offered a date that turns out to be
     * taken, which is a message; an empty calendar is a lost sale.
     */
    console.error('[booth] could not read settings, using defaults', error);
    return DEFAULT_BOOTH_SETTINGS;
  }
}

export async function saveBoothSettings(patch: Partial<BoothSettings>): Promise<void> {
  await boothSettingsDoc().set(
    defined({
      unitCount: patch.unitCount,
      minNoticeDays: patch.minNoticeDays,
      maxAdvanceDays: patch.maxAdvanceDays,
      holdHours: patch.holdHours,
      closedWeekdays: patch.closedWeekdays,
      blackoutDates: patch.blackoutDates,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    { merge: true },
  );
}

/* ------------------------------------------------------------- the counters */

/**
 * Recomputes one day from the reservations that actually reference it, inside a
 * transaction, and writes the result back.
 *
 * Reading the query through the transaction is what makes this a lock. Two customers
 * submitting for the last booth at the same instant both read the same set; Firestore
 * detects that one of them wrote a document the other had read, aborts it and retries
 * it against the winner's result, at which point the day is full and the loser is told
 * so. Counting with an ordinary query outside the transaction would let both through.
 *
 * Firestore requires every read in a transaction to happen before every write, which is
 * why this returns the occupancy and the caller does its writing afterwards rather than
 * this function being called in the middle of one.
 */
type DayRow = {
  id: string;
  status: BoothStatus;
  units: number;
  holdExpiresAt: Date | null;
};

async function readDay(
  tx: Transaction,
  date: string,
  now: Date,
): Promise<{ occupancy: Occupancy; ids: string[]; rows: DayRow[] }> {
  const snapshot = await tx.get(boothReservations().where('eventDate', '==', date));

  const rows: DayRow[] = snapshot.docs.map((doc) => {
    const row = mapReservation(doc);
    return {
      id: row.id,
      status: row.status,
      units: row.units,
      holdExpiresAt: row.holdExpiresAt,
    };
  });

  return {
    occupancy: occupancyFromReservations(rows, now),
    ids: rows.map((row) => row.id),
    rows,
  };
}

/** The day as it would be if this booking were not on it. */
function without(rows: DayRow[], id: string): DayRow[] {
  return rows.filter((row) => row.id !== id);
}

function writeDay(
  tx: Transaction,
  date: string,
  occupancy: Occupancy,
  reservationIds: string[],
  unitCount: number,
): void {
  tx.set(
    boothDays().doc(date),
    {
      date,
      ...occupancy,
      reservationIds,
      // A human deliberately took more than there are booths. The admin shows this in
      // red; nothing on the public side can ever cause it.
      overbooked: occupiedUnits(occupancy) > unitCount,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/* --------------------------------------------------------------- reading */

export async function getReservationById(id: string): Promise<BoothReservation | null> {
  const snapshot = await boothReservations().doc(id).get();
  return snapshot.exists ? mapReservation(snapshot) : null;
}

export async function getReservationByStatusToken(
  token: string,
): Promise<BoothReservation | null> {
  if (!token) return null;

  const snapshot = await boothReservations()
    .where('statusToken', '==', token)
    .limit(1)
    .get();

  return snapshot.empty ? null : mapReservation(snapshot.docs[0]);
}

export async function getReservationByBookingId(
  bookingId: string,
): Promise<BoothReservation | null> {
  const snapshot = await boothReservations()
    .where('bookingId', '==', bookingId.trim().toUpperCase())
    .limit(1)
    .get();

  return snapshot.empty ? null : mapReservation(snapshot.docs[0]);
}

export async function getReservationsForDate(date: string): Promise<BoothReservation[]> {
  const snapshot = await boothReservations().where('eventDate', '==', date).get();
  return snapshot.docs.map((doc) => mapReservation(doc));
}

/**
 * Every day in a range, as a status per date.
 *
 * Returns only what the calendar needs to colour itself in: a status per day and
 * nothing else. No names, no phone numbers, and no counts beyond what "last" already
 * implies. This is read by a public endpoint, and a competitor should not be able to
 * pull our booking volume out of it.
 */
export async function getAvailability(
  from: string,
  to: string,
  now: Date = new Date(),
): Promise<Record<string, DayStatus>> {
  const settings = await getBoothSettings();
  const today = todayInCairo(now);

  /*
   * Read the stored counters rather than every reservation in the range. Three months
   * of reservations is a lot of documents to pull in to colour ninety squares, and the
   * counters are kept true by every write path recomputing them.
   *
   * Holds are the exception and are re-evaluated here, because a hold expires by the
   * clock rather than by anything writing to the database. Without this a released
   * booth would keep showing as taken until the next write or the next reconcile.
   */
  const [daySnapshot, heldSnapshot] = await Promise.all([
    boothDays().where('date', '>=', from).where('date', '<=', to).get(),
    /*
     * Every live hold, not just the ones in this range, and then filtered in memory.
     *
     * Adding the date range to this query would make it a composite index, and a
     * composite index has to be deployed to Firebase before it will answer. That is
     * fine for the admin, which an operator can be told to wait for; it is not fine
     * here. This is the query behind the public calendar, and an undeployed index turns
     * it into a 503 on the page the business advertises.
     *
     * It is cheap because of what HELD means: a hold lasts a day and is taken only by
     * somebody who reached WhatsApp, so this set is a handful of documents at any
     * moment, not a history. Both fields are single field indexes, which Firestore
     * creates by itself.
     */
    boothReservations().where('status', '==', 'HELD').get(),
  ]);

  const stored = new Map<string, Occupancy>();
  for (const doc of daySnapshot.docs) {
    const data = doc.data();
    stored.set(doc.id, {
      unitsConfirmed: Number(data.unitsConfirmed ?? 0),
      unitsHeld: Number(data.unitsHeld ?? 0),
      unitsBlocked: Number(data.unitsBlocked ?? 0),
    });
  }

  // Rebuild the held column from the live rows, so expiry is honoured on read.
  const liveHeld = new Map<string, number>();
  for (const doc of heldSnapshot.docs) {
    const row = mapReservation(doc);
    if (row.eventDate < from || row.eventDate > to) continue;
    if (row.holdExpiresAt && row.holdExpiresAt.getTime() <= now.getTime()) continue;
    liveHeld.set(row.eventDate, (liveHeld.get(row.eventDate) ?? 0) + row.units);
  }

  const result: Record<string, DayStatus> = {};

  for (let date = from; date <= to; date = addOneDay(date)) {
    const base = stored.get(date) ?? { unitsConfirmed: 0, unitsHeld: 0, unitsBlocked: 0 };

    result[date] = dayStatus({
      date,
      today,
      occupancy: { ...base, unitsHeld: liveHeld.get(date) ?? 0 },
      settings,
    });
  }

  return result;
}

function addOneDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

/* --------------------------------------------------------------- writing */

export class DateTakenError extends Error {
  /** The next few days the customer could have instead. Never an empty hand. */
  readonly alternatives: string[];

  constructor(alternatives: string[]) {
    super('That date was taken while you were filling the form in.');
    this.name = 'DateTakenError';
    this.alternatives = alternatives;
  }
}

export type NewReservation = {
  eventDate: string;
  startTime: string;
  hours: number;
  units: number;
  packageId: string;
  price: number;
  depositAmount: number;
  extras: string | null;
  customerName: string;
  customerPhone: string;
  venue: string;
  area: string;
  eventType: string;
  notes: string | null;
  lang: Lang;
  source: BoothReservation['source'];
  metaAttribution: BoothReservation['metaAttribution'];
  /** Admin and Notion may create a booking on a day the public form would refuse. */
  status?: BoothStatus;
};

/**
 * Creates a booking.
 *
 * A booking from the site is born REQUESTED, which takes no unit, and the availability
 * check here is a courtesy rather than a lock: it fails fast so the customer is not
 * walked through a summary screen for a date that has already gone. The real gate is
 * `holdReservation` below.
 *
 * Admin and Notion may create anything on any day, including a day that is already
 * full. A human has decided to run two booths off one van, and the software's job at
 * that point is to record it and mark the day overbooked, not to argue.
 */
export async function createReservation(
  input: NewReservation,
  now: Date = new Date(),
): Promise<BoothReservation> {
  if (!isValidDateString(input.eventDate)) {
    throw new Error(`createReservation: not a date: ${input.eventDate}`);
  }

  const settings = await getBoothSettings();
  const today = todayInCairo(now);
  const status = input.status ?? 'REQUESTED';
  const fromPublicForm = input.source === 'site';

  const docRef = boothReservations().doc();

  await boothReservations().firestore.runTransaction(async (tx) => {
    // Every read first. Firestore aborts a transaction that reads after it has written,
    // which is why the day is counted here and the document is written below rather
    // than the counters being worked out once the booking is already in place.
    const { occupancy, ids, rows } = await readDay(tx, input.eventDate, now);

    if (fromPublicForm) {
      const current = dayStatus({ date: input.eventDate, today, occupancy, settings });

      if (!isBookable(current)) {
        throw new DateTakenError(
          nextAvailableDates({
            from: input.eventDate,
            today,
            settings,
            // Suggestions are computed against the stored counters for nearby days,
            // which cannot be read inside this transaction without reading half the
            // calendar into it. A suggested day that turns out to be gone costs one
            // more message; holding a transaction open over ninety reads costs every
            // concurrent booking.
            occupancyFor: () => ({ unitsConfirmed: 0, unitsHeld: 0, unitsBlocked: 0 }),
          }),
        );
      }
    }

    tx.set(docRef, {
      bookingId: generateBookingId(),
      statusToken: generateStatusToken(),
      status,
      eventDate: input.eventDate,
      startTime: input.startTime,
      hours: input.hours,
      units: Math.max(1, input.units),
      packageId: input.packageId,
      price: input.price,
      extras: input.extras,
      depositAmount: input.depositAmount,
      depositPaid: false,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      venue: input.venue,
      area: input.area,
      eventType: input.eventType,
      notes: input.notes,
      lang: input.lang,
      source: input.source,
      holdExpiresAt: null,
      metaAttribution: input.metaAttribution,
      notionPageId: null,
      notionLastEditedTime: null,
      lastSyncedAt: null,
      syncHash: null,
      // Every write leaves the row owing Notion an update. The push happens after the
      // response, and the reconcile job retries whatever the push did not manage.
      syncState: 'pending',
      syncError: null,
      cancelReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Recomputed with this booking included, which matters when admin or Notion created
    // it already CONFIRMED or BLOCKED.
    const after = occupancyFromReservations(
      [...rows, { status, units: Math.max(1, input.units), holdExpiresAt: null }],
      now,
    );

    writeDay(tx, input.eventDate, after, [...ids, docRef.id], settings.unitCount);
  });

  const created = await getReservationById(docRef.id);
  if (!created) throw new Error('createReservation: the document vanished after writing it');
  return created;
}

/**
 * Takes the unit, because the customer has tapped through to WhatsApp.
 *
 * This is the real gate, and the only place on the public side where a booth actually
 * stops being for sale. It runs in a transaction that reads the day, so two people who
 * both reached the summary screen for the last booth are serialised here and exactly
 * one of them gets it.
 *
 * Idempotent on purpose. The customer can tap the WhatsApp button, come back and tap it
 * again, and a second call must extend the hold rather than refuse or double count it.
 */
export async function holdReservation(
  id: string,
  now: Date = new Date(),
): Promise<{ ok: true; reservation: BoothReservation } | { ok: false; alternatives: string[] }> {
  const settings = await getBoothSettings();
  const today = todayInCairo(now);
  const holdExpiresAt = new Date(now.getTime() + settings.holdHours * 3_600_000);

  let failedWith: string[] | null = null;

  await boothReservations().firestore.runTransaction(async (tx) => {
    failedWith = null;

    const ref = boothReservations().doc(id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new Error(`holdReservation: no reservation ${id}`);

    const reservation = mapReservation(snapshot);

    // Already past this point. Confirming or completing a booking must not be undone by
    // a customer reopening an old tab and tapping WhatsApp again.
    if (reservation.status !== 'REQUESTED' && reservation.status !== 'HELD') return;

    const { ids, rows } = await readDay(tx, reservation.eventDate, now);

    /*
     * Count the day as it would be without this booking, then ask whether there is room
     * for it. Leaving its own existing hold in the count would make an extension of a
     * hold fail whenever it was holding the last booth.
     */
    const others = without(rows, id);
    const withoutThis = occupancyFromReservations(others, now);

    if (!isBookable(dayStatus({ date: reservation.eventDate, today, occupancy: withoutThis, settings }))) {
      failedWith = nextAvailableDates({
        from: reservation.eventDate,
        today,
        settings,
        occupancyFor: () => ({ unitsConfirmed: 0, unitsHeld: 0, unitsBlocked: 0 }),
      });
      return;
    }

    tx.update(ref, {
      status: 'HELD',
      holdExpiresAt: Timestamp.fromDate(holdExpiresAt),
      syncState: 'pending',
      updatedAt: FieldValue.serverTimestamp(),
    });

    const after = occupancyFromReservations(
      [...others, { id, status: 'HELD', units: reservation.units, holdExpiresAt }],
      now,
    );

    writeDay(tx, reservation.eventDate, after, ids, settings.unitCount);
  });

  if (failedWith) return { ok: false, alternatives: failedWith };

  const reservation = await getReservationById(id);
  if (!reservation) throw new Error(`holdReservation: no reservation ${id}`);
  return { ok: true, reservation };
}

export type ReservationPatch = Partial<
  Pick<
    BoothReservation,
    | 'status'
    | 'eventDate'
    | 'startTime'
    | 'hours'
    | 'units'
    | 'packageId'
    | 'price'
    | 'extras'
    | 'depositAmount'
    | 'depositPaid'
    | 'customerName'
    | 'customerPhone'
    | 'venue'
    | 'area'
    | 'eventType'
    | 'notes'
    | 'cancelReason'
    | 'notionPageId'
    | 'notionLastEditedTime'
    | 'syncHash'
    | 'syncState'
    | 'syncError'
    | 'lastSyncedAt'
  >
>;

/**
 * Changes a booking, and repairs whichever days that touched.
 *
 * Moving a booking from the 14th to the 21st has to recount both, which is the case a
 * simpler implementation forgets and which leaves the 14th looking full forever. Both
 * days are read and rewritten in one transaction, so a reader never sees the booking on
 * neither day or on both.
 *
 * Never refuses. This is the admin's and Notion's door, and a human on the other side
 * of it has already decided; overbooking is recorded and flagged rather than blocked.
 */
export async function updateReservation(
  id: string,
  patch: ReservationPatch,
  now: Date = new Date(),
): Promise<BoothReservation> {
  const settings = await getBoothSettings();

  await boothReservations().firestore.runTransaction(async (tx) => {
    const ref = boothReservations().doc(id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new Error(`updateReservation: no reservation ${id}`);

    const before = mapReservation(snapshot);
    const nextDate = patch.eventDate ?? before.eventDate;
    const nextStatus = patch.status ?? before.status;
    const nextUnits = Math.max(1, patch.units ?? before.units);

    // A booking that stops holding a unit must stop carrying an expiry with it, or an
    // admin confirming a held booking leaves a stale countdown on the detail page.
    const holdExpiresAt =
      nextStatus === 'HELD'
        ? before.holdExpiresAt ?? new Date(now.getTime() + settings.holdHours * 3_600_000)
        : null;

    const dates = Array.from(new Set([before.eventDate, nextDate]));

    // Every read first. Firestore rejects a transaction that reads after it writes.
    const perDay = new Map<string, { ids: string[]; rows: DayRow[] }>();
    for (const date of dates) {
      const { ids, rows } = await readDay(tx, date, now);
      perDay.set(date, { ids, rows });
    }

    tx.update(
      ref,
      defined({
        ...patch,
        units: patch.units === undefined ? undefined : nextUnits,
        eventDate: patch.eventDate,
        holdExpiresAt: holdExpiresAt ? Timestamp.fromDate(holdExpiresAt) : null,
        notionLastEditedTime: patch.notionLastEditedTime
          ? Timestamp.fromDate(patch.notionLastEditedTime)
          : undefined,
        lastSyncedAt: patch.lastSyncedAt ? Timestamp.fromDate(patch.lastSyncedAt) : undefined,
        updatedAt: FieldValue.serverTimestamp(),
      }),
    );

    for (const date of dates) {
      const entry = perDay.get(date);
      if (!entry) continue;

      // This booking as it will be, on the day it will be on. Removed from wherever it
      // was, added to wherever it is going.
      const others = without(entry.rows, id);
      const rows =
        date === nextDate
          ? [...others, { id, status: nextStatus, units: nextUnits, holdExpiresAt }]
          : others;

      const ids = date === nextDate ? Array.from(new Set([...entry.ids, id])) : entry.ids.filter((x) => x !== id);

      writeDay(tx, date, occupancyFromReservations(rows, now), ids, settings.unitCount);
    }
  });

  const updated = await getReservationById(id);
  if (!updated) throw new Error(`updateReservation: no reservation ${id}`);
  return updated;
}

/**
 * Releases holds that have run out, so the stored counters agree with what every reader
 * has already been computing.
 *
 * Nothing depends on this having run. Expiry is evaluated on read everywhere it
 * matters; this exists so the admin calendar and the stored day documents do not sit
 * there claiming a booth is taken when the availability API is already giving it away.
 */
export async function releaseExpiredHolds(now: Date = new Date()): Promise<number> {
  // Equality on one field only, for the same reason getAvailability avoids a composite
  // index: this runs from a cron endpoint that must not start failing because an index
  // was never deployed. Live holds are a handful of documents.
  const snapshot = await boothReservations().where('status', '==', 'HELD').limit(200).get();

  const expired = snapshot.docs.filter((doc) => {
    const holdExpiresAt = toDate(doc.data().holdExpiresAt);
    return holdExpiresAt !== null && holdExpiresAt.getTime() <= now.getTime();
  });

  let released = 0;

  for (const doc of expired) {
    /*
     * Back to REQUESTED rather than CANCELLED. The customer did fill in the form and
     * did open WhatsApp; they may still be mid conversation when the hold lapses, and
     * throwing the booking away would lose the operator a live lead. It stops holding
     * the date, which is the only thing the expiry is for.
     */
    await updateReservation(doc.id, { status: 'REQUESTED' }, now);
    released += 1;
  }

  return released;
}
