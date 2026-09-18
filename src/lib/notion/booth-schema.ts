import { createHash } from 'node:crypto';
import { SITE_URL } from '@/lib/constants';
import { isValidDateString } from '@/lib/photobooth/availability';
import { normaliseEgyptianPhone } from '@/lib/validation';
import type { NotionPage } from './client';
import type { BoothReservation, BoothStatus } from '@/lib/types';

/**
 * The contract between this codebase and the Bookings database the business already
 * runs on.
 *
 * This file was originally written against a database the site would create from
 * scratch. It is now written against one that has been in daily use since July, with
 * real customers in it, and that difference is the whole design: the operator's columns
 * and habits are the fixed point, and the site adapts. Three properties were added
 * (`Booking ID`, `Status`, `Admin link`) and nothing was renamed, retyped or removed.
 *
 * The consequences worth knowing:
 *
 *   `Time` is free text, because that is how it has always been filled in: "7 to 12",
 *   "3 to 5:30", "3 hours". It is parsed on the way in and written back in the same
 *   shape, rather than being split into two tidy columns the operator would have to
 *   start filling differently.
 *
 *   `Package Price` is a select whose options are strings like "2999 EGP", "2000EGP"
 *   and "1500". The number is parsed out of whichever one is set. Writing uses the
 *   canonical "NNNN EGP" form, and Notion creates the option if it is new.
 *
 *   `Deposit Received` and `Done` stay the operator's interface. `Status` is written
 *   alongside them for the states checkboxes cannot express, and reading falls back to
 *   the checkboxes whenever `Status` is empty — which it is on all 26 existing rows.
 *
 * Renaming a column in Notion breaks this with nothing to catch it at build time, which
 * is why every name lives here and nowhere else.
 */
export const PROPS = {
  /** Title. The customer, or "Blocked" on a manual block. */
  name: 'Client Name',
  /** Added for the site. The reference a customer quotes and the operator searches. */
  bookingId: 'Booking ID',
  /** Added for the site. Empty on every row that predates it; see statusFromNotion. */
  status: 'Status',
  /** Date, day only. */
  date: 'Date',
  /** Free text, e.g. "7 to 12". */
  time: 'Time',
  /** Select of price labels, e.g. "2999 EGP". */
  packagePrice: 'Package Price',
  /** Number. The amount actually taken, not a percentage. */
  depositPaid: 'Deposit Paid',
  /** Checkbox. The operator's own signal that a booking is real. */
  depositReceived: 'Deposit Received',
  /** Checkbox. The operator's own signal that the job is finished. */
  done: 'Done',
  phone: 'Phone Number',
  venue: 'Venue',
  eventType: 'Event Type',
  notes: 'Notes',
  /** Added for the site. Written, never read. */
  adminLink: 'Admin link',
} as const;

const STATUS_TO_NOTION: Record<BoothStatus, string> = {
  REQUESTED: 'Requested',
  HELD: 'Held',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  BLOCKED: 'Blocked',
};

const STATUS_FROM_NOTION = new Map<string, BoothStatus>(
  Object.entries(STATUS_TO_NOTION).map(([status, label]) => [label, status as BoothStatus]),
);

/* --------------------------------------------------------------- time parsing */

export type ParsedTime = { startTime: string | null; hours: number | null };

/**
 * Reads the operator's own way of writing a time.
 *
 * Every example in the live database is one of three shapes: a range ("7 to 12",
 * "3 to 5:30"), a bare start ("6"), or a duration ("3 hours"). None of them carry am or
 * pm, because everybody involved knows an Egyptian wedding starts in the evening.
 *
 * So the parser has to make that assumption explicit: a bare hour from 1 to 11 is the
 * afternoon or evening. "7 to 12" is nineteen hundred to midnight, five hours, not
 * seven in the morning to noon. Twelve is the one genuine ambiguity and is read as
 * noon when it starts a range and midnight when it ends one, which is what makes
 * "7 to 12" five hours rather than negative seven.
 *
 * Returns nulls rather than guessing when it cannot tell. A null start time leaves
 * whatever the site already had, so a badly shaped string can never wipe a real value.
 */
