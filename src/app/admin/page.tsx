import Link from 'next/link';
import { AdminHeader, InvitationRow } from '@/components/admin/AdminChrome';
import { requireOperator } from '@/lib/admin-auth';
import { getPending, getStats, isStale, search, STALE_AFTER_HOURS } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  await requireOperator();

  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const [stats, pending, results] = await Promise.all([
    getStats(),
    getPending(),
    query ? search(query) : Promise.resolve([]),
  ]);

  const staleCount = pending.filter(isStale).length;

  return (
    <>
      <AdminHeader title="qlty admin" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-4 pb-16">
        {/*
          The single most frequent action in this whole product: a WhatsApp message
          arrives carrying a request id, the operator pastes it here. So it is the first
          thing on the landing screen and it is big enough to hit without aiming.
        */}
        <form action="/admin" method="get" className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="رقم الطلب أو الموبايل أو الاسم"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-adm-line bg-adm-raised px-4 py-3.5 text-base text-adm-text outline-none placeholder:text-adm-muted focus:border-adm-accent"
          />
          <button
            type="submit"
            className="tap-target shrink-0 rounded-xl bg-adm-accent px-5 font-semibold text-adm-bg active:scale-95"
          >
            بحث
          </button>
        </form>

        {query ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs text-adm-muted">
              نتائج البحث عن <span className="text-adm-text">{query}</span>
            </h2>
            {results.length === 0 ? (
              <p className="rounded-xl border border-adm-line bg-adm-panel px-4 py-5 text-center text-sm text-adm-muted">
                مفيش نتائج
              </p>
            ) : (
              results.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} />
              ))
            )}
          </section>
        ) : null}

        <section className="grid grid-cols-2 gap-2">
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
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">في انتظار التأكيد</h2>
            <Link href="/admin/all" className="text-xs text-adm-muted underline underline-offset-4">
              كل الدعوات
            </Link>
          </div>

          {staleCount > 0 ? (
            <p className="rounded-xl border border-adm-danger/30 bg-adm-danger/10 px-3.5 py-2.5 text-xs leading-relaxed text-adm-danger">
              في {staleCount} طلب مستني أكتر من {STALE_AFTER_HOURS} ساعات. دول ناس ضغطت الزرار
              ومبعتتش صورة التحويل، وغالبًا محتاجين تذكير.
            </p>
          ) : null}

          {pending.length === 0 ? (
            <p className="rounded-xl border border-adm-line bg-adm-panel px-4 py-6 text-center text-sm text-adm-muted">
              مفيش طلبات مستنية
            </p>
          ) : (
            pending.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                invitation={invitation}
                stale={isStale(invitation)}
              />
            ))
          )}
        </section>

        <Link
          href="/admin/reviews"
          className="rounded-xl border border-adm-line bg-adm-panel px-4 py-3.5 text-sm"
        >
          الآراء، مراجعة ونشر
        </Link>

        <Link
          href="/admin/drafts"
          className="rounded-xl border border-adm-line bg-adm-panel px-4 py-3.5 text-sm"
        >
          المسودات، ناس بنت دعوة ومدفعتش
        </Link>
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
    <div className="rounded-xl border border-adm-line bg-adm-panel px-3.5 py-3">
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
