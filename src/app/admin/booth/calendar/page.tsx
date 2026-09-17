import Link from 'next/link';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminChrome';
import { SubmitButton } from '@/components/admin/ActionButton';
import { BoothStatusPill } from '@/components/admin/BoothRow';
import { requireOperator } from '@/lib/admin-auth';
import { todayInCairo } from '@/lib/format';
import { getBoothMonth } from '@/lib/photobooth/admin-queries';
import { cn } from '@/lib/cn';
import { blockDay } from '../actions';

export const dynamic = 'force-dynamic';

const WEEKDAYS = ['أحد', 'اتنين', 'تلات', 'أربع', 'خميس', 'جمعة', 'سبت'];

/** "YYYY-MM" for the month this screen is showing, defaulting to the current one. */
function resolveMonth(requested: string | undefined): string {
  if (requested && /^\d{4}-(0[1-9]|1[0-2])$/.test(requested)) return requested;
  return todayInCairo().slice(0, 7);
}

function shiftMonth(month: string, by: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + by, 1));
  return shifted.toISOString().slice(0, 7);
}

/**
 * The month at a glance, with what is on each day.
 *
 * Built as a grid of days rather than reusing the customer facing calendar component,
 * because the two are answering different questions. The customer's asks "can I book
 * this night"; this one asks "what is the booth doing this month, and where am I
 * overcommitted", and it has to show a count on every square and open to the bookings
 * behind it.
 *
 * The counts are recomputed from the reservations rather than read from the stored day
 * documents. This is the screen where drift would be noticed, so it should not be
 * reading the thing that might have drifted.
 */
export default async function BoothCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  await requireOperator();

  const { month: requestedMonth, day: openDay } = await searchParams;
  const month = resolveMonth(requestedMonth);

  const days = await getBoothMonth(month);
  const today = todayInCairo();

  // Blank squares before the first, so the 1st lands under its real weekday.
  const leading = new Date(`${month}-01T00:00:00Z`).getUTCDay();

  const selected = openDay ? days.find((day) => day.date === openDay) : null;

  return (
    <>
      <AdminHeader title="تقويم الفوتوبوث" back="/admin/booth" subtitle={month} />

      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-28">
        <nav className="mb-4 flex items-center justify-between gap-2">
          <Link
            href={`/admin/booth/calendar?month=${shiftMonth(month, -1)}`}
            aria-label="الشهر اللي فات"
            className="press tap-target flex size-10 items-center justify-center rounded-xl border border-adm-control bg-adm-panel"
          >
            {/* The chevrons are mirrored in RTL so "back" points the way the reader
                came from rather than the way the glyph was drawn. */}
            <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
          </Link>

          <p className="numeric text-sm font-bold">{month}</p>

          <Link
            href={`/admin/booth/calendar?month=${shiftMonth(month, 1)}`}
            aria-label="الشهر الجاي"
            className="press tap-target flex size-10 items-center justify-center rounded-xl border border-adm-control bg-adm-panel"
          >
            <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
          </Link>
        </nav>

        <div className="grid grid-cols-7 gap-1 text-center text-[0.625rem] text-adm-muted">
          {WEEKDAYS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: leading }, (_, index) => (
            <span key={`blank-${index}`} aria-hidden />
          ))}

          {days.map((day) => {
            const full = day.used >= day.total;
            const isToday = day.date === today;

            return (
              <Link
                key={day.date}
                href={`/admin/booth/calendar?month=${month}&day=${day.date}`}
                aria-label={`${day.date}، ${day.used} من ${day.total}`}
                className={cn(
                  'press flex aspect-square flex-col items-center justify-center rounded-lg border text-xs',
                  day.overbooked
                    ? 'border-adm-danger bg-adm-danger/10 text-adm-danger'
                    : full
                      ? 'border-adm-warn/50 bg-adm-warn/10 text-adm-warn'
                      : day.used > 0
                        ? 'border-adm-success/40 bg-adm-success/8 text-adm-success'
                        : 'border-adm-line bg-adm-panel text-adm-muted',
                  isToday && 'ring-2 ring-adm-accent',
                  day.date === openDay && 'ring-2 ring-adm-accent',
                )}
              >
                <span className="numeric font-bold">{Number(day.date.slice(-2))}</span>
                {day.used > 0 ? (
                  <span className="numeric text-[0.625rem]">
                    {day.used}/{day.total}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.6875rem] text-adm-muted">
          <Legend className="border-adm-line bg-adm-panel" label="فاضي" />
          <Legend className="border-adm-success/40 bg-adm-success/8" label="فيه حجز" />
          <Legend className="border-adm-warn/50 bg-adm-warn/10" label="مليان" />
          <Legend className="border-adm-danger bg-adm-danger/10" label="فوق الطاقة" />
        </ul>

        {selected ? (
          <section className="mt-6 rounded-2xl border border-adm-line bg-adm-panel p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="numeric text-sm font-bold">{selected.date}</h2>
              <span className="numeric text-xs text-adm-muted">
                {selected.used} من {selected.total}
              </span>
            </div>

            {selected.overbooked ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-adm-danger/50 bg-adm-danger/8 px-3 py-2.5 text-xs text-adm-danger">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  اليوم ده فيه حجوزات أكتر من عدد الفوتوبوثات. لازم حد يشوفه.
                </span>
              </p>
            ) : null}

            <div className="mt-3 flex flex-col gap-2">
              {selected.reservations.length === 0 ? (
                <p className="text-xs text-adm-muted">مفيش حاجة في اليوم ده.</p>
              ) : (
                selected.reservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    href={`/admin/booth/${reservation.id}`}
                    className="press-soft flex items-center gap-2 rounded-xl border border-adm-line px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                      {reservation.customerName}
                    </span>
                    <span className="numeric text-[0.6875rem] text-adm-muted">
                      {reservation.startTime}
                    </span>
                    <BoothStatusPill status={reservation.status} />
                  </Link>
                ))
              )}
            </div>

            {/*
              Blocking is a reservation like any other, so the one set of counting rules
              covers it. A separate list of blocked dates would be a second thing the
              availability engine had to remember to consult.
            */}
            <form action={blockDay} className="mt-4 border-t border-adm-line pt-4">
              <input type="hidden" name="eventDate" value={selected.date} />
              <label className="block text-xs font-medium text-adm-muted" htmlFor="block-note">
                اقفل اليوم ده
              </label>
              <input
                id="block-note"
                name="notes"
                placeholder="السبب، اختياري"
                className="mt-1.5 h-10 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
              />
              <SubmitButton variant="secondary" size="md" className="mt-2" pendingLabel="بيتقفل">
                اقفل اليوم
              </SubmitButton>
            </form>
          </section>
        ) : null}
      </main>
    </>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden className={cn('size-3 rounded border', className)} />
      {label}
    </li>
  );
}
