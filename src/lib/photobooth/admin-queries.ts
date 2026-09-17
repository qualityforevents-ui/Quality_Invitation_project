import { boothDays, boothReservations } from '@/lib/db';
import { todayInCairo } from '@/lib/format';
import { getBoothSettings } from './reservations';
import { occupiedUnits, type Occupancy } from './availability';
import type { BoothReservation, BoothStatus } from '@/lib/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * What the operator's booth screens read.
 *
 * Kept apart from reservations.ts, which is the write path and is shared with the
 * public site. Nothing here is reachable without assertOperator above it, so these are
 * allowed to return whole documents including names and phone numbers, which the public
 * availability endpoint deliberately never does.
 *
 * Every query here is a single field equality or a single field range, sorted in
 * memory. That is a deliberate constraint rather than laziness: a compound sort needs a
 * composite index deployed to Firebase before it answers, and the failure mode is an
 * admin screen that returns a 500 the first time it is opened after a deploy. At this
 * business's volume, a few hundred bookings a year, sorting in the function is free.
 */

function mapRow(doc: QueryDocumentSnapshot<DocumentData>): BoothReservation {
  const data = doc.data();

  return {
    id: doc.id,
    bookingId: String(data.bookingId ?? ''),
    statusToken: String(data.statusToken ?? ''),
    status: (data.status ?? 'REQUESTED') as BoothStatus,
    eventDate: String(data.eventDate ?? ''),
    startTime: String(data.startTime ?? ''),
    hours: Number(data.hours ?? 0),
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
    lang: data.lang === 'EN' ? 'EN' : 'AR',
    source: data.source ?? 'site',
    holdExpiresAt: toDateOrNull(data.holdExpiresAt),
    metaAttribution: data.metaAttribution ?? null,
    notionPageId: data.notionPageId ?? null,
    notionLastEditedTime: toDateOrNull(data.notionLastEditedTime),
    lastSyncedAt: toDateOrNull(data.lastSyncedAt),
    syncHash: data.syncHash ?? null,
    syncState: data.syncState ?? 'pending',
    syncError: data.syncError ?? null,
    cancelReason: data.cancelReason ?? null,
    createdAt: toDateOrNull(data.createdAt) ?? new Date(0),
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(0),
  };
}

function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The queue: everything waiting on a human, oldest first.
 *
 * HELD before REQUESTED within the same age, because a hold is a clock running down on
 * somebody who has already messaged us and a request is somebody who may not have.
 * Sorting by age alone would bury a hold expiring in an hour under a week old form
 * submission that never went anywhere.
 */
export async function getBoothQueue(): Promise<BoothReservation[]> {
  const [held, requested] = await Promise.all([
    boothReservations().where('status', '==', 'HELD').get(),
    boothReservations().where('status', '==', 'REQUESTED').get(),
  ]);

  const byOldest = (a: BoothReservation, b: BoothReservation) =>
    a.createdAt.getTime() - b.createdAt.getTime();

  return [
    ...held.docs.map(mapRow).sort(byOldest),
    ...requested.docs.map(mapRow).sort(byOldest),
  ];
}

