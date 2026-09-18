import type { Metadata } from 'next';
import Link from 'next/link';
import { Ban, CircleCheck, Clock, PartyPopper } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { TrackedSupportButton } from '@/components/site/TrackedSupportButton';
import { getDictionary } from '@/i18n/ui';
import { formatShortDateTime } from '@/lib/format';
import { getBoothPackage } from '@/lib/photobooth/config';
import { getReservationByStatusToken } from '@/lib/photobooth/reservations';
import { getUiLang } from '@/lib/session';
import { buildBoothSupportMessage } from '@/lib/whatsapp';
import type { BoothStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Never indexed, and told so twice.
 *
 * The header here and the X-Robots-Tag in next.config are the same instruction by two
 * routes, because this URL is a secret token that identifies a named customer, their
 * phone number and the address they will be at on a particular night.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Where a customer watches their own booking.
 *
 * Authorised by holding the token in the URL, which is the same mechanism as the
 * invitation edit link and exists for the same reason: there are no customer accounts
 * anywhere in this product. The link is sent to one person and is the only way in.
 *
 * A booking that cannot be found renders the same calm page as one that can, with a
 * line saying there is nothing here. It deliberately does not distinguish between "that
 * token is wrong" and "that booking was deleted", because the difference is only useful
 * to somebody guessing tokens.
 */
export default async function BoothStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const reservation = await getReservationByStatusToken(token).catch(() => null);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-24">
      <header className="flex h-16 items-center">
        <Link href="/" className="press">
          <BrandLogo className="h-9" />
        </Link>
      </header>

      <h1 className="mt-8 text-2xl font-bold">{t.photobooth.statusTitle}</h1>

      {!reservation ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white/50 px-4 py-6 text-center text-sm text-ink-soft">
          {t.photobooth.statusNotFound}
        </p>
      ) : (
        <>
          <StatusBanner status={reservation.status} t={t} />

          <dl className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-white/60 p-5 text-sm">
            <Row label={t.photobooth.summaryBooking} value={reservation.bookingId} numeric />
            <Row label={t.photobooth.summaryDate} value={reservation.eventDate} numeric />
            <Row label={t.photobooth.summaryTime} value={reservation.startTime} numeric />
            <Row
              label={t.photobooth.summaryPackage}
              value={
                lang === 'AR'
                  ? getBoothPackage(reservation.packageId).nameAr
                  : getBoothPackage(reservation.packageId).nameEn
              }
            />
            <Row label={t.photobooth.summaryVenue} value={reservation.venue} />
            <Row
              label={t.photobooth.summaryTotal}
              value={String(reservation.price)}
              suffix={t.home.currency}
              numeric
            />
            <Row
              label={t.photobooth.summaryDeposit}
              value={String(reservation.depositAmount)}
              suffix={t.home.currency}
              numeric
            />
          </dl>

          {/*
            The countdown, shown only while it means something. A hold expiry printed
            beside a confirmed booking would read as a threat to a customer who has
            already paid.
          */}
          {reservation.status === 'HELD' && reservation.holdExpiresAt ? (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-gold/40 bg-gold-wash px-4 py-3 text-sm text-gold-deep">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {t.photobooth.statusHeldExpiry}{' '}
                <span className="numeric font-medium">
                  {formatShortDateTime(reservation.holdExpiresAt, lang)}
                </span>
              </span>
            </p>
          ) : null}

          {reservation.status === 'CANCELLED' && reservation.cancelReason ? (
            <p className="mt-4 text-sm text-ink-soft">{reservation.cancelReason}</p>
          ) : null}

          <TrackedSupportButton
            // The booking id travels in the message, so the operator opening this chat
            // is not searching a name across two products to work out who it is.
            message={buildBoothSupportMessage(lang, reservation.bookingId)}
            label={t.photobooth.statusSupport}
            page="booth-status"
            contentCategory="photobooth"
          />
        </>
      )}
    </main>
  );
}

const TONE: Record<BoothStatus, { className: string; Icon: typeof Clock }> = {
  REQUESTED: { className: 'border-line bg-white/60 text-ink', Icon: Clock },
  HELD: { className: 'border-gold/40 bg-gold-wash text-gold-deep', Icon: Clock },
  CONFIRMED: { className: 'border-success/40 bg-success/5 text-success', Icon: CircleCheck },
  COMPLETED: { className: 'border-success/40 bg-success/5 text-success', Icon: PartyPopper },
  CANCELLED: { className: 'border-danger/40 bg-danger/5 text-danger', Icon: Ban },
  BLOCKED: { className: 'border-line bg-white/60 text-ink', Icon: Clock },
};

function StatusBanner({
  status,
  t,
}: {
  status: BoothStatus;
  t: ReturnType<typeof getDictionary>;
}) {
  const message: Record<BoothStatus, string> = {
    REQUESTED: t.photobooth.statusRequested,
    HELD: t.photobooth.statusHeld,
    CONFIRMED: t.photobooth.statusConfirmed,
    COMPLETED: t.photobooth.statusCompleted,
    CANCELLED: t.photobooth.statusCancelled,
    // A customer can never reach a BLOCKED row: blocks have no customer and no status
    // token. The entry exists so this map is total and cannot be indexed into nothing.
    BLOCKED: t.photobooth.statusCancelled,
  };

  const { className, Icon } = TONE[status];

  return (
    <p className={`mt-6 flex items-start gap-2.5 rounded-xl border px-4 py-4 text-sm ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <span className="leading-relaxed text-pretty">{message[status]}</span>
    </p>
  );
}

function Row({
  label,
  value,
  suffix,
  numeric = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-end">
        <span className={numeric ? 'numeric font-medium' : 'font-medium'}>{value}</span>
        {suffix ? <span className="ms-1 text-xs text-ink-soft">{suffix}</span> : null}
      </dd>
    </div>
  );
}
