import { notFound } from 'next/navigation';
import {
  activateInvitation,
  changeSlug,
  deactivateInvitation,
  extendExpiry,
  rejectInvitation,
} from '../../actions';
import { AdminHeader, StatusPill } from '@/components/admin/AdminChrome';
import { MiniInvitation } from '@/components/invitation/MiniInvitation';
import { requireOperator } from '@/lib/admin-auth';
import { getById } from '@/lib/admin-queries';
import { editUrl, publicInvitationUrl, PRICE_EGP } from '@/lib/constants';
import { formatEventDate, formatEventTime, formatShortDateTime } from '@/lib/format';
import { getTrack, trackName } from '@/lib/music';
import { customerWhatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ApprovalPage({ params, searchParams }: Props) {
  await requireOperator();

  const { id } = await params;
  const { error } = await searchParams;

  const invitation = await getById(id);
  if (!invitation) notFound();

  const publicUrl = publicInvitationUrl(invitation.slug);
  const isActive = invitation.status === 'ACTIVE';

  const deliveryMessage = `تم تفعيل دعوتكم\nرقم الطلب: ${invitation.requestId}\nرابط الدعوة: ${publicUrl}\n\nرابط التعديل، احتفظوا بيه لنفسكم:\n${editUrl(invitation.editToken)}`;

  return (
    <>
      <AdminHeader title={`${invitation.name1} و ${invitation.name2}`} back="/admin" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-20">
        <div className="flex items-center justify-between gap-3">
          <span dir="ltr" className="font-mono text-lg font-bold">
            {invitation.requestId}
          </span>
          <StatusPill status={invitation.status} />
        </div>

        {/* What the operator is about to make public, drawn with the real data. */}
        <div className="overflow-hidden rounded-2xl border border-adm-line">
          <MiniInvitation
            themeId={invitation.themeId}
            lang={invitation.invitationLang}
            name1={invitation.name1}
            name2={invitation.name2}
            eventDate={invitation.eventDate}
            eventType={invitation.eventType}
          />
        </div>

        <dl className="divide-y divide-adm-line overflow-hidden rounded-xl border border-adm-line bg-adm-panel text-sm">
          <Row label="التاريخ">
            {formatEventDate(invitation.eventDate, 'AR')} ·{' '}
            {formatEventTime(invitation.eventTime, 'AR')}
          </Row>
          <Row label="المكان">{invitation.venueName || '—'}</Row>
          <Row label="الموسيقى">{trackName(getTrack(invitation.musicTrackId), 'AR')}</Row>
          <Row label="لغة الدعوة">{invitation.invitationLang === 'AR' ? 'عربي' : 'إنجليزي'}</Row>
          <Row label="الموبايل">
            {invitation.customerPhone ? (
              <a
                href={customerWhatsappLink(invitation.customerPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-adm-accent underline underline-offset-4"
                dir="ltr"
              >
                {invitation.customerPhone}
              </a>
            ) : (
              '—'
            )}
          </Row>
          <Row label="الرابط">
            <span dir="ltr" className="break-all text-adm-muted">
              {publicUrl}
            </span>
          </Row>
          <Row label="اتعملت">{formatShortDateTime(invitation.createdAt, 'AR')}</Row>
          {invitation.activatedAt ? (
            <Row label="اتفعّلت">{formatShortDateTime(invitation.activatedAt, 'AR')}</Row>
          ) : null}
          <Row label="مشاهدات">
            <span className="numeric">{invitation.viewCount}</span>
          </Row>
        </dl>

        {invitation.rejectReason ? (
          <p className="rounded-xl border border-adm-danger/30 bg-adm-danger/10 px-4 py-3 text-sm text-adm-danger">
            سبب الرفض: {invitation.rejectReason}
          </p>
        ) : null}

        {isActive ? (
          <>
            {invitation.customerPhone ? (
              <a
                href={customerWhatsappLink(invitation.customerPhone, deliveryMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target rounded-xl bg-adm-accent px-5 py-4 text-center text-base font-semibold text-adm-bg active:scale-[0.98]"
              >
                ابعت الروابط للعميل
              </a>
            ) : (
              <p className="rounded-xl border border-adm-warn/30 bg-adm-warn/10 px-4 py-3 text-sm text-adm-warn">
                مفيش رقم موبايل متسجل، فمفيش حد نبعتله. استنى العميل يكلمك على واتساب.
              </p>
            )}

            <form action={deactivateInvitation}>
              <input type="hidden" name="id" value={invitation.id} />
              <button
                type="submit"
                className="tap-target w-full rounded-xl border border-adm-danger/40 px-5 py-3 text-sm text-adm-danger"
              >
                إيقاف الرابط
              </button>
            </form>
          </>
        ) : (
          <>
            {/*
              The InstaPay reference goes in before activation, so a transfer can always
              be traced back to the invitation it paid for.
            */}
            <form action={activateInvitation} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={invitation.id} />

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-adm-muted">
                  مرجع التحويل من إنستاباي، المبلغ {PRICE_EGP} جنيه
                </span>
                <input
                  name="paymentNote"
                  defaultValue={invitation.paymentNote ?? ''}
                  dir="ltr"
                  placeholder="reference"
                  className="w-full rounded-xl border border-adm-line bg-adm-raised px-4 py-3 text-adm-text outline-none focus:border-adm-accent"
                />
              </label>

              <button
                type="submit"
                className="tap-target w-full rounded-xl bg-adm-accent px-5 py-4 text-base font-bold text-adm-bg active:scale-[0.98]"
              >
                تفعيل الدعوة
              </button>
            </form>

            <form action={rejectInvitation} className="flex flex-col gap-2 pt-2">
              <input type="hidden" name="id" value={invitation.id} />
              <input
                name="reason"
                placeholder="سبب الرفض، هيظهر للعميل"
                className="w-full rounded-xl border border-adm-line bg-adm-raised px-4 py-3 text-sm text-adm-text outline-none focus:border-adm-danger"
              />
              <button
                type="submit"
                className="tap-target w-full rounded-xl border border-adm-danger/40 px-5 py-3 text-sm text-adm-danger"
              >
                رفض
              </button>
            </form>
          </>
        )}
        {/*
          The customer builder, reached through the customer's own edit link. There is
          deliberately no second editing interface: this hands the operator the same
          form, the same live preview and the same components the customer used.
        */}
        <a
          href={`/edit/${invitation.editToken}`}
          className="tap-target rounded-xl border border-adm-line bg-adm-panel px-5 py-3.5 text-center text-sm font-medium"
        >
          عدّل الدعوة في نفس الفورم
        </a>

        <details className="rounded-xl border border-adm-line bg-adm-panel px-4 py-3">
          <summary className="cursor-pointer text-sm text-adm-muted">إعدادات متقدمة</summary>

          <div className="mt-4 flex flex-col gap-5">
            {error === 'slug' ? (
              <p className="rounded-lg bg-adm-danger/10 px-3 py-2 text-xs text-adm-danger">
                الرابط لازم يكون حروف إنجليزي صغيرة وأرقام وشرطات بس.
              </p>
            ) : null}
            {error === 'taken' ? (
              <p className="rounded-lg bg-adm-danger/10 px-3 py-2 text-xs text-adm-danger">
                الرابط ده محجوز لدعوة تانية.
              </p>
            ) : null}

            <form action={changeSlug} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={invitation.id} />
              <label className="text-xs text-adm-muted">
                الرابط العام. غيّره قبل ما تبعت اللينك، لأن تغييره بعد كده بيكسر القديم.
              </label>
              <div className="flex gap-2">
                <input
                  name="slug"
                  defaultValue={invitation.slug}
                  dir="ltr"
                  className="min-w-0 flex-1 rounded-xl border border-adm-line bg-adm-raised px-3 py-2.5 font-mono text-sm text-adm-text outline-none focus:border-adm-accent"
                />
                <button
                  type="submit"
                  className="tap-target shrink-0 rounded-xl border border-adm-line px-4 text-xs"
                >
                  حفظ
                </button>
              </div>
            </form>

            <form action={extendExpiry} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={invitation.id} />
              <label className="text-xs text-adm-muted">
                مد الصلاحية
                {invitation.expiresAt
                  ? `، بتنتهي ${formatShortDateTime(invitation.expiresAt, 'AR')}`
                  : ''}
              </label>
              <div className="flex gap-2">
                <input
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={30}
                  dir="ltr"
                  className="w-24 rounded-xl border border-adm-line bg-adm-raised px-3 py-2.5 text-sm text-adm-text outline-none focus:border-adm-accent"
                />
                <button
                  type="submit"
                  className="tap-target flex-1 rounded-xl border border-adm-line px-4 text-xs"
                >
                  مد بالأيام دي
                </button>
              </div>
            </form>
          </div>
        </details>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <dt className="w-24 shrink-0 text-xs text-adm-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{children}</dd>
    </div>
  );
}
