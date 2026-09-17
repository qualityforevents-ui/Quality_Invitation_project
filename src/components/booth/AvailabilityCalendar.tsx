'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/cn';
import { metaTrack } from '@/lib/meta/pixel';
import { BOOTH_FULL_DAY_IS_NEGOTIABLE } from '@/lib/photobooth/config';
import { boothWhatsappLink, buildBoothEnquiryMessage } from '@/lib/whatsapp';
import type { DayStatus } from '@/lib/photobooth/availability';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * Which nights the booth is free, as a month the visitor can page through.
 *
 * This is the part of the page that has to be true. Everything else is a description of
 * a service; this makes a promise about a specific Saturday, and a calendar that says a
 * date is free when it is not costs a customer and an apology. So it fetches rather
 * than being rendered once on the server: somebody who leaves the tab open through the
 * evening and comes back to book should not be looking at this afternoon's answer.
 *
 * The status is only ever four words wide. The endpoint does not return counts, so
 * neither does this: "last booth" is the most specific thing anybody outside the
 * business is ever told, and it is told because it is useful to the customer, not
 * because the number is interesting.
 */

type DayMap = Record<string, DayStatus>;

/** "YYYY-MM" for the month a Date falls in, in UTC to match how days are stored. */
function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** A calendar cell's Date turned back into the "YYYY-MM-DD" the engine speaks. */
function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * A "YYYY-MM-DD" turned into the local midnight Date react-day-picker compares against.
 *
 * Deliberately not `new Date('2026-03-14')`, which the spec parses as UTC midnight and
 * which therefore renders as the 13th for anybody west of Greenwich. Cairo is east of
 * it so this would not show up in Egypt, and it would be wrong for everybody testing
 * from anywhere else, which is the worst kind of bug to leave in.
 */
function toLocalDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function AvailabilityCalendar({
  lang,
  t,
  selected,
  onSelect,
}: {
  lang: Lang;
  t: Dictionary;
  selected: string | null;
  onSelect: (date: string, status: DayStatus) => void;
}) {
  /*
   * A booked day the visitor tapped anyway.
   *
   * With one booth a confirmed Saturday closes the calendar, but the business has a
   * second unit it rents out and dates do sometimes move. Refusing the tap outright
   * ends the conversation; offering WhatsApp keeps it alive without promising a booth
   * that may not exist.
   */
  const [askingAbout, setAskingAbout] = useState<string | null>(null);
  const [month, setMonth] = useState(() => new Date());
  const [days, setDays] = useState<DayMap>({});
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  /*
   * Three months a request, and each range is fetched once.
   *
   * Paging forward one month at a time and fetching one month each time would be three
   * round trips to look at a quarter. Asking for three and remembering which have
   * arrived means the common case, somebody flicking forward to find a free Saturday,
   * is one request.
   */
  const load = useCallback(async (from: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/photobooth/availability?from=${from}&months=3`);
      if (!response.ok) throw new Error(`availability responded ${response.status}`);

      const payload = (await response.json()) as { ok: boolean; days?: DayMap };
      if (!payload.ok || !payload.days) throw new Error('availability refused');

      setDays((previous) => ({ ...previous, ...payload.days }));
      setFailed(false);
    } catch (error) {
      console.error('[booth] could not load availability', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = monthKey(new Date(Date.UTC(month.getFullYear(), month.getMonth(), 1)));
    if (loaded.has(key)) return;

    setLoaded((previous) => new Set(previous).add(key));
    void load(key);
  }, [month, loaded, load]);

  /*
   * The four modifiers the calendar colours itself with.
   *
   * Built from the fetched map rather than from a predicate per day, because
   * react-day-picker calls a predicate for every visible cell on every render and this
   * one would be doing a lookup and a comparison forty two times a keystroke.
   */
  const modifiers = useMemo(() => {
    const buckets: Record<DayStatus, Date[]> = {
      available: [],
      last: [],
      full: [],
      unavailable: [],
    };

    for (const [key, status] of Object.entries(days)) {
      buckets[status]?.push(toLocalDate(key));
    }

    return buckets;
  }, [days]);

  const selectedDate = selected ? toLocalDate(selected) : undefined;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-line bg-white/60">
        <Calendar
          mode="single"
          // Radix and react-day-picker both read direction from a prop rather than from
          // the dir attribute on an ancestor, so it has to be handed over explicitly.
          dir={lang === 'AR' ? 'rtl' : 'ltr'}
          locale={undefined}
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          /*
           * Unavailable days are never selectable: they are in the past, inside the
           * notice period, or beyond the horizon, and no conversation changes that.
           *
           * Full days stay tappable when a booked date is worth discussing, so the tap
           * opens the WhatsApp prompt below rather than doing nothing at all.
           */
          disabled={
            BOOTH_FULL_DAY_IS_NEGOTIABLE
              ? modifiers.unavailable
              : [...modifiers.full, ...modifiers.unavailable]
          }
          onSelect={(date) => {
            if (!date) return;
            const key = dateKey(date);
            const status = days[key] ?? 'unavailable';

            if (status === 'full') {
              // Still reported, and this is the most valuable version of this event:
              // a visitor landing on "full" is demand the business is turning away.
              metaTrack('AvailabilityChecked', {
                content_category: 'photobooth',
                date_status: 'full',
              });
              setAskingAbout(key);
              return;
            }

            setAskingAbout(null);
            if (status !== 'available' && status !== 'last') return;

            /*
             * Reported with the status rather than just the date. A visitor who keeps
             * landing on "full" is a visitor being lost to capacity rather than to
             * price or to the page, and that is the difference between buying a second
             * booth and rewriting the copy.
             */
            metaTrack('AvailabilityChecked', {
              content_category: 'photobooth',
              date_status: status,
            });

            onSelect(key, status);
          }}
          modifiers={modifiers}
          modifiersClassNames={{
            last: 'text-gold-deep font-bold underline decoration-gold decoration-2 underline-offset-4',
            /*
              Struck through but not faded away. It is still a real, tappable thing when
              a booked day can be discussed, and 40 percent opacity reads as disabled.
            */
            full: BOOTH_FULL_DAY_IS_NEGOTIABLE
              ? 'line-through decoration-ink-faint text-ink-faint'
              : 'line-through opacity-40',
          }}
          className="w-full"
        />
      </div>

      <div
        // Polite rather than assertive: this updates while somebody is reading the page
        // and should not interrupt them, but a screen reader user tabbing to the
        // calendar needs to know it is still loading.
        aria-live="polite"
        className="mt-3 min-h-5 text-xs text-ink-faint"
      >
        {failed ? (
          <span className="text-danger">{t.photobooth.calendarError}</span>
        ) : loading ? (
          <span>{t.photobooth.calendarLoading}</span>
        ) : null}
      </div>

      {/*
        Shown in place of a refusal. The message carries the date, so the operator opens
        a chat that already says which Saturday is being asked about.
      */}
      {askingAbout ? (
        <div className="mt-4 rounded-lg border border-gold/40 bg-gold-wash px-4 py-3">
          <p className="text-sm font-semibold text-gold-deep">
            {t.photobooth.fullDayTitle} · <span className="numeric">{askingAbout}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft text-pretty">
            {t.photobooth.fullDayBody}
          </p>

          <a
            href={boothWhatsappLink(
              buildBoothEnquiryMessage(lang, { eventDate: askingAbout }),
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              metaTrack('Contact', {
                content_category: 'photobooth',
                page: 'photobooth-full-day',
              });
            }}
            className="press mt-3 inline-flex w-full items-center justify-center rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white"
          >
            {t.photobooth.fullDayCta}
          </a>
        </div>
      ) : null}

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
        <LegendItem className="bg-white ring-1 ring-line" label={t.photobooth.legendAvailable} />
        <LegendItem className="bg-gold/25 ring-1 ring-gold" label={t.photobooth.legendLast} />
        <LegendItem className="bg-cream-deep line-through" label={t.photobooth.legendFull} />
        <LegendItem className="bg-cream-deep opacity-50" label={t.photobooth.legendUnavailable} />
      </ul>
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn('size-3.5 rounded-sm', className)} aria-hidden="true" />
      {label}
    </li>
  );
}
