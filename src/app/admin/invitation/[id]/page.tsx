import { notFound } from 'next/navigation';
import { AlertTriangle, ExternalLink, MessageCircle, PencilLine } from 'lucide-react';
import {
  activateInvitation,
  changeSlug,
  deactivateInvitation,
  extendExpiry,
  rejectInvitation,
} from '../../actions';
import { AdminHeader, StatusPill } from '@/components/admin/AdminChrome';
import { ConfirmSubmit, SubmitButton } from '@/components/admin/ActionButton';
import { CopyValue } from '@/components/admin/CopyValue';
import { RejectReasonField } from '@/components/admin/RejectReasonField';
import { MiniInvitation } from '@/components/invitation/MiniInvitation';
import { requireOperator } from '@/lib/admin-auth';
import { getById } from '@/lib/admin-queries';
import { editUrl, publicInvitationUrl } from '@/lib/constants';
import { packageName, packagePrice } from '@/lib/packages';
import { formatEventDate, formatEventTime, formatShortDateTime, todayInCairo } from '@/lib/format';
import { getTrack, trackName } from '@/lib/music';
import { missingRequiredFields } from '@/lib/validation';
import { customerWhatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

/** What the customer is told is missing, in the words the builder used to ask for it. */
const FIELD_LABELS: Record<string, string> = {
  name1: 'اسم العروسة',
  name2: 'اسم العريس',
  venueName: 'المكان',
  eventTime: 'الميعاد',
  eventDate: 'التاريخ',
};

/**
 * The screen where money turns into a live link.
 *
 * It has one job and it used to bury it. The order was: a card preview, eleven rows of
 * detail, and only then the button that does the thing — which on a phone is most of a
 * screen of scrolling, every time, for the action performed more often than any other
 * in the product. The decision is at the top now, carrying the three facts the decision
 * actually needs (who, how much, which reference), and everything that is reference
 * material rather than input to the decision sits under it.
 */
export default async function ApprovalPage({ params, searchParams }: Props) {
  await requireOperator();

  const { id } = await params;
  const { error } = await searchParams;

  const invitation = await getById(id);
  if (!invitation) notFound();

  const publicUrl = publicInvitationUrl(invitation.slug);
  const isActive = invitation.status === 'ACTIVE';
  const price = packagePrice(invitation.package);

  /*
   * Activating an invitation that is missing a date or a venue publishes a broken page
   * under the couple's names. The builder will not let a customer reach payment in that
   * state, but the operator can arrive here from a search on any invitation at all, and
   * the old screen showed a dash in a row and left it at that.
   */
  const missing = missingRequiredFields(invitation, todayInCairo());

  const deliveryMessage = `تم تفعيل دعوتكم\nرقم الطلب: ${invitation.requestId}\nرابط الدعوة: ${publicUrl}\n\nرابط التعديل، احتفظوا بيه لنفسكم:\n${editUrl(invitation.editToken)}`;

  return (
    <>
      <AdminHeader
        title={`${invitation.name1 || '؟'} و ${invitation.name2 || '؟'}`}
        subtitle={packageName(invitation.package, 'AR')}
        back="/admin"
      />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-28">
        {/* Identity and amount: the two things checked against a transfer screenshot. */}
        <section className="flex items-center justify-between gap-3 rounded-2xl border border-adm-line bg-adm-panel px-3 py-3">
          <CopyValue value={invitation.requestId} label="رقم الطلب" className="text-lg font-bold" />
          <div className="flex shrink-0 items-center gap-2">
            <span className="numeric text-lg font-bold text-adm-accent">{price} ج</span>
            <StatusPill status={invitation.status} />
          </div>
        </section>

        {missing.length > 0 ? (
          <p className="flex items-start gap-2 rounded-2xl border border-adm-warn/40 bg-adm-warn/10 px-4 py-3 text-sm leading-relaxed text-adm-warn">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              الدعوة ناقصة: {missing.map((field) => FIELD_LABELS[field] ?? field).join('، ')}. لو
              فعّلتها كده الصفحة هتطلع ناقصة للضيوف.
            </span>
          </p>
        ) : null}

        {invitation.rejectReason ? (
          <p className="rounded-2xl border border-adm-danger/30 bg-adm-danger/8 px-4 py-3 text-sm text-adm-danger">
            سبب الرفض: {invitation.rejectReason}
          </p>
        ) : null}

        {isActive ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-adm-success/35 bg-adm-panel px-4 py-4">
            <h2 className="text-sm font-bold text-adm-success">الدعوة شغالة</h2>

            {invitation.customerPhone ? (
              <a
                href={customerWhatsappLink(invitation.customerPhone, deliveryMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="press tap-target flex items-center justify-center gap-2 rounded-xl bg-adm-accent px-5 py-4 text-base font-bold text-white"
              >
                <MessageCircle aria-hidden className="size-4.5" />
                ابعت الروابط للعميل
              </a>
            ) : (
              <p className="rounded-xl border border-adm-warn/30 bg-adm-warn/10 px-4 py-3 text-sm text-adm-warn">
                مفيش رقم موبايل متسجل، فمفيش حد نبعتله. انسخ الروابط من تحت واستنى العميل يكلمك.
              </p>
            )}

            <div className="flex flex-col divide-y divide-adm-line rounded-xl border border-adm-line">
              <LinkRow label="رابط الدعوة" value={publicUrl} href={publicUrl} />
              <LinkRow label="رابط التعديل" value={editUrl(invitation.editToken)} />
            </div>

            <form action={deactivateInvitation}>
              <input type="hidden" name="id" value={invitation.id} />
              <ConfirmSubmit confirmLabel="أكيد، اقفل الرابط" pendingLabel="بيتقفل">
                إيقاف الرابط
              </ConfirmSubmit>
            </form>
          </section>
        ) : (
          <>
            {/*
              The InstaPay reference goes in before activation, so a transfer can always
              be traced back to the invitation it paid for.
            */}
            <form
              action={activateInvitation}
              className="flex flex-col gap-3 rounded-2xl border border-adm-accent/35 bg-adm-panel px-4 py-4 shadow-[0_1px_3px_rgba(35,32,27,0.06)]"
            >
              <input type="hidden" name="id" value={invitation.id} />

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-adm-muted">
                  مرجع التحويل من إنستاباي، المبلغ <span className="numeric">{price}</span> جنيه
                </span>
                <input
                  name="paymentNote"
                  defaultValue={invitation.paymentNote ?? ''}
                  dir="ltr"
                  placeholder="reference"
                  className="w-full rounded-xl border border-adm-control bg-adm-panel px-4 py-3 text-adm-text outline-none placeholder:text-adm-muted focus:border-adm-accent focus:ring-2 focus:ring-adm-accent/25"
                />
              </label>

              <SubmitButton size="lg" pendingLabel="بيتفعّل">
                تفعيل الدعوة
              </SubmitButton>
            </form>

            <details className="rounded-2xl border border-adm-line bg-adm-panel px-4 py-3">
              <summary className="press cursor-pointer text-sm font-medium text-adm-danger">
                رفض الطلب
              </summary>

              <form action={rejectInvitation} className="mt-3 flex flex-col gap-3">
                <input type="hidden" name="id" value={invitation.id} />
                <RejectReasonField defaultValue={invitation.rejectReason ?? ''} />
                <ConfirmSubmit confirmLabel="أكيد، ارفض" pendingLabel="بيترفض">
                  رفض
                </ConfirmSubmit>
              </form>
            </details>
          </>
        )}

        {/* What the operator is about to make public, drawn with the real data. */}
        <div className="overflow-hidden rounded-2xl border border-adm-line">
          <MiniInvitation
            themeId={invitation.themeId}
            lang={invitation.invitationLang}
            name1={invitation.name1}
            name2={invitation.name2}
            eventDate={invitation.eventDate ?? new Date()}
            eventType={invitation.eventType}
          />
        </div>

        {invitation.customRequest ? (
          <section className="rounded-2xl border border-adm-accent/30 bg-adm-accent/5 px-4 py-3">
            <h2 className="text-xs font-bold text-adm-accent">طلب التصميم الخاص</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-adm-text">
              {invitation.customRequest}
            </p>
          </section>
        ) : null}

        <dl className="divide-y divide-adm-line overflow-hidden rounded-2xl border border-adm-line bg-adm-panel text-sm">
          <Row label="التاريخ">
            {invitation.eventDate ? formatEventDate(invitation.eventDate, 'AR') : '—'} ·{' '}
            {invitation.eventTime ? formatEventTime(invitation.eventTime, 'AR') : '—'}
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
                className="press font-mono text-adm-accent underline underline-offset-4"
              >
                <bdi>{invitation.customerPhone}</bdi>
              </a>
            ) : (
              '—'
            )}
          </Row>
          <Row label="اتعملت">{formatShortDateTime(invitation.createdAt, 'AR')}</Row>
          {invitation.activatedAt ? (
            <Row label="اتفعّلت">{formatShortDateTime(invitation.activatedAt, 'AR')}</Row>
          ) : null}
          {invitation.paymentNote ? (
            <Row label="مرجع التحويل">
              <span className="font-mono text-adm-muted">
                <bdi>{invitation.paymentNote}</bdi>
              </span>
            </Row>
          ) : null}
          <Row label="مشاهدات">
            <span className="numeric">{invitation.viewCount}</span>
          </Row>
        </dl>

        {/*
          The customer builder, reached through the customer's own edit link. There is
          deliberately no second editing interface: this hands the operator the same
          form, the same live preview and the same components the customer used.
        */}
        <a
          href={`/edit/${invitation.editToken}`}
          className="press tap-target flex items-center justify-center gap-2 rounded-xl border border-adm-control bg-adm-panel px-5 py-3.5 text-center text-sm font-semibold"
        >
          <PencilLine aria-hidden className="size-4" />
          عدّل الدعوة في نفس الفورم
        </a>

        <details className="rounded-2xl border border-adm-line bg-adm-panel px-4 py-3">
          <summary className="press cursor-pointer text-sm text-adm-muted">إعدادات متقدمة</summary>

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
                  className="min-w-0 flex-1 rounded-xl border border-adm-control bg-adm-panel px-3 py-2.5 font-mono text-sm text-adm-text outline-none focus:border-adm-accent"
                />
                <SubmitButton variant="secondary" size="sm" className="shrink-0" pendingLabel="...">
                  حفظ
                </SubmitButton>
              </div>
            </form>

            <form action={extendExpiry} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={invitation.id} />
              <label className="text-xs text-adm-muted">
                مد الصلاحية
                {invitation.expiresAt
                  ? `، بتنتهي ${formatShortDateTime(invitation.expiresAt, 'AR')}`
                  : '، مفيش تاريخ انتهاء'}
              </label>
              <div className="flex gap-2">
                <input
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={30}
                  dir="ltr"
                  className="w-24 rounded-xl border border-adm-control bg-adm-panel px-3 py-2.5 text-sm text-adm-text outline-none focus:border-adm-accent"
                />
                <SubmitButton variant="secondary" size="sm" className="flex-1" pendingLabel="...">
                  مد بالأيام دي
                </SubmitButton>
              </div>
            </form>
          </div>
        </details>
      </main>
    </>
  );
}

function LinkRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <span className="w-20 shrink-0 text-xs text-adm-muted">{label}</span>
      <CopyValue value={value} label={label} className="min-w-0 flex-1 text-xs" />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`افتح ${label}`}
          className="press tap-target flex shrink-0 items-center justify-center px-1 text-adm-muted"
        >
          <ExternalLink aria-hidden className="size-4" />
        </a>
      ) : null}
    </div>
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
