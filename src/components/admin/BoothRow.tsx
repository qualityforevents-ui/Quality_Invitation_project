import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getBoothPackage } from '@/lib/photobooth/config';
import { customerWhatsappLink } from '@/lib/whatsapp';
import type { BoothReservation } from '@/lib/types';

const BOOTH_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'طلب',
  HELD: 'محجوز مؤقت',
  CONFIRMED: 'مأكد',
  COMPLETED: 'خلص',
  CANCELLED: 'ملغي',
  BLOCKED: 'مقفول',
};

/**
 * The same colour language as the invitation statuses beside it.
 *
 * Green is done, amber is a clock running, grey is over or inert, red is cancelled. An
 * operator moving between the two queues on one phone should not have to learn two
 * palettes.
 */
const BOOTH_STATUS_STYLES: Record<string, string> = {
  REQUESTED: 'bg-adm-raised text-adm-muted',
  HELD: 'bg-adm-warn/12 text-adm-warn',
  CONFIRMED: 'bg-adm-success/12 text-adm-success',
  COMPLETED: 'bg-adm-raised text-adm-muted',
  CANCELLED: 'bg-adm-danger/12 text-adm-danger',
  BLOCKED: 'bg-adm-raised text-adm-muted',
};

export function BoothStatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold whitespace-nowrap',
        BOOTH_STATUS_STYLES[status] ?? BOOTH_STATUS_STYLES.REQUESTED,
        className,
      )}
    >
      {BOOTH_STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * How much of a hold is left, in Arabic.
 *
 * A hold expiry is only useful as a duration. "بكرة 14:30" makes the operator subtract
 * the current time before they know whether to chase somebody, and chasing the right
 * person before their hold lapses is the entire job this number exists for.
 *
 * Arabic counts in four buckets rather than English's two, and a singular where a dual
 * belongs reads as broken. The same shape as formatWaited in lib/admin-queries.
 */
export function formatHoldLeft(expiresAt: Date | null, now: Date = new Date()): string | null {
  if (!expiresAt) return null;

  const ms = expiresAt.getTime() - now.getTime();
  if (ms <= 0) return 'انتهى';

  const hours = Math.floor(ms / 3_600_000);

  if (hours < 1) {
    const minutes = Math.max(1, Math.round(ms / 60_000));
    if (minutes === 1) return 'باقي دقيقة';
    if (minutes === 2) return 'باقي دقيقتين';
    if (minutes <= 10) return `باقي ${minutes} دقايق`;
    return `باقي ${minutes} دقيقة`;
  }

  if (hours === 1) return 'باقي ساعة';
  if (hours === 2) return 'باقي ساعتين';
  if (hours <= 10) return `باقي ${hours} ساعات`;
  return `باقي ${hours} ساعة`;
}

/**
 * One booth booking in a list.
 *
 * Carries the date, the price and the hold countdown, for the same reason the
 * invitation row carries the wait: the decision the operator is making is which of
 * these to deal with first, and that decision is made from exactly these three things.
 *
 * Not one big link, because the WhatsApp button inside it would be an anchor inside an
 * anchor, which browsers resolve by dropping the inner one.
 */
export function BoothRow({
  reservation,
  showHold = false,
}: {
  reservation: BoothReservation;
  showHold?: boolean;
}) {
  const holdLeft = showHold ? formatHoldLeft(reservation.holdExpiresAt) : null;
  const expired = holdLeft === 'انتهى';
  const tier = getBoothPackage(reservation.packageId);
  const isBlock = reservation.status === 'BLOCKED';

  return (
    <div
      className={cn(
        'flex items-stretch gap-1 rounded-2xl border bg-adm-panel shadow-[0_1px_2px_rgba(35,32,27,0.04)]',
        expired ? 'border-adm-danger/55' : 'border-adm-line',
      )}
    >
      <Link
        href={`/admin/booth/${reservation.id}`}
        className="press-soft min-w-0 flex-1 rounded-2xl px-3.5 py-3"
      >
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-adm-text">
            {reservation.customerName || '؟'}
          </p>
          <BoothStatusPill status={reservation.status} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-adm-muted">
          {/* bdi, so a Latin booking id inside Arabic text is not reordered by the bidi
              algorithm into something the operator cannot read back over the phone. */}
          <span className="font-mono">
            <bdi>{reservation.bookingId}</bdi>
          </span>
          <span aria-hidden>·</span>
          <span className="numeric">{reservation.eventDate}</span>

          {!isBlock ? (
            <>
              <span aria-hidden>·</span>
              <span className="numeric font-semibold text-adm-accent">
                {reservation.price} ج
              </span>
            </>
          ) : null}

          {holdLeft ? (
            <>
              <span aria-hidden>·</span>
              <span className={cn(expired && 'font-semibold text-adm-danger')}>{holdLeft}</span>
            </>
          ) : null}
        </div>

        {!isBlock && reservation.venue ? (
          <p className="mt-1 truncate text-xs text-adm-muted">
            {reservation.venue} · {tier.nameAr}
          </p>
        ) : null}
      </Link>

      {reservation.customerPhone ? (
        <a
          href={customerWhatsappLink(reservation.customerPhone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`واتساب ${reservation.customerName}`}
          className="press tap-target me-2 flex size-11 shrink-0 self-center items-center justify-center rounded-xl border border-adm-line text-adm-success"
        >
          <MessageCircle aria-hidden className="size-4.5" />
        </a>
      ) : null}
    </div>
  );
}
