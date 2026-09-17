import { createHash } from 'node:crypto';
import { SITE_URL } from '@/lib/constants';
import { isValidDateString } from '@/lib/photobooth/availability';
import { normaliseEgyptianPhone } from '@/lib/validation';
import type { NotionPage } from './client';
import type { BoothReservation, BoothSource, BoothStatus } from '@/lib/types';

/**
 * The contract between this codebase and a Notion database somebody edits by hand.
 *
 * These property names are the interface. Renaming a column in Notion breaks the sync
 * in a way no type checker can catch, which is exactly why they are collected here
 * rather than written as string literals across four files: when it does break, there
 * is one place to look and one place to fix.
 *
 * docs/notion-booth-setup.md builds the database from this file. If the two ever
 * disagree, this file is right and the document is stale.
 */
export const PROPS = {
  name: 'Name',
  bookingId: 'Booking ID',
  status: 'Status',
  eventDate: 'Event date',
  startTime: 'Start time',
  hours: 'Hours',
  units: 'Units',
  package: 'Package',
  price: 'Price',
  deposit: 'Deposit',
  depositPaid: 'Deposit paid',
  phone: 'Phone',
  venue: 'Venue',
  area: 'Area',
  eventType: 'Event type',
  notes: 'Notes',
  source: 'Source',
  adminLink: 'Admin link',
  lastSynced: 'Last synced',
} as const;

/**
 * Notion select options are capitalised words; ours are SCREAMING_SNAKE constants.
 *
 * Mapped explicitly in both directions rather than by casing a string, because a human
 * editing Notion will eventually pick an option that does not map, and a silent
 * fallback to REQUESTED would quietly un-confirm a paid booking. Anything unrecognised
 * coming back is treated as "leave the status alone".
 */
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

const SOURCE_TO_NOTION: Record<BoothSource, string> = {
  site: 'Site',
  admin: 'Admin',
  notion: 'Notion',
};

const SOURCE_FROM_NOTION = new Map<string, BoothSource>(
  Object.entries(SOURCE_TO_NOTION).map(([source, label]) => [label, source as BoothSource]),
);

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
 * `Admin link` is written by the site and never read back. It is there so the operator
 * reading a row in Notion is one tap from the screen that can actually change it,
 * rather than searching the admin for a booking id they are looking straight at.
 */
