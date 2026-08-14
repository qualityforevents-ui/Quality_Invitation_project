import { ReviewForm } from './ReviewForm';
import { formatShortDateTime } from '@/lib/format';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';
import type { Review } from '@/generated/prisma/client';

/**
 * What customers have actually said.
 *
 * There is deliberately no seed data and no example content. Until real people have
 * written real reviews the section shows an honest empty state and invites the first
 * one. Invented testimonials with invented names are indistinguishable from real ones to
 * somebody reading them, and this page is asking couples to trust a business they have
 * never heard of with their wedding.
 *
 * It fills itself: customers write, the operator approves, the words appear here.
 */
export function Reviews({
  reviews,
  lang,
  t,
}: {
  reviews: Review[];
  lang: Lang;
  t: Dictionary;
}) {
  return (
    <section className="border-t border-line pt-10">
      <h2 className="text-xl font-bold">{t.landing.reviewsTitle}</h2>

      {reviews.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-white/60 px-4 py-6 text-center text-sm leading-relaxed text-ink-faint">
          {t.landing.reviewsEmpty}
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {reviews.map((review) => (
            <figure key={review.id} className="rounded-2xl border border-line bg-white px-4 py-4">
              <blockquote className="text-sm leading-relaxed text-ink text-pretty">
                {review.body}
              </blockquote>

              <figcaption className="mt-3 flex items-baseline gap-2 text-xs text-ink-faint">
                <span className="font-medium text-ink-soft">{review.name}</span>
                {review.city ? <span>· {review.city}</span> : null}
                <span className="ms-auto">{formatShortDateTime(review.createdAt, lang)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <ReviewForm lang={lang} t={t} />
    </section>
  );
}