/** Confirmed bookings from today onward, soonest first. The work actually coming up. */
export async function getUpcomingBookings(now: Date = new Date()): Promise<BoothReservation[]> {
  const today = todayInCairo(now);

  const snapshot = await boothReservations().where('status', '==', 'CONFIRMED').get();

  return snapshot.docs
    .map(mapRow)
    .filter((row) => row.eventDate >= today)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

/** Confirmed bookings whose date has passed and which nobody has marked done. */
export async function getBookingsAwaitingCompletion(
  now: Date = new Date(),
): Promise<BoothReservation[]> {
  const today = todayInCairo(now);

  const snapshot = await boothReservations().where('status', '==', 'CONFIRMED').get();

  return snapshot.docs
    .map(mapRow)
    .filter((row) => row.eventDate < today)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
}

export async function getBoothReservation(id: string): Promise<BoothReservation | null> {
  const doc = await boothReservations().doc(id).get();
  return doc.exists ? mapRow(doc as QueryDocumentSnapshot<DocumentData>) : null;
}

/**
 * Finds a booking by what the operator actually has in front of them.
 *
 * Which is a booking id read out of a WhatsApp message, or a phone number. Both are
 * exact matches rather than a search: Firestore has no substring query, and pretending
 * otherwise by pulling every booking into the function to filter it would be a table
 * scan dressed up as a feature.
 */
export async function findBoothReservations(term: string): Promise<BoothReservation[]> {
  const cleaned = term.trim();
  if (cleaned.length < 3) return [];

  const asBookingId = cleaned.toUpperCase();
  const asPhone = cleaned.replace(/[^\d]/g, '');

  const [byId, byPhone] = await Promise.all([
    boothReservations().where('bookingId', '==', asBookingId).limit(10).get(),
    asPhone.length >= 8
      ? boothReservations().where('customerPhone', '==', asPhone).limit(10).get()
      : Promise.resolve(null),
  ]);

  const rows = new Map<string, BoothReservation>();
  for (const doc of byId.docs) rows.set(doc.id, mapRow(doc));
  if (byPhone) for (const doc of byPhone.docs) rows.set(doc.id, mapRow(doc));

  return [...rows.values()].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
}

export type CalendarDay = {
  date: string;
  used: number;
  total: number;
  overbooked: boolean;
  reservations: BoothReservation[];
};

/**
 * One month for the admin calendar, with the bookings behind each day.
 *
 * Unlike the public availability endpoint this returns the reservations themselves,
 * because the operator taps a day to see who is on it. It also counts from the
 * reservations rather than trusting the stored day counters: this is the screen where
 * drift would be discovered, so it should not be reading the thing that might have
 * drifted.
 */
export async function getBoothMonth(month: string): Promise<CalendarDay[]> {
  const from = `${month}-01`;
  const [year, monthNumber] = month.split('-').map(Number);
  const to = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

  const [snapshot, settings] = await Promise.all([
    boothReservations().where('eventDate', '>=', from).where('eventDate', '<=', to).get(),
    getBoothSettings(),
  ]);

  const byDate = new Map<string, BoothReservation[]>();
  for (const doc of snapshot.docs) {
    const row = mapRow(doc);
    byDate.set(row.eventDate, [...(byDate.get(row.eventDate) ?? []), row]);
  }

  const days: CalendarDay[] = [];
  const now = new Date();

  for (let date = from; date <= to; date = nextDay(date)) {
    const reservations = byDate.get(date) ?? [];

    const occupancy: Occupancy = {
      unitsConfirmed: sum(reservations, 'CONFIRMED'),
      unitsHeld: reservations
        .filter((r) => r.status === 'HELD')
        .filter((r) => !r.holdExpiresAt || r.holdExpiresAt.getTime() > now.getTime())
        .reduce((total, r) => total + r.units, 0),
      unitsBlocked: sum(reservations, 'BLOCKED'),
    };

    const used = occupiedUnits(occupancy);

    days.push({
      date,
      used,
      total: settings.unitCount,
      overbooked: used > settings.unitCount,
      reservations: reservations.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    });
  }

  return days;
}

function sum(rows: BoothReservation[], status: BoothStatus): number {
  return rows.filter((row) => row.status === status).reduce((total, row) => total + row.units, 0);
}

function nextDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

/** The badge on the booth tab: everything waiting on a human. */
export async function getBoothQueueCount(): Promise<number> {
  const [held, requested] = await Promise.all([
    boothReservations().where('status', '==', 'HELD').count().get(),
    boothReservations().where('status', '==', 'REQUESTED').count().get(),
  ]);

  return held.data().count + requested.data().count;
}

/** How many reservations are failing to reach Notion, for the settings screen. */
export async function getBoothSyncTrouble(): Promise<number> {
  const snapshot = await boothReservations().where('syncState', '==', 'error').count().get();
  return snapshot.data().count;
}

export async function getBoothDayDoc(date: string) {
  const doc = await boothDays().doc(date).get();
  return doc.exists ? doc.data() : null;
}
