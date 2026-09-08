import Link from 'next/link';
import { signOut } from '@/app/admin/login/actions';
import { cn } from '@/lib/cn';
import { formatShortDateTime } from '@/lib/format';
import type { Invitation } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  AWAITING_CONFIRMATION: 'في انتظار التأكيد',
  ACTIVE: 'مفعّلة',
  EXPIRED: 'منتهية',
  REJECTED: 'مرفوضة',
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-adm-line text-adm-muted',
  AWAITING_CONFIRMATION: 'bg-adm-warn/15 text-adm-warn',
  ACTIVE: 'bg-adm-accent/15 text-adm-accent',
  EXPIRED: 'bg-adm-line text-adm-muted',
  REJECTED: 'bg-adm-danger/15 text-adm-danger',
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium whitespace-nowrap',
        STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function AdminHeader({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-adm-line bg-adm-bg/95 px-4 py-3 backdrop-blur">
      {back ? (
        <Link
          href={back}
          aria-label="رجوع"
          className="press tap-target -ms-2 flex items-center justify-center rounded-lg px-2 text-adm-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 rtl:rotate-180">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : null}

      <h1 className="flex-1 truncate text-base font-bold">{title}</h1>

      <form action={signOut}>
        <button type="submit" className="text-xs text-adm-muted underline underline-offset-4">
          خروج
        </button>
      </form>
    </header>
  );
}

/**
 * One row in a list of invitations. Dense on purpose: the operator is scanning these on
 * a phone looking for one particular couple.
 */
export function InvitationRow({
  invitation,
  stale = false,
}: {
  invitation: Invitation;
  stale?: boolean;
}) {
  return (
    <Link
      href={`/admin/invitation/${invitation.id}`}
      className="flex items-center gap-3 rounded-xl border border-adm-line bg-adm-panel px-3.5 py-3 transition active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">
            {invitation.name1} <span className="text-adm-muted">&amp;</span> {invitation.name2}
          </p>
          {stale ? (
            <span className="shrink-0 rounded-full bg-adm-danger/15 px-2 py-0.5 text-[0.625rem] font-medium text-adm-danger">
              متأخرة
            </span>
          ) : null}
        </div>

        <p className="mt-1 flex items-center gap-2 text-xs text-adm-muted">
          <span dir="ltr" className="font-mono">
            {invitation.requestId}
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatShortDateTime(invitation.updatedAt, 'AR')}</span>
        </p>
      </div>

      <StatusPill status={invitation.status} />
    </Link>
  );
}