export function parseNotionTime(raw: string | null): ParsedTime {
  if (!raw) return { startTime: null, hours: null };

  const text = raw.trim().toLowerCase();
  if (!text) return { startTime: null, hours: null };

  // "3 hours", "3 hrs", "3h" — a duration with no start.
  const durationOnly = /^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)$/.exec(text);
  if (durationOnly) {
    return { startTime: null, hours: Number(durationOnly[1]) };
  }

  const clock = /(\d{1,2})(?::(\d{2}))?/g;
  const found: { hour: number; minute: number }[] = [];

  for (const match of text.matchAll(clock)) {
    found.push({ hour: Number(match[1]), minute: Number(match[2] ?? 0) });
    if (found.length === 2) break;
  }

  if (found.length === 0) return { startTime: null, hours: null };

  const startHour = toEveningHour(found[0].hour, true);
  const startTime = `${pad(startHour)}:${pad(found[0].minute)}`;

  if (found.length === 1) return { startTime, hours: null };

  const endHour = toEveningHour(found[1].hour, false);

  const startMinutes = startHour * 60 + found[0].minute;
  let endMinutes = endHour * 60 + found[1].minute;

  // Midnight and beyond. "7 to 12" ends the next day, so the end is pushed forward
  // rather than producing a negative duration.
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;

  const hours = Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;

  // A range longer than a working day is a misread rather than a booking.
  return { startTime, hours: hours > 0 && hours <= 14 ? hours : null };
}

/**
 * A bare hour, as an Egyptian event actually means it.
 *
 * 1 to 11 is the afternoon or evening. 12 starting a range is noon; 12 ending one is
 * midnight, and the caller pushes it to the following day. 13 and above are already
 * unambiguous and are left alone.
 */
function toEveningHour(hour: number, isStart: boolean): number {
  if (hour === 12) return isStart ? 12 : 0;
  if (hour >= 1 && hour <= 11) return hour + 12;
  return hour % 24;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Writes a time back the way the operator writes it.
 *
 * "20:00" plus four hours becomes "8 to 12", not "20:00 to 00:00". The database is read
 * by a human every day and a row the site touched should not be identifiable by its
 * formatting.
 */
export function formatNotionTime(startTime: string, hours: number): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(startTime);
  if (!match) return startTime;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);

  const endTotal = (startHour * 60 + startMinute + Math.round(hours * 60)) % (24 * 60);
  const endHour = Math.floor(endTotal / 60);
  const endMinute = endTotal % 60;

  const show = (hour: number, minute: number) => {
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return minute === 0 ? String(twelve) : `${twelve}:${pad(minute)}`;
  };

  return `${show(startHour, startMinute)} to ${show(endHour, endMinute)}`;
}

/* -------------------------------------------------------------- price parsing */

/**
 * The number inside a price label.
 *
 * The live options are "1500", "2000EGP", "3700EGP", "2999 EGP", "4000 EGP" and
 * "3500 EGP" — six spellings of the same idea, because they were typed by hand over
 * several months. Stripping to digits reads all of them, and anything unparseable
 * returns null so the site keeps the price it already had.
 */
