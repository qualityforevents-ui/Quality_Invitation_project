'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { assertOperator } from '@/lib/admin-auth';
import { reportBoothPurchase } from '@/lib/meta/booth-sale';
import { pushReservationToNotion } from '@/lib/notion/sync';
import { isValidDateString } from '@/lib/photobooth/availability';
import { revalidateBoothAvailability } from '@/lib/photobooth/cache';
import { boothDeposit, getBoothPackage } from '@/lib/photobooth/config';
import { getBoothReservation } from '@/lib/photobooth/admin-queries';
import {
  createReservation,
  getReservationById,
  saveBoothSettings,
  updateReservation,
  type ReservationPatch,
} from '@/lib/photobooth/reservations';
import { normaliseEgyptianPhone } from '@/lib/validation';
import type { BoothStatus } from '@/lib/types';

/**
 * Everything the operator can do to a booth booking.
 *
 * Three things happen after every one of them, and they are collected in `settle` below
 * so no action can forget one: the cached calendar is invalidated, the admin screens
 * are rebuilt, and the row is pushed to Notion.
 *
 * The push runs in `after()`, which lets the response reach the operator's phone before
 * the Notion round trip starts. Confirming a booking should not take as long as Notion
 * takes to answer, and if Notion is down it should not fail at all: the row is left
 * marked pending and the reconcile job picks it up.
 */

function assertId(formData: FormData): string {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) throw new Error('booth action: no reservation id');
  return id;
}

/**
 * Rebuilds everything that shows this booking, then hands it to Notion.
 *
 * The customer's own status page is revalidated too, so somebody sitting on it watching
 * for a confirmation sees it without waiting for a reload.
 */
function settle(id: string, statusToken?: string): void {
  revalidateBoothAvailability();
  revalidatePath('/admin/booth');
  revalidatePath('/admin/booth/calendar');
  revalidatePath(`/admin/booth/${id}`);
  if (statusToken) revalidatePath(`/photobooth/request/${statusToken}`);

  after(async () => {
    await pushReservationToNotion(id);
  });
}

/**
 * The deposit arrived and a human saw it.
 *
 * This is the only moment in the booth product where money is known to have changed
 * hands, which is why it is the only thing that raises a Purchase. The event goes out
 * in `after()` for the same reason the Notion push does, and it is deduplicated by a
 * deterministic event id so a double tap cannot report a second five thousand pound
 * sale.
 */
export async function confirmBooking(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const before = await getReservationById(id);
  if (!before) throw new Error('booth action: no such reservation');

  const updated = await updateReservation(id, {
    status: 'CONFIRMED',
    depositPaid: true,
    cancelReason: null,
  });

  settle(id, updated.statusToken);

  /*
   * Only on the transition into CONFIRMED.
   *
   * Meta would drop a repeat anyway, on the deterministic id, but only inside a 48 hour
   * window. An operator who confirms, cancels, and confirms again a fortnight later
   * would otherwise report a second sale that never happened.
   */
  if (before.status !== 'CONFIRMED') {
    after(async () => {
      await reportBoothPurchase(updated);
    });
  }
}

export async function cancelBooking(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const reason = String(formData.get('reason') ?? '').trim();

  const updated = await updateReservation(id, {
    status: 'CANCELLED',
    // The reason is shown to the customer on their own status page, so an empty one
    // would leave them looking at a cancellation with no explanation at all.
    cancelReason: reason || 'cancelled by the operator',
  });

  settle(id, updated.statusToken);
}

export async function completeBooking(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const updated = await updateReservation(id, { status: 'COMPLETED' });
  settle(id, updated.statusToken);
}

/**
 * Moves a booking to another day.
 *
 * Transactional, and it recounts both days: the one it left and the one it arrived on.
 * Forgetting the old day is the classic version of this bug, and it leaves a Saturday
 * looking full forever with nothing on it.
 *
 * The admin is allowed to overbook. A human has decided to run two booths off one van,
 * and the software's job at that point is to record it and mark the day rather than
 * argue with somebody who can see the van.
 */
export async function changeBookingDate(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const eventDate = String(formData.get('eventDate') ?? '').trim();
  if (!isValidDateString(eventDate)) throw new Error('booth action: not a date');

  const updated = await updateReservation(id, { eventDate });
  settle(id, updated.statusToken);
}

/** Edits the details that are not the date and not the status. */
export async function editBooking(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const phone = String(formData.get('customerPhone') ?? '').trim();
  const normalised = phone ? normaliseEgyptianPhone(phone) : null;

  const patch: ReservationPatch = {
    customerName: String(formData.get('customerName') ?? '').trim(),
    venue: String(formData.get('venue') ?? '').trim(),
    area: String(formData.get('area') ?? '').trim(),
    eventType: String(formData.get('eventType') ?? '').trim(),
    startTime: String(formData.get('startTime') ?? '').trim(),
    hours: Number(formData.get('hours') ?? 0) || undefined,
    price: Number(formData.get('price') ?? 0) || undefined,
    depositAmount: Number(formData.get('depositAmount') ?? 0) || undefined,
    notes: String(formData.get('notes') ?? '').trim() || null,
  };

  // An unparseable number is left alone rather than written as null, which would clear
  // a phone number because somebody fumbled a digit.
  if (normalised) patch.customerPhone = normalised;

  const updated = await updateReservation(id, patch);
  settle(id, updated.statusToken);
}

