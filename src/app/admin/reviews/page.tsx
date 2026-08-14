import { revalidatePath } from 'next/cache';
import { AdminHeader } from '@/components/admin/AdminChrome';
import { assertOperator, requireOperator } from '@/lib/admin-auth';
import { getAllReviews } from '@/lib/reviews';
import { prisma } from '@/lib/db';
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

  await prisma.review.update({ where: { id }, data: { status } });

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
  PENDING: 'bg-adm-warn/15 text-adm-warn',
  APPROVED: 'bg-adm-accent/15 text-adm-accent',
  HIDDEN: 'bg-adm-line text-adm-muted',
};

export default async function AdminReviewsPage() {
  await requireOperator();

  const reviews = await getAllReviews();
  const pending = reviews.filter((r) => r.status === 'PENDING').length;

  return (
    <>
      <AdminHeader title="الآراء" back="/admin" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-16">
        <p className="text-xs text-adm-muted">
          {pending > 0
            ? `${pending} رأي مستني مراجعة. مفيش حاجة بتظهر على الموقع قبل ما توافق عليها.`
            : 'مفيش آراء مستنية.'}
        </p>

        {reviews.length === 0 ? (
          <p className="rounded-xl border border-adm-line bg-adm-panel px-4 py-6 text-center text-sm text-adm-muted">
            لسه محدش كتب رأي
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col gap-3 rounded-xl border border-adm-line bg-adm-panel px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {review.name}
                    {review.city ? <span className="text-adm-muted"> · {review.city}</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-adm-muted">
                    {formatShortDateTime(review.createdAt, 'AR')}
                    {review.invitationId ? ' · من عميل فعلي' : ' · من غير طلب مرتبط'}
                  </p>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium whitespace-nowrap',
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
                    <button
                      type="submit"
                      className="tap-target w-full rounded-lg bg-adm-accent px-3 py-2 text-xs font-semibold text-adm-bg"
                    >
                      انشر
                    </button>
                  </form>
                ) : null}

                {review.status !== 'HIDDEN' ? (
                  <form action={setStatus} className="flex-1">
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="status" value="HIDDEN" />
                    <button
                      type="submit"
                      className="tap-target w-full rounded-lg border border-adm-line px-3 py-2 text-xs text-adm-muted"
                    >
                      اخفي
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}
