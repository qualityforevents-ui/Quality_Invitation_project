import Link from 'next/link';
import { Search } from 'lucide-react';
import { AdminHeader, EmptyState, InvitationRow, SectionHeading } from '@/components/admin/AdminChrome';
import { requireOperator } from '@/lib/admin-auth';
import { getPending, getStats, isStale, search, STALE_AFTER_HOURS } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string }> };

/**
 * The queue, and the box you paste a request id into. Nothing else above the fold.
 *
 * This screen used to open on four statistics. They are the numbers you want when you
 * wonder how the business is doing, which is not what anyone opens this screen to find
 * out — the job is that a WhatsApp message just arrived and somebody is waiting. So the
 * work is at the top now and the numbers are at the bottom, where a glance still finds
 * them and they are not standing between the operator and the queue.
 *
 * Drafts and reviews used to be two links stapled to the bottom of this page. They are
 * tabs now, so they are gone from here.
 */
export default async function AdminHome({ searchParams }: Props) {
  await requireOperator();

  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const [stats, pending, results] = await Promise.all([
    getStats(),
    getPending(),
    query ? search(query) : Promise.resolve([]),
  ]);

  // getPending returns longest wait first, so the late ones are already at the front.
  // Splitting them is a heading, not a re-sort.
  const late = pending.filter(isStale);
  const fresh = pending.filter((invitation) => !isStale(invitation));

  return (
    <>
      <AdminHeader title="الطلبات" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4 pb-28">
        {/*
          The single most frequent action in this whole product: a WhatsApp message
          arrives carrying a request id, the operator pastes it here. So it is the first
          thing on the screen and it is big enough to hit without aiming.
        */}
        <form action="/admin" method="get" className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-adm-muted"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="رقم الطلب أو الموبايل أو الاسم"
              autoComplete="off"
              className="w-full rounded-xl border border-adm-control bg-adm-panel py-3.5 ps-10 pe-4 text-base text-adm-text outline-none placeholder:text-adm-muted focus:border-adm-accent focus:ring-2 focus:ring-adm-accent/25"
            />
          </div>
          <button
            type="submit"
            className="press tap-target shrink-0 rounded-xl bg-adm-accent px-5 font-semibold text-white"
          >
            بحث
          </button>
        </form>

        {query ? (
          <section className="flex flex-col gap-2">
            <SectionHeading
              action={
                <Link href="/admin" className="press text-xs text-adm-muted underline underline-offset-4">
                  امسح البحث
                </Link>
              }
            >
              نتائج <span className="font-normal text-adm-muted">{query}</span>
            </SectionHeading>

            {results.length === 0 ? (
              <EmptyState>مفيش نتائج. جرب رقم الطلب بالكامل.</EmptyState>
            ) : (
              results.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} />
              ))
            )}
          </section>
        ) : null}

        {late.length > 0 ? (
          <section className="flex flex-col gap-2">
            <SectionHeading>
              <span className="text-adm-danger">متأخرة</span>
            </SectionHeading>
            <p className="text-xs leading-relaxed text-adm-muted">
              مستنيين أكتر من <span className="numeric">{STALE_AFTER_HOURS}</span> ساعات. دول ناس
              ضغطت الزرار ومبعتتش صورة التحويل، وغالبًا محتاجين تذكير.
            </p>
            {late.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} stale showWait />
            ))}
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          <SectionHeading>في انتظار التأكيد</SectionHeading>

          {pending.length === 0 ? (
            <EmptyState>مفيش طلبات مستنية. كله متظبط.</EmptyState>
          ) : fresh.length === 0 ? (
            <EmptyState>كل اللي مستني فوق.</EmptyState>
          ) : (
            fresh.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} showWait />
            ))
          )}
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeading>الأرقام</SectionHeading>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="اتعملت آخر 7 أيام" value={stats.builtLast7} />
            <Stat label="اتدفعت آخر 7 أيام" value={stats.paidLast7} />
            <Stat label="إيراد الشهر" value={stats.revenueThisMonth} suffix="ج" />
            {/*
              The health metric for the whole business. Kept on the home screen where a
              drop gets noticed rather than buried on a reports page nobody opens.
            */}
            <Stat
              label="تحويل، من بناء لدفع"
              value={stats.conversionRate === null ? null : Math.round(stats.conversionRate * 100)}
              suffix="%"
              hint={`${stats.conversionPaid} من ${stats.conversionBuilt} في 30 يوم`}
              accent
            />
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  suffix,
  hint,
  accent = false,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-adm-line bg-adm-panel px-3.5 py-3">
      <p className="text-[0.6875rem] text-adm-muted">{label}</p>
      <p className={accent ? 'mt-1 text-2xl font-bold text-adm-accent' : 'mt-1 text-2xl font-bold'}>
        <span className="numeric">{value === null ? '—' : value.toLocaleString('en-US')}</span>
        {suffix && value !== null ? (
          <span className="ms-1 text-sm font-medium text-adm-muted">{suffix}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-0.5 text-[0.625rem] text-adm-muted">{hint}</p> : null}
    </div>
  );
}