/**
 * A booking taken on the phone or over Instagram.
 *
 * Born CONFIRMED rather than REQUESTED, because the operator typing it in has already
 * had the conversation. It takes the date immediately, which is the whole reason they
 * are typing it in rather than waiting for the customer to use the website.
 */
export async function createManualBooking(formData: FormData): Promise<void> {
  await assertOperator();

  const eventDate = String(formData.get('eventDate') ?? '').trim();
  if (!isValidDateString(eventDate)) throw new Error('booth action: not a date');

  const packageId = String(formData.get('packageId') ?? '').trim();
  const tier = getBoothPackage(packageId);

  const price = Number(formData.get('price') ?? 0) || tier.price;
  const phone = normaliseEgyptianPhone(String(formData.get('customerPhone') ?? '')) ?? '';

  const created = await createReservation({
    eventDate,
    startTime: String(formData.get('startTime') ?? '20:00').trim(),
    hours: Number(formData.get('hours') ?? tier.hours) || tier.hours,
    units: Number(formData.get('units') ?? 1) || 1,
    packageId: tier.id,
    price,
    depositAmount: boothDeposit(price),
    extras: null,
    customerName: String(formData.get('customerName') ?? '').trim() || 'Booking',
    customerPhone: phone,
    venue: String(formData.get('venue') ?? '').trim(),
    area: String(formData.get('area') ?? '').trim(),
    eventType: String(formData.get('eventType') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim() || null,
    lang: 'AR',
    source: 'admin',
    // No browser was involved, so there is nothing to attribute. A manual booking is a
    // phone call, and pretending otherwise would put empty signals into the ad account.
    metaAttribution: null,
    status: (String(formData.get('status') ?? 'CONFIRMED') as BoothStatus) || 'CONFIRMED',
  });

  settle(created.id, created.statusToken);

  redirect(`/admin/booth/${created.id}`);
}

/**
 * Takes a day off the calendar with no customer attached.
 *
 * How the operator says "the booth is at a corporate job" or "I am away that week". It
 * is a reservation like any other so that one set of rules counts the calendar, rather
 * than a second list of blocked dates that the availability engine would have to
 * remember to consult.
 */
export async function blockDay(formData: FormData): Promise<void> {
  await assertOperator();

  const eventDate = String(formData.get('eventDate') ?? '').trim();
  if (!isValidDateString(eventDate)) throw new Error('booth action: not a date');

  const note = String(formData.get('notes') ?? '').trim() || null;

  const created = await createReservation({
    eventDate,
    startTime: '00:00',
    hours: 24,
    units: Number(formData.get('units') ?? 1) || 1,
    packageId: '',
    price: 0,
    depositAmount: 0,
    extras: null,
    customerName: 'Blocked',
    customerPhone: '',
    venue: '',
    area: '',
    eventType: '',
    notes: note,
    lang: 'AR',
    source: 'admin',
    metaAttribution: null,
    status: 'BLOCKED',
  });

  settle(created.id);

  revalidatePath('/admin/booth/calendar');
}

/** Removes a block, or any reservation created in error. */
export async function unblockDay(formData: FormData): Promise<void> {
  await assertOperator();
  const id = assertId(formData);

  const reservation = await getBoothReservation(id);
  if (!reservation) return;

  /*
   * Cancelled rather than deleted, even for a block.
   *
   * Deleting would leave the Notion page orphaned: the sync would see a page with no
   * reservation, decide it was created by hand, and recreate the block on the next
   * pass. Cancelling gives the day back and keeps the two sides agreeing about what
   * exists.
   */
  await updateReservation(id, { status: 'CANCELLED', cancelReason: 'block removed' });

  settle(id);
  revalidatePath('/admin/booth/calendar');
}

export async function saveSettings(formData: FormData): Promise<void> {
  await assertOperator();

  const number = (name: string): number | undefined => {
    const value = Number(formData.get(name));
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  };

  // Checkbox inputs named the same thing, one per weekday, so an unticked day simply
  // is not in the FormData rather than arriving as false.
  const closedWeekdays = formData
    .getAll('closedWeekdays')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);

  const blackoutDates = String(formData.get('blackoutDates') ?? '')
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(isValidDateString);

  await saveBoothSettings({
    unitCount: number('unitCount'),
    minNoticeDays: number('minNoticeDays'),
    maxAdvanceDays: number('maxAdvanceDays'),
    holdHours: number('holdHours'),
    closedWeekdays,
    blackoutDates,
  });

  revalidateBoothAvailability();
  revalidatePath('/admin/booth/settings');
  revalidatePath('/admin/booth/calendar');
}