export function parseNotionPrice(label: string | null): number | null {
  if (!label) return null;
  const digits = label.replace(/[^\d]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** The canonical spelling the site writes. Notion adds the option if it is new. */
export function formatNotionPrice(price: number): string {
  return `${price} EGP`;
}

/* -------------------------------------------------------------- site to Notion */

function title(value: string) {
  return { title: [{ type: 'text', text: { content: value.slice(0, 2000) } }] };
}

function text(value: string | null) {
  if (!value) return { rich_text: [] };
  return { rich_text: [{ type: 'text', text: { content: value.slice(0, 2000) } }] };
}

/**
 * The properties written to Notion for one reservation.
 *
 * `Deposit Received` and `Done` are written from the status rather than being left
 * alone, because they are what the operator's existing views, filters and calendar are
 * built on. A booking the site confirms has to tick the box, or it is invisible in
 * every view they already use.
 *
 * Nothing writes to `Location`, `Guesbook Type`, `Photo Completed`, or any of the five
 * add on columns. Those are the operator's, the site has no opinion about them, and
 * writing an empty value would erase a real one.
 */
export function toNotionProperties(reservation: BoothReservation): Record<string, unknown> {
  return {
    [PROPS.name]: title(
      reservation.status === 'BLOCKED' ? 'Blocked' : reservation.customerName || 'Booking',
    ),
    [PROPS.bookingId]: text(reservation.bookingId),
    [PROPS.status]: { select: { name: STATUS_TO_NOTION[reservation.status] } },
    // Day only. A booth booking is a day, not an instant; see BoothReservation.eventDate.
    [PROPS.date]: { date: { start: reservation.eventDate } },
    [PROPS.time]: text(
      reservation.startTime ? formatNotionTime(reservation.startTime, reservation.hours) : null,
    ),
    [PROPS.packagePrice]: {
      select: reservation.price > 0 ? { name: formatNotionPrice(reservation.price) } : null,
    },
    [PROPS.depositPaid]: { number: reservation.depositAmount || null },
    [PROPS.depositReceived]: { checkbox: reservation.depositPaid },
    [PROPS.done]: { checkbox: reservation.status === 'COMPLETED' },
    [PROPS.phone]: { phone_number: reservation.customerPhone || null },
    [PROPS.venue]: text(reservation.venue),
    [PROPS.eventType]: text(reservation.eventType),
    [PROPS.notes]: text(reservation.notes),
    [PROPS.adminLink]: { url: `${SITE_URL}/admin/booth/${reservation.id}` },
  };
}

/* -------------------------------------------------------------- Notion to site */

function readText(property: unknown): string {
  const value = property as {
    rich_text?: { plain_text?: string }[];
    title?: { plain_text?: string }[];
  };
  const parts = value?.rich_text ?? value?.title ?? [];
  return parts
    .map((part) => part.plain_text ?? '')
    .join('')
    .trim();
}

function readNumber(property: unknown): number | null {
  const value = (property as { number?: number | null })?.number;
  return typeof value === 'number' ? value : null;
}

function readSelect(property: unknown): string | null {
  return (property as { select?: { name?: string } })?.select?.name ?? null;
}

function readCheckbox(property: unknown): boolean {
  return Boolean((property as { checkbox?: boolean })?.checkbox);
}

function readDate(property: unknown): string | null {
  return (property as { date?: { start?: string } })?.date?.start ?? null;
}

function readPhone(property: unknown): string | null {
  return (property as { phone_number?: string | null })?.phone_number ?? null;
}

/**
 * What a row's status is, when the row may predate the Status column entirely.
 *
 * All 26 bookings that existed before this integration have an empty Status and are
 * described purely by two checkboxes, which is how the business has always worked. The
 * fallback reads them the way the operator means them:
 *
 *   Done ticked is a job that happened.
 *   Deposit received is a booking that is real and holds its date.
 *   Neither is an enquiry that has not been paid for.
 *
 * Status wins when it is set, so the moment the operator starts using it, or the site
 * writes one, the explicit value takes over.
 */
export function statusFromNotion(
  explicit: string | null,
  depositReceived: boolean,
  done: boolean,
): BoothStatus | null {
  const mapped = explicit ? STATUS_FROM_NOTION.get(explicit) : undefined;
  if (mapped) return mapped;

  if (done) return 'COMPLETED';
  if (depositReceived) return 'CONFIRMED';
  return null;
}

/** Everything a Notion row can say about a booking. Every field may be absent. */
export type NotionBooking = {
  bookingId: string | null;
  status: BoothStatus | null;
  eventDate: string | null;
  startTime: string | null;
  hours: number | null;
  price: number | null;
  depositAmount: number | null;
  depositPaid: boolean;
  customerName: string;
  customerPhone: string | null;
  venue: string | null;
  eventType: string | null;
  notes: string | null;
};

/**
 * Reads a Notion row into the shape the site understands.
 *
 * Every field is defended, because the other end of this is a database a human has been
 * typing into at midnight since July. A date property can hold a datetime, a number can
 * be empty, a phone arrives in three different formats across the existing rows, and a
 * time is whatever felt natural that evening. None of those are errors worth refusing a
 * sync over.
 */
export function fromNotionPage(page: NotionPage): NotionBooking {
  const p = page.properties;

  const rawDate = readDate(p[PROPS.date]);
  // Notion returns "2026-09-26", or a full instant if somebody turned the time on.
  const eventDate = rawDate ? rawDate.slice(0, 10) : null;

  const phone = readPhone(p[PROPS.phone]);
  const { startTime, hours } = parseNotionTime(readText(p[PROPS.time]) || null);

  const depositReceived = readCheckbox(p[PROPS.depositReceived]);
  const done = readCheckbox(p[PROPS.done]);

  return {
    bookingId: readText(p[PROPS.bookingId]) || null,
    status: statusFromNotion(readSelect(p[PROPS.status]), depositReceived, done),
    eventDate: eventDate && isValidDateString(eventDate) ? eventDate : null,
    startTime,
    hours,
    price: parseNotionPrice(readSelect(p[PROPS.packagePrice])),
    depositAmount: readNumber(p[PROPS.depositPaid]),
    depositPaid: depositReceived,
    customerName: readText(p[PROPS.name]),
    // Normalised to the local form the site stores, so one search finds a booking
    // whether it was typed "+20 10 14331202", "0155 6082820" or "01095414333" — all
    // three of which are in the live data.
    customerPhone: phone ? normaliseEgyptianPhone(phone) : null,
    venue: readText(p[PROPS.venue]) || null,
    eventType: readText(p[PROPS.eventType]) || null,
    notes: readText(p[PROPS.notes]) || null,
  };
}

/* ------------------------------------------------------------------ loop guard */

/**
 * A fingerprint of everything that actually travels between the two systems.
 *
 * This is what stops the sync chasing its own tail: the site writes, Notion echoes the
 * write back as a webhook, and the echo hashes to the stored value and is dropped.
 *
 * Only the mapped fields are in it. The site knows things Notion has no column for —
 * the area, the unit count, the package id, the status token, where the booking came
 * from — and putting any of those in here would make a purely local change look like a
 * Notion edit. `Admin link` is excluded for the same reason from the other side: it is
 * derived, not data.
 */
export type SyncedFields = {
  bookingId: string;
  status: BoothStatus;
  eventDate: string;
  startTime: string;
  hours: number;
  price: number;
  depositAmount: number;
  depositPaid: boolean;
  customerName: string;
  customerPhone: string;
  venue: string;
  eventType: string;
  notes: string | null;
};

export function syncHashOf(fields: SyncedFields): string {
  /*
   * An explicit ordered array, hashed as JSON.
   *
   * Not JSON.stringify of the object: that serialises in key insertion order, so moving
   * a field in the type above would change every hash at once and make every row look
   * edited. The array pins the order, and JSON pins the separator so a venue containing
   * a comma cannot collide with two fields.
   */
  const parts = [
    fields.bookingId,
    fields.status,
    fields.eventDate,
    fields.startTime,
    fields.hours,
    fields.price,
    fields.depositAmount,
    fields.depositPaid,
    fields.customerName,
    fields.customerPhone,
    fields.venue,
    fields.eventType,
    fields.notes ?? '',
  ];

  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

/** The same fingerprint, taken from a reservation. */
export function hashReservation(reservation: BoothReservation): string {
  return syncHashOf(reservation);
}
