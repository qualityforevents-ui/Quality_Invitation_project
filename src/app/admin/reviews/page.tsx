import { revalidatePath } from 'next/cache';
import { AdminHeader, EmptyState } from '@/components/admin/AdminChrome';
import { SubmitButton } from '@/components/admin/ActionButton';
import { assertOperator, requireOperator } from '@/lib/admin-auth';
import { getAllReviews } from '@/lib/reviews';
import { reviews } from '@/lib/db';
import { formatShortDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

/**
 * Nothing a customer writes appears on the landing page until it is approved here.
 *
 * Rejected reviews are hidden rather than deleted. If somebody complains that their
 * review never appeared, the operator wants to be able to see what they actually wrote.
 */
async function setStatus(formData: FormData): Promise<void> {
  'use server';
  await assertOperator();

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');

  if (status !== 'APPROVED' && status !== 'HIDDEN' && status !== 'PENDING') return;

  await reviews().doc(id).update({ status });

  // The landing page renders approved reviews, so it has to be rebuilt.
  revalidatePath('/');
  revalidatePath('/admin/reviews');
}

const LABELS: Record<string, string> = {
  PENDING: 'مستنية مراجعة',
  APPROVED: 'منشورة',
  HIDDEN: 'مخفية',
};

const STYLES: Record<string, string> = {
  PENDING: 'bg-adm-warn/12 text-adm-warn',
  APPROVED: 'bg-adm-success/12 text-adm-success',
  HIDDEN: 'bg-adm-raised text-adm-muted',
};

export default async function AdminReviewsPage() {
  await requireOperator();

  const all = await getAllReviews();
  const pending = all.filter((r) => r.status === 'PENDING');
  const rest = all.filter((r) => r.status !== 'PENDING');

  return (
    <>
      <AdminHeader title="الآراء" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-28">
        <p className="text-xs leading-relaxed text-adm-muted">
          {pending.length > 0
            ? `${pending.length} رأي مستني مراجعة. مفيش حاجة بتظهر على الموقع قبل ما توافق عليها.`
            : 'مفيش آراء مستنية.'}
        </p>

        {all.length === 0 ? <EmptyState>لسه محدش كتب رأي.</EmptyState> : null}

        {/*
          Unreviewed first. This list only grows, and a review waiting on a decision was
          previously somewhere in the middle of everything already decided.
        */}
        {[...pending, ...rest].map((review) => (
          <article
            key={review.id}
            className={cn(
              'flex flex-col gap-3 rounded-2xl border bg-adm-panel px-4 py-3.5',
              review.status === 'PENDING' ? 'border-adm-warn/35' : 'border-adm-line',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {review.name}
                  {review.city ? <span className="font-normal text-adm-muted"> · {review.city}</span> : null}
                </p>
                <p className="mt-0.5 text-xs text-adm-muted">
                  {formatShortDateTime(review.createdAt, 'AR')}
                  {review.invitationId ? ' · من عميل فعلي' : ' · من غير طلب مرتبط'}
                </p>
              </div>

              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold whitespace-nowrap',
                  STYLES[review.status],
                )}
              >
                {LABELS[review.status]}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-adm-text">{review.body}</p>

            <div className="flex gap-2">
              {review.status !== 'APPROVED' ? (
                <form action={setStatus} className="flex-1">
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <SubmitButton size="sm" className="w-full" pendingLabel="بينشر">
                    انشر
                  </SubmitButton>
                </form>
              ) : null}

              {review.status !== 'HIDDEN' ? (
                <form action={setStatus} className="flex-1">
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="status" value="HIDDEN" />
                  <SubmitButton variant="secondary" size="sm" className="w-full" pendingLabel="...">
                    اخفي
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </main>
    </>
  );
}
