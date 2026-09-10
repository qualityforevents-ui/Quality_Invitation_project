import Link from 'next/link';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { SignOutControl } from './SignOutControl';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/cn';
import { formatWaited } from '@/lib/admin-queries';
import { packagePrice } from '@/lib/packages';
import { customerWhatsappLink } from '@/lib/whatsapp';
import type { Invitation } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  AWAITING_CONFIRMATION: 'مستنية',
  ACTIVE: 'مفعّلة',
  EXPIRED: 'منتهية',
  REJECTED: 'مرفوضة',
};

/**
 * Status colour now means what the colour means everywhere else.
 *
 * A live invitation used to be painted in the accent, which on the old surface was the
 * only bright colour and so read as "good" by default. On a gold surface the accent is
 * the brand, not a verdict, and using it for ACTIVE would put the same colour on the
 * primary button, the wordmark and a state. Live is green, waiting is amber, rejected
 * is red, and the two dead states are grey — which is also the order of how much they
 * should pull the eye.
 */
const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-adm-raised text-adm-muted',
  AWAITING_CONFIRMATION: 'bg-adm-warn/12 text-adm-warn',
  ACTIVE: 'bg-adm-success/12 text-adm-success',
  EXPIRED: 'bg-adm-raised text-adm-muted',
  REJECTED: 'bg-adm-danger/12 text-adm-danger',
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold whitespace-nowrap',
        STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * The bar at the top of every admin screen.
 *
 * The wordmark is the change. This surface carried no brand at all, which was defended
 * on the grounds that the operator should never confuse it with the customer site —
 * except the operator has never once been confused, and what the missing logo actually
 * did was make the tool feel like scaffolding rather than part of the company.
 *
 * Sign out moved into its own control and out of a bare text link sitting a thumb's
 * width from the back arrow. Losing a session at two in the morning while working
 * through a queue is not destructive, but it is infuriating, and it was one mis-tap
 * away on every screen.
 */
export function AdminHeader({
  title,
  back,
  subtitle,
}: {
  title: string;
  back?: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-adm-line bg-adm-bg/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-2.5">
        {back ? (
          <Link
            href={back}
            aria-label="رجوع"
            className="press tap-target -ms-2 flex items-center justify-center rounded-lg px-1 text-adm-muted"
          >
            <ChevronLeft aria-hidden className="size-5 rtl:rotate-180" />
          </Link>
        ) : (
          <BrandLogo className="-ms-1 h-9 shrink-0" alt="qlty" />
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-adm-text">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-adm-muted">{subtitle}</p> : null}
        </div>

        <SignOutControl />
      </div>
    </header>
  );
}

export function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-0.5">
      <h2 className="text-sm font-bold text-adm-text">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-adm-line bg-adm-panel/60 px-4 py-8 text-center text-sm text-adm-muted">
      {children}
    </p>
  );
}

/**
 * One invitation in a list.
 *
 * Three things were added to a row that used to carry names, a request id and a
 * timestamp. The price, because deciding whether a transfer matches is the job and the
 * amount was previously a tap away on the next screen. The wait, in words, because a
 * queue is sorted by it and a raw timestamp makes the operator do the subtraction. And
 * WhatsApp, because chasing somebody who went quiet was a two-screen trip for a link
 * the row already had the number for.
 *
 * The row is not one big link any more, and it cannot be: an anchor inside an anchor is
 * invalid and browsers resolve it by dropping the inner one, which would have made the
 * WhatsApp button a slightly odd way of opening the invitation.
 */
export function InvitationRow({
  invitation,
  stale = false,
  showWait = false,
}: {
  invitation: Invitation;
  stale?: boolean;
  showWait?: boolean;
}) {
  const waited = formatWaited(invitation.updatedAt);

  return (
    <div
      className={cn(
        'flex items-stretch gap-1 rounded-2xl border bg-adm-panel shadow-[0_1px_2px_rgba(35,32,27,0.04)]',
        stale ? 'border-adm-danger/55' : 'border-adm-line',
      )}
    >
      <Link
        href={`/admin/invitation/${invitation.id}`}
        className="press-soft min-w-0 flex-1 rounded-2xl px-3.5 py-3"
      >
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-adm-text">
            {invitation.name1 || '؟'} <span className="font-normal text-adm-muted">&amp;</span>{' '}
            {invitation.name2 || '؟'}
          </p>
          <StatusPill status={invitation.status} />
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-adm-muted">
          <span className="font-mono">
            <bdi>{invitation.requestId}</bdi>
          </span>
          <span aria-hidden>·</span>
          <span className="numeric font-semibold text-adm-accent">
            {packagePrice(invitation.package)} ج
          </span>
          {showWait ? (
            <>
              <span aria-hidden>·</span>
              <span className={cn(stale && 'font-semibold text-adm-danger')}>{waited}</span>
            </>
          ) : null}
        </div>
      </Link>

      {invitation.customerPhone ? (
        <a
          href={customerWhatsappLink(invitation.customerPhone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`واتساب ${invitation.name1}`}
          /* self-center, not stretched: a row is two lines tall and a full height
             button next to it reads as a second panel rather than an action. */
          className="press tap-target me-2 flex size-11 shrink-0 self-center items-center justify-center rounded-xl border border-adm-line text-adm-success"
        >
          <MessageCircle aria-hidden className="size-4.5" />
        </a>
      ) : null}
    </div>
  );
}
