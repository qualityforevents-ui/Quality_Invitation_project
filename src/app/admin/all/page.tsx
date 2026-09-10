import Link from 'next/link';
import { AdminHeader, EmptyState, InvitationRow } from '@/components/admin/AdminChrome';
import { requireOperator } from '@/lib/admin-auth';
import { listByStatus, type StatusFilter } from '@/lib/admin-queries';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'الكل' },
  { value: 'AWAITING_CONFIRMATION', label: 'مستنية' },
  { value: 'ACTIVE', label: 'مفعّلة' },
  { value: 'DRAFT', label: 'مسودات' },
  { value: 'REJECTED', label: 'مرفوضة' },
  { value: 'EXPIRED', label: 'منتهية' },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AllInvitationsPage({ searchParams }: Props) {
  await requireOperator();

  const { status } = await searchParams;
  const active = (FILTERS.find((f) => f.value === status)?.value ?? 'ALL') as StatusFilter;

  const invitations = await listByStatus(active);

  return (
    <>
      <AdminHeader title="كل الدعوات" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-28">
        {/*
          Sticky, because this list is a hundred rows long and the filter you are in is
          the one thing you cannot work out from the rows themselves.
        */}
        <div className="sticky top-14 z-10 -mx-4 bg-adm-bg/92 px-4 py-2 backdrop-blur">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {FILTERS.map((filter) => (
              <Link
                key={filter.value}
                href={filter.value === 'ALL' ? '/admin/all' : `/admin/all?status=${filter.value}`}
                aria-current={active === filter.value ? 'page' : undefined}
                className={cn(
                  'press inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-semibold',
                  active === filter.value
                    ? 'border-adm-accent bg-adm-accent text-white'
                    : 'border-adm-line bg-adm-panel text-adm-muted',
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        {invitations.length === 0 ? (
          <EmptyState>مفيش حاجة هنا.</EmptyState>
        ) : (
          invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))
        )}
      </main>
    </>
  );
}
