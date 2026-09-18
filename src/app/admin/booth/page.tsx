import Link from 'next/link';
import { CalendarDays, Plus, Settings } from 'lucide-react';
import { AdminHeader, EmptyState, SectionHeading } from '@/components/admin/AdminChrome';
import { BoothRow } from '@/components/admin/BoothRow';
import { requireOperator } from '@/lib/admin-auth';
import { BOOTH_CONFIG_IS_PLACEHOLDER } from '@/lib/photobooth/config';
import {
  findBoothReservations,
  getBookingsAwaitingCompletion,
  getBoothQueue,
  getUpcomingBookings,
} from '@/lib/photobooth/admin-queries';

export const dynamic = 'force-dynamic';

/**
 * The booth home: what is waiting, then what is coming.
 *
 * Queue first, in the same shape as the invitations queue next door. The operator opens
 * this to answer one question — is anybody waiting on me — and everything else on the
 * screen is below the answer.
 *
 * Search is an exact match on a booking id or a phone number rather than a text search.
 * Firestore has no substring query, and faking one by pulling every booking into the
 * function to filter it is a table scan dressed up as a feature. Both of those are what
 * the operator actually has in front of them: an id read out of a WhatsApp message, or
 * the number that message came from.
 */
export default async function BoothQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireOperator();

  const { q } = await searchParams;
  const term = (q ?? '').trim();

  const [queue, upcoming, awaitingCompletion, found] = await Promise.all([
    getBoothQueue(),
    getUpcomingBookings(),
    getBookingsAwaitingCompletion(),
    term ? findBoothReservations(term) : Promise.resolve(null),
  ]);

  return (
    <>
      <AdminHeader title="الفوتوبوث" subtitle="الحجوزات والمواعيد" />

      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-28">
        {/*
          The booth is running on invented prices until somebody replaces them. This
          cannot be allowed to look finished: every figure a customer is being quoted on
          the public page right now is a guess.
        */}
        {BOOTH_CONFIG_IS_PLACEHOLDER ? (
          <p className="mb-4 rounded-2xl border border-adm-warn/50 bg-adm-warn/8 px-4 py-3 text-xs leading-relaxed text-adm-warn">
            الأسعار والباقات والصور لسه بيانات مؤقتة في{' '}
            <span className="font-mono">src/lib/photobooth/config.ts</span>. لازم تتغير قبل ما
            الصفحة تروّج لحد.
          </p>
        ) : null}

        <div className="mb-4 flex gap-2">
          <Link
            href="/admin/booth/calendar"
            className="press tap-target flex flex-1 items-center justify-center gap-2 rounded-xl border border-adm-control bg-adm-panel px-3 py-3 text-sm font-semibold"
          >
            <CalendarDays aria-hidden className="size-4" />
            التقويم
          </Link>
          <Link
            href="/admin/booth/new"
            className="press tap-target flex flex-1 items-center justify-center gap-2 rounded-xl bg-adm-accent px-3 py-3 text-sm font-semibold text-white"
          >
            <Plus aria-hidden className="size-4" />
            حجز جديد
          </Link>
          <Link
            href="/admin/booth/settings"
            aria-label="الإعدادات"
            className="press tap-target flex size-11 shrink-0 items-center justify-center rounded-xl border border-adm-control bg-adm-panel"
          >
            <Settings aria-hidden className="size-4" />
          </Link>
        </div>

        {/* A plain GET form, so a search survives a reload and can be shared as a URL. */}
        <form method="get" className="mb-6 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={term}
            placeholder="رقم الحجز أو الموبايل"
            dir="auto"
            className="h-11 min-w-0 flex-1 rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="press tap-target rounded-xl border border-adm-control bg-adm-panel px-4 text-sm font-semibold"
          >
            دوّر
          </button>
        </form>

        {found ? (
          <section className="mb-8">
            <SectionHeading>نتيجة البحث</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {found.length === 0 ? (
                <EmptyState>مفيش حجز بالرقم ده.</EmptyState>
              ) : (
                found.map((reservation) => (
                  <BoothRow key={reservation.id} reservation={reservation} />
                ))
              )}
            </div>
          </section>
        ) : null}

        <section className="mb-8">
          <SectionHeading>مستنية منك</SectionHeading>
          <div className="mt-3 flex flex-col gap-2">
            {queue.length === 0 ? (
              <EmptyState>مفيش حاجة مستنية.</EmptyState>
            ) : (
              queue.map((reservation) => (
                <BoothRow key={reservation.id} reservation={reservation} showHold />
              ))
            )}
          </div>
        </section>

        {/*
          Confirmed bookings whose date has passed and which nobody has closed off. Put
          above the upcoming list on purpose: it is the only list here that quietly grows
          forever if it is ignored.
        */}
        {awaitingCompletion.length > 0 ? (
          <section className="mb-8">
            <SectionHeading>عدت ولسه مقفلتش</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {awaitingCompletion.map((reservation) => (
                <BoothRow key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeading>جاي قدام</SectionHeading>
          <div className="mt-3 flex flex-col gap-2">
            {upcoming.length === 0 ? (
              <EmptyState>مفيش حجوزات مأكدة جاية.</EmptyState>
            ) : (
              upcoming.map((reservation) => (
                <BoothRow key={reservation.id} reservation={reservation} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
