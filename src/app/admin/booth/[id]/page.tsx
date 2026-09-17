import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, MessageCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import { AdminHeader, SectionHeading } from '@/components/admin/AdminChrome';
import { ConfirmSubmit, SubmitButton } from '@/components/admin/ActionButton';
import { BoothStatusPill, formatHoldLeft } from '@/components/admin/BoothRow';
import { requireOperator } from '@/lib/admin-auth';
import { boothStatusUrl } from '@/lib/constants';
import { formatShortDateTime } from '@/lib/format';
import { getBoothReservation } from '@/lib/photobooth/admin-queries';
import { BOOTH_AREAS, getBoothPackage } from '@/lib/photobooth/config';
import { customerWhatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import {
  cancelBooking,
  changeBookingDate,
  completeBooking,
  confirmBooking,
  editBooking,
  unblockDay,
} from '../actions';

export const dynamic = 'force-dynamic';

/**
 * One booking, and everything that can be done to it.
 *
 * Actions first, details second. The operator opens this from a queue with one thing in
 * mind — confirm it, cancel it, move it — and the details are what they check on the
 * way to doing that, not what they came for.
 */
export default async function BoothDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();

  const { id } = await params;
  const reservation = await getBoothReservation(id);
  if (!reservation) notFound();

  const tier = getBoothPackage(reservation.packageId);
  const holdLeft = formatHoldLeft(reservation.holdExpiresAt);
  const isBlock = reservation.status === 'BLOCKED';

  return (
    <>
      <AdminHeader
        title={reservation.customerName || 'حجز'}
        back="/admin/booth"
        subtitle={reservation.bookingId}
      />

      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-28">
        <div className="flex items-center gap-2">
          <BoothStatusPill status={reservation.status} />
          {holdLeft ? (
            <span
              className={cn(
                'text-xs',
                holdLeft === 'انتهى' ? 'font-semibold text-adm-danger' : 'text-adm-warn',
              )}
            >
              {holdLeft}
            </span>
          ) : null}
          <SyncBadge state={reservation.syncState} error={reservation.syncError} />
        </div>

        {/* ------------------------------------------------------------ actions */}

        <section className="mt-5 flex flex-col gap-2">
          {!isBlock && reservation.status !== 'CONFIRMED' && reservation.status !== 'COMPLETED' ? (
            <form action={confirmBooking}>
              <input type="hidden" name="id" value={reservation.id} />
              <SubmitButton size="lg" pendingLabel="بيتأكد">
                أكّد الحجز واستلمت العربون
              </SubmitButton>
            </form>
          ) : null}

          {reservation.status === 'CONFIRMED' ? (
            <form action={completeBooking}>
              <input type="hidden" name="id" value={reservation.id} />
              <SubmitButton variant="secondary" pendingLabel="بيتقفل">
                خلص، اقفله
              </SubmitButton>
            </form>
          ) : null}

          <div className="flex gap-2">
            {reservation.customerPhone ? (
              <a
                href={customerWhatsappLink(reservation.customerPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="press tap-target flex flex-1 items-center justify-center gap-2 rounded-xl border border-adm-control bg-adm-panel px-3 py-3 text-sm font-semibold text-adm-success"
              >
                <MessageCircle aria-hidden className="size-4" />
                واتساب
              </a>
            ) : null}

            {reservation.notionPageId ? (
              <a
                href={`https://notion.so/${reservation.notionPageId.replace(/-/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press tap-target flex flex-1 items-center justify-center gap-2 rounded-xl border border-adm-control bg-adm-panel px-3 py-3 text-sm font-semibold"
              >
                <ExternalLink aria-hidden className="size-4" />
                Notion
              </a>
            ) : null}
          </div>

          {!isBlock ? (
            <form action={cancelBooking}>
              <input type="hidden" name="id" value={reservation.id} />
              <input
                name="reason"
                placeholder="سبب الإلغاء، هيظهر للعميل"
                className="mb-2 h-10 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
              />
              <ConfirmSubmit confirmLabel="أيوة، ألغي الحجز" pendingLabel="بيتلغي">
                ألغي الحجز
              </ConfirmSubmit>
            </form>
          ) : (
            <form action={unblockDay}>
              <input type="hidden" name="id" value={reservation.id} />
              <ConfirmSubmit confirmLabel="أيوة، افتح اليوم" pendingLabel="بيتفتح">
                افتح اليوم ده تاني
              </ConfirmSubmit>
            </form>
          )}
        </section>

        {/* ------------------------------------------------------------- change */}

        <section className="mt-8">
          <SectionHeading>غيّر اليوم</SectionHeading>
          <form action={changeBookingDate} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={reservation.id} />
            <input
              type="date"
              name="eventDate"
              defaultValue={reservation.eventDate}
              required
              className="numeric h-11 min-w-0 flex-1 rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
            />
            <SubmitButton variant="secondary" size="sm" className="w-auto px-4" pendingLabel="...">
              انقل
            </SubmitButton>
          </form>
          <p className="mt-2 text-[0.6875rem] text-adm-muted">
            النقل بيعيد حساب اليومين، اللي كان واللي راح ليه. لو اليوم الجديد مليان هيتحجز
            برضه وهيتعلّم إنه فوق الطاقة.
          </p>
        </section>

        {/* --------------------------------------------------------------- edit */}

        <section className="mt-8">
          <SectionHeading>التفاصيل</SectionHeading>

          <form action={editBooking} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="id" value={reservation.id} />

            <Field label="الاسم" name="customerName" defaultValue={reservation.customerName} />
            <Field
              label="الموبايل"
              name="customerPhone"
              defaultValue={reservation.customerPhone}
              dir="ltr"
              inputMode="numeric"
            />
            <Field label="المكان" name="venue" defaultValue={reservation.venue} />

            <label className="block">
              <span className="text-xs font-medium text-adm-muted">المنطقة</span>
              <select
                name="area"
                defaultValue={reservation.area}
                className="mt-1.5 h-11 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
              >
                {BOOTH_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nameAr}
                  </option>
                ))}
              </select>
            </label>

            <Field label="المناسبة" name="eventType" defaultValue={reservation.eventType} />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="الساعة"
                name="startTime"
                type="time"
                defaultValue={reservation.startTime}
              />
              <Field
                label="عدد الساعات"
                name="hours"
                type="number"
                defaultValue={String(reservation.hours)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="السعر"
                name="price"
                type="number"
                defaultValue={String(reservation.price)}
              />
              <Field
                label="العربون"
                name="depositAmount"
                type="number"
                defaultValue={String(reservation.depositAmount)}
              />
            </div>

            <label className="block">
              <span className="text-xs font-medium text-adm-muted">ملاحظات</span>
              <textarea
                name="notes"
                rows={3}
                defaultValue={reservation.notes ?? ''}
                className="mt-1.5 w-full rounded-xl border border-adm-control bg-adm-panel px-3 py-2 text-sm outline-none"
              />
            </label>

            <SubmitButton variant="secondary" pendingLabel="بيتحفظ">
              احفظ التعديلات
            </SubmitButton>
          </form>
        </section>

        {/* ------------------------------------------------------------- read only */}

        <section className="mt-8 rounded-2xl border border-adm-line bg-adm-panel p-4">
          <dl className="flex flex-col gap-2 text-xs">
            <Row label="الباقة" value={tier.nameAr} />
            <Row label="مصدر الحجز" value={SOURCE_LABELS[reservation.source] ?? reservation.source} />
            <Row label="العربون اتدفع" value={reservation.depositPaid ? 'أيوة' : 'لسه'} />
            <Row
              label="اتعمل"
              value={formatShortDateTime(reservation.createdAt, 'AR')}
              numeric
            />
            <Row
              label="آخر تعديل"
              value={formatShortDateTime(reservation.updatedAt, 'AR')}
              numeric
            />
            {reservation.lastSyncedAt ? (
              <Row
                label="آخر مزامنة"
                value={formatShortDateTime(reservation.lastSyncedAt, 'AR')}
                numeric
              />
            ) : null}
            {reservation.cancelReason ? (
              <Row label="سبب الإلغاء" value={reservation.cancelReason} />
            ) : null}
          </dl>

          {/*
            The customer's own status link, so the operator can open exactly what the
            customer is looking at while they are on the phone to them.
          */}
          {!isBlock ? (
            <Link
              href={boothStatusUrl(reservation.statusToken)}
              target="_blank"
              className="press mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-adm-accent"
            >
              <ExternalLink aria-hidden className="size-3.5" />
              صفحة العميل
            </Link>
          ) : null}
        </section>
      </main>
    </>
  );
}

const SOURCE_LABELS: Record<string, string> = {
  site: 'الموقع',
  admin: 'الأدمن',
  notion: 'Notion',
};

/**
 * Whether this row and its Notion page agree.
 *
 * `pending` is normal for a second or two after every edit: the push runs after the
 * response. It is worth showing anyway, because a row stuck on pending is how a broken
 * integration announces itself, and the alternative is discovering it when the two
 * systems have disagreed for a week.
 */
function SyncBadge({ state, error }: { state: string; error: string | null }) {
  if (state === 'ok') return null;

  return (
    <span
      title={error ?? undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold',
        state === 'error'
          ? 'bg-adm-danger/12 text-adm-danger'
          : 'bg-adm-raised text-adm-muted',
      )}
    >
      {state === 'error' ? (
        <TriangleAlert aria-hidden className="size-3" />
      ) : (
        <RefreshCw aria-hidden className="size-3" />
      )}
      {state === 'error' ? 'المزامنة وقعت' : 'بيتزامن'}
    </span>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  dir,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  dir?: 'ltr' | 'rtl';
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-adm-muted">{label}</span>
      <input
        name={name}
        type={type}
        dir={dir}
        inputMode={inputMode}
        defaultValue={defaultValue}
        className={cn(
          'mt-1.5 h-11 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none',
          dir === 'ltr' && 'numeric',
        )}
      />
    </label>
  );
}

function Row({ label, value, numeric }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-adm-muted">{label}</dt>
      <dd className={cn('text-end font-medium', numeric && 'numeric')}>{value}</dd>
    </div>
  );
}
