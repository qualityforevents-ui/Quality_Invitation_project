import { ReviewForm } from './ReviewForm';
import { formatShortDateTime } from '@/lib/format';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';
import type { Review } from '@/lib/types';

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
    <section className="border-t border-border pt-10">
      <h2 className="text-xl font-bold">{t.landing.reviewsTitle}</h2>

      {reviews.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
          {t.landing.reviewsEmpty}
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {reviews.map((review) => (
            <figure key={review.id} className="rounded-2xl border border-border bg-card px-4 py-4">
              <blockquote className="text-sm leading-relaxed text-foreground text-pretty">
                {review.body}
              </blockquote>

              <figcaption className="mt-3 flex items-baseline gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-muted-foreground">{review.name}</span>
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
