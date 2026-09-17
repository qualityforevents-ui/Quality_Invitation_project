'use server';

import { headers } from 'next/headers';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';
import { readRequestSignals, toStoredAttribution } from '@/lib/meta/request';
import { setBoothStatusToken } from '@/lib/session';
import { boothDeposit, getBoothArea, getBoothPackage } from '@/lib/photobooth/config';
import { revalidateBoothAvailability } from '@/lib/photobooth/cache';
import { BoothBookingSchema } from '@/lib/photobooth/validation';
import {
  DateTakenError,
  createReservation,
  getReservationById,
  holdReservation,
} from '@/lib/photobooth/reservations';
import { boothWhatsappLink, buildBoothBookingMessage } from '@/lib/whatsapp';

/**
 * The two things the public booth page can do to the database.
 *
 * Both are server actions rather than route handlers because both are submitted from a
 * form on a page that is already server rendered, and neither has any business being
 * reachable as a documented URL.
 */

export type RequestBookingResult =
  | {
      ok: true;
      bookingId: string;
      price: number;
      deposit: number;
      /** The reservation's document id, which handoffToWhatsApp needs. */
      id: string;
      whatsappUrl: string;
    }
  | { ok: false; error: 'invalid'; fields: Record<string, string> }
  | { ok: false; error: 'taken'; alternatives: string[] }
  | { ok: false; error: 'rate' | 'server' };

/**
 * Takes a booking request.
 *
 * The reservation is born REQUESTED, which holds no unit. A form submission is not a
 * reason to stop selling a Saturday: the person may never message us, and if a bare
 * submission took the date off the calendar then anyone with a browser could empty a
 * year of Saturdays in an afternoon. The unit is taken at the WhatsApp handoff below.
 *
 * The price is looked up here from the package rather than read from the form, because
 * a price that arrives in a request body is a price the customer picked.
 */
export async function requestBooking(formData: FormData): Promise<RequestBookingResult> {
  pruneRateLimits();

  const headerList = await headers();
  const key =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown';

  // Three bookings an hour from one address. A wedding is booked once.
  const { allowed } = checkRateLimit(`booth-request:${key}`, 3, 60 * 60 * 1000);
  if (!allowed) return { ok: false, error: 'rate' };

  const parsed = BoothBookingSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const name = String(issue.path[0] ?? 'form');
      fields[name] ??= issue.message;
    }
    return { ok: false, error: 'invalid', fields };
  }

  const input = parsed.data;

  /*
   * The honeypot caught something. Reported as success with a plausible shaped response
   * would be better still, but it would mean writing a row for every bot; this refuses
   * without saying which check failed, which is the part that matters. Telling a bot
   * what it got wrong is how the next version of it gets it right.
   */
  if (input.website) return { ok: false, error: 'invalid', fields: {} };

  const tier = getBoothPackage(input.packageId);
  const area = getBoothArea(input.area);

  // Extra hours beyond the package, plus travel outside the areas we already cover.
  const extraHours = Math.max(0, input.hours - tier.hours);
  const price = tier.price + extraHours * tier.extraHourPrice + (area?.transportFee ?? 0);
  const deposit = boothDeposit(price);

  const signals = await readRequestSignals();

  try {
    const reservation = await createReservation({
      eventDate: input.eventDate,
      startTime: input.startTime,
      hours: input.hours,
      units: 1,
      packageId: tier.id,
      price,
      depositAmount: deposit,
      extras: extraHours > 0 ? `+${extraHours}h` : null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      venue: input.venue,
      area: input.area,
      eventType: input.eventType,
      notes: input.notes ?? null,
      lang: input.lang,
      source: 'site',
      /*
       * Written down now, while the customer is still here and their cookies are
       * readable. The deposit is settled by a human on WhatsApp and confirmed in the
       * admin days later, from a different device with none of these signals, and the
       * Purchase raised at that moment can only be attributed to the ad that produced
       * it if the ad click was saved while it was still legible.
       */
      metaAttribution: toStoredAttribution(signals, headerList.get('referer')),
    });

    // The device now owns this booking, exactly as it would own an invitation draft.
    await setBoothStatusToken(reservation.statusToken);

    revalidateBoothAvailability();

    return {
      ok: true,
      id: reservation.id,
      bookingId: reservation.bookingId,
      price,
      deposit,
      whatsappUrl: boothWhatsappLink(
        buildBoothBookingMessage({
          lang: input.lang,
          bookingId: reservation.bookingId,
          eventDate: input.eventDate,
          startTime: input.startTime,
          packageName: input.lang === 'AR' ? tier.nameAr : tier.nameEn,
          venue: input.venue,
          price,
          deposit,
        }),
      ),
    };
  } catch (error) {
    if (error instanceof DateTakenError) {
      return { ok: false, error: 'taken', alternatives: error.alternatives };
    }

    console.error('[booth] could not create the booking', error);
    return { ok: false, error: 'server' };
  }
}

export type HandoffResult =
  | { ok: true; whatsappUrl: string }
  | { ok: false; error: 'taken'; alternatives: string[] }
  | { ok: false; error: 'gone' | 'server' };

/**
 * Takes the unit, because the customer is on their way to WhatsApp.
 *
 * This is the real gate. Everything up to here is a form being filled in; this is the
 * moment the date stops being for sale, and it runs inside a transaction that reads the
 * day under a lock, so two people who both reached the summary screen for the last
 * booth are serialised and exactly one of them wins.
 *
 * The loser is not left at a dead end. They get the next three dates that are actually
 * free, because "that date has gone" ends the conversation and "that date has gone, but
 * these three are open" is a booking that still happens.
 *
 * The link is rebuilt here rather than trusted from the client. The client already has
 * one from requestBooking, and a client that can hand the server a WhatsApp URL to
 * return is a client that can put anything in it.
 */
export async function handoffToWhatsApp(id: string): Promise<HandoffResult> {
  try {
    const result = await holdReservation(id);

    if (!result.ok) {
      revalidateBoothAvailability();
      return { ok: false, error: 'taken', alternatives: result.alternatives };
    }

    const reservation = result.reservation;
    const tier = getBoothPackage(reservation.packageId);

    revalidateBoothAvailability();

    return {
      ok: true,
      whatsappUrl: boothWhatsappLink(
        buildBoothBookingMessage({
          lang: reservation.lang,
          bookingId: reservation.bookingId,
          eventDate: reservation.eventDate,
          startTime: reservation.startTime,
          packageName: reservation.lang === 'AR' ? tier.nameAr : tier.nameEn,
          venue: reservation.venue,
          price: reservation.price,
          deposit: reservation.depositAmount,
        }),
      ),
    };
  } catch (error) {
    if (!(await getReservationById(id))) return { ok: false, error: 'gone' };

    console.error('[booth] could not hold the booking', error);
    return { ok: false, error: 'server' };
  }
}
