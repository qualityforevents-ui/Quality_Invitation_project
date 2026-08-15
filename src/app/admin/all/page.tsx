import Link from 'next/link';
import { AdminHeader, InvitationRow } from '@/components/admin/AdminChrome';
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
      <AdminHeader title="كل الدعوات" back="/admin" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-16">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value === 'ALL' ? '/admin/all' : `/admin/all?status=${filter.value}`}
              className={cn(
                'press tap-target inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-medium',
                active === filter.value
                  ? 'border-adm-accent bg-adm-accent/15 text-adm-accent'
                  : 'border-adm-line text-adm-muted',
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        {invitations.length === 0 ? (
          <p className="rounded-xl border border-adm-line bg-adm-panel px-4 py-6 text-center text-sm text-adm-muted">
            مفيش حاجة هنا
          </p>
        ) : (
          invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))
        )}
      </main>
    </>
  );
}
