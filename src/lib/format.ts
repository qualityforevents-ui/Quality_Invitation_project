import { EVENT_TIMEZONE } from './constants';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Egyptian invitations print Western digits even in Arabic text, so every formatter
 * here pins the numbering system to latn. Without this, ar-EG returns Arabic Indic
 * digits and the date reads as ١٨ أغسطس ٢٠٢٦, which is not what these cards look like.
 */
const AR_LOCALE = 'ar-EG-u-nu-latn';
const EN_LOCALE = 'en-GB';

function locale(lang: Lang): string {
  return lang === 'AR' ? AR_LOCALE : EN_LOCALE;
}

/**
 * The offset of a zone at a given instant, in milliseconds.
 *
 * Egypt reintroduced daylight saving in 2023, so Cairo is UTC+2 for a winter katb
 * ketab and UTC+3 for a summer wedding. Hardcoding either one puts the countdown an
 * hour out for half the year, so the offset is read from the runtime's zone data.
 */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  // Hour 24 shows up at midnight in some runtimes. Normalise it to 0.
  const hour = get('hour') % 24;

  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));

  return asUtc - instant;
}

/**
 * Combines the stored calendar date with the stored "HH:MM" string and resolves the
 * pair as a wall clock time in Cairo, returning the true instant.
 *
 * eventDate is stored as UTC midnight standing for a calendar day, so the date parts
 * are read with UTC getters. Reading them locally would shift the day for anyone
 * west of Greenwich, including the Vercel build machine.
 */
export function getEventInstant(eventDate: Date, eventTime: string): Date {
  const [hourRaw, minuteRaw] = eventTime.split(':');
  const hour = Number.parseInt(hourRaw ?? '0', 10) || 0;
  const minute = Number.parseInt(minuteRaw ?? '0', 10) || 0;

  const naive = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate(),
    hour,
    minute,
    0,
  );

  // One correction pass, then a second in case the first landed on the other side of
  // a daylight saving transition.
  const firstGuess = naive - zoneOffsetMs(naive, EVENT_TIMEZONE);
  const secondOffset = zoneOffsetMs(firstGuess, EVENT_TIMEZONE);

  return new Date(naive - secondOffset);
}

/** "18 أغسطس 2026" / "18 August 2026" */
export function formatEventDate(eventDate: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(eventDate);
}

/**
 * The date broken into its pieces, so a theme can set them apart from each other.
 *
 * The classic theme prints the day large between two rules with the month and year
 * beneath, which needs the parts separately. `day` and `year` come back as bare
 * digits, so they are safe to isolate as left to right text; `month` is a word and
 * must not be.
 */
export function formatEventDateParts(
  eventDate: Date,
  lang: Lang,
): { day: string; month: string; year: string; weekday: string } {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale(lang), { ...options, timeZone: 'UTC' }).format(eventDate);

  return {
    day: part({ day: 'numeric' }),
    month: part({ month: 'long' }),
    year: part({ year: 'numeric' }),
    weekday: part({ weekday: 'long' }),
  };
}

/** "الثلاثاء" / "Tuesday" */
export function formatEventWeekday(eventDate: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(eventDate);
}

/**
 * The clock and the period, kept apart.
 *
 * They are returned separately so the caller can isolate the clock as left to right
 * text without doing the same to the word beside it. Forcing "8:00 مساءً" as a whole
 * into left to right order puts the period on the wrong side for an Arabic reader.
 *
 * Built by hand rather than through Intl because ar-EG returns a bare "م" for the
 * period, and an invitation wants the full word.
 */
export function formatEventTimeParts(
  eventTime: string,
  lang: Lang,
): { clock: string; period: string } {
  const [hourRaw, minuteRaw] = eventTime.split(':');
  const hour24 = Number.parseInt(hourRaw ?? '0', 10) || 0;
  const minute = (Number.parseInt(minuteRaw ?? '0', 10) || 0).toString().padStart(2, '0');

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const isAfternoon = hour24 >= 12;

  const period = lang === 'AR' ? (isAfternoon ? 'مساءً' : 'صباحاً') : isAfternoon ? 'PM' : 'AM';

  return { clock: `${hour12}:${minute}`, period };
}

/** "8:00 مساءً" / "8:00 PM", for places that need one string, such as metadata. */
export function formatEventTime(eventTime: string, lang: Lang): string {
  const { clock, period } = formatEventTimeParts(eventTime, lang);
  return `${clock} ${period}`;
}

/**
 * Today's date in Cairo, as "YYYY-MM-DD".
 *
 * Resolved against the event timezone rather than the machine's, so a server running in
 * UTC and a customer standing in Egypt agree about what day it is. They otherwise
 * disagree for the last three hours of every Egyptian evening.
 */
export function todayInCairo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Value for a date input, "YYYY-MM-DD", read in UTC to match how it is stored. */
export function toDateInputValue(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" from a date input into the UTC midnight we store. */
export function fromDateInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Short, human date for the admin and the status screen. */
export function formatShortDateTime(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: EVENT_TIMEZONE,
  }).format(date);
}