export function toNotionProperties(reservation: BoothReservation): Record<string, unknown> {
  return {
    [PROPS.name]: title(
      reservation.status === 'BLOCKED' ? 'Blocked' : reservation.customerName || 'Booking',
    ),
    [PROPS.bookingId]: text(reservation.bookingId),
    [PROPS.status]: { select: { name: STATUS_TO_NOTION[reservation.status] } },
    // Date only, no time. A booth booking is a day; see BoothReservation.eventDate.
    [PROPS.eventDate]: { date: { start: reservation.eventDate } },
    [PROPS.startTime]: text(reservation.startTime),
    [PROPS.hours]: { number: reservation.hours },
    [PROPS.units]: { number: reservation.units },
    [PROPS.package]: { select: { name: reservation.packageId } },
    [PROPS.price]: { number: reservation.price },
    [PROPS.deposit]: { number: reservation.depositAmount },
    [PROPS.depositPaid]: { checkbox: reservation.depositPaid },
    [PROPS.phone]: { phone_number: reservation.customerPhone || null },
    [PROPS.venue]: text(reservation.venue),
    [PROPS.area]: { select: reservation.area ? { name: reservation.area } : null },
    [PROPS.eventType]: { select: reservation.eventType ? { name: reservation.eventType } : null },
    [PROPS.notes]: text(reservation.notes),
    [PROPS.source]: { select: { name: SOURCE_TO_NOTION[reservation.source] } },
    [PROPS.adminLink]: { url: `${SITE_URL}/admin/booth/${reservation.id}` },
    [PROPS.lastSynced]: { date: { start: new Date().toISOString() } },
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

/** Everything a Notion page can say about a booking. Every field may be absent. */
export type NotionBooking = {
  bookingId: string | null;
  status: BoothStatus | null;
  eventDate: string | null;
  startTime: string | null;
  hours: number | null;
  units: number | null;
  packageId: string | null;
  price: number | null;
  depositAmount: number | null;
  depositPaid: boolean;
  customerName: string;
  customerPhone: string | null;
  venue: string | null;
  area: string | null;
  eventType: string | null;
  notes: string | null;
  source: BoothSource | null;
};

/**
 * Reads a Notion page into the shape the site understands.
 *
 * Every field is optional and every one is defended, because the other end of this is a
 * text box a human types into at midnight. A date property can hold a datetime, a
 * number property can be empty, a phone number arrives however somebody pasted it, and
 * a select can hold an option nobody in this code has heard of. None of those are
 * errors worth refusing a sync over; they are values to be normalised or ignored.
 */
export function fromNotionPage(page: NotionPage): NotionBooking {
  const p = page.properties;

  const rawDate = readDate(p[PROPS.eventDate]);
  // Notion hands back "2026-03-14" for a date, or a full ISO instant if somebody turned
  // the time on. Only the day is ever wanted here.
  const eventDate = rawDate ? rawDate.slice(0, 10) : null;

  const phone = readPhone(p[PROPS.phone]);

  return {
    bookingId: readText(p[PROPS.bookingId]) || null,
    status: STATUS_FROM_NOTION.get(readSelect(p[PROPS.status]) ?? '') ?? null,
    eventDate: eventDate && isValidDateString(eventDate) ? eventDate : null,
    startTime: readText(p[PROPS.startTime]) || null,
    hours: readNumber(p[PROPS.hours]),
    units: readNumber(p[PROPS.units]),
    packageId: readSelect(p[PROPS.package]),
    price: readNumber(p[PROPS.price]),
    depositAmount: readNumber(p[PROPS.deposit]),
    depositPaid: readCheckbox(p[PROPS.depositPaid]),
    customerName: readText(p[PROPS.name]),
    // Normalised to the same local form the site stores, so one operator search finds
    // a booking whether it was typed as +20 10 ... in Notion or 010... on the site.
    customerPhone: phone ? normaliseEgyptianPhone(phone) : null,
    venue: readText(p[PROPS.venue]) || null,
    area: readSelect(p[PROPS.area]),
    eventType: readSelect(p[PROPS.eventType]),
    notes: readText(p[PROPS.notes]) || null,
    source: SOURCE_FROM_NOTION.get(readSelect(p[PROPS.source]) ?? '') ?? null,
  };
}

/* ------------------------------------------------------------------ loop guard */

/**
 * A fingerprint of everything that travels between the two systems.
 *
 * This is what stops the sync chasing its own tail. The site writes to Notion, Notion
 * fires a webhook back saying the page changed, and without this the site would read
 * its own write, decide the page differs from the row, write again, and loop until
 * something rate limits. Storing the hash of what was sent means the echo arrives,
 * hashes to the same value, and is dropped.
 *
 * Only the synced fields are in it. `Last synced` is written on every push and would
 * make every hash unique, which would defeat the entire mechanism; `updatedAt` and the
 * status token are not Notion's business at all.
 */
export type SyncedFields = {
  bookingId: string;
  status: BoothStatus;
  eventDate: string;
  startTime: string;
  hours: number;
  units: number;
  packageId: string;
  price: number;
  depositAmount: number;
  depositPaid: boolean;
  customerName: string;
  customerPhone: string;
  venue: string;
  area: string;
  eventType: string;
  notes: string | null;
  source: BoothSource;
};

export function syncHashOf(fields: SyncedFields): string {
  /*
   * An explicit ordered array, hashed as JSON.
   *
   * Not JSON.stringify of the object itself: that serialises in key insertion order, so
   * moving a field in the type above would change every hash in the database at once
   * and make every row look like it had been edited in Notion. The array pins the order
   * to this list, and JSON pins the separator so a venue containing a comma cannot
   * collide with two fields.
   */
  const parts = [
    fields.bookingId,
    fields.status,
    fields.eventDate,
    fields.startTime,
    fields.hours,
    fields.units,
    fields.packageId,
    fields.price,
    fields.depositAmount,
    fields.depositPaid,
    fields.customerName,
    fields.customerPhone,
    fields.venue,
    fields.area,
    fields.eventType,
    fields.notes ?? '',
    fields.source,
  ];

  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

/** The same fingerprint, taken from a reservation. */
export function hashReservation(reservation: BoothReservation): string {
  return syncHashOf(reservation);
}
