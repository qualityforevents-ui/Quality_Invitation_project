import { Check } from 'lucide-react';
import { BOOTH_PACKAGES } from '@/lib/photobooth/config';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * The three tiers, as cards.
 *
 * A server component with no selection state. Choosing a package happens in the booking
 * form further down the page, where it has to be a form field anyway, and duplicating
 * that choice up here would give the page two places that disagree about what the
 * customer picked. These cards describe; the form decides.
 *
 * The middle tier is marked. It is the one most people want and saying so is useful
 * rather than manipulative: it is also the one the copy is written around.
 */
export function BoothPackages({ lang, t }: { lang: Lang; t: Dictionary }) {
  return (
    <section id="packages">
      <h2 className="text-xl font-bold">{t.photobooth.packagesTitle}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft text-pretty">
        {t.photobooth.packagesSub}
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {BOOTH_PACKAGES.map((tier, index) => {
          const features = lang === 'AR' ? tier.featuresAr : tier.featuresEn;
          const popular = index === 1;

          return (
            <article
              key={tier.id}
              className={
                popular
                  ? 'rounded-xl border-2 border-gold bg-gold-wash p-5'
                  : 'rounded-xl border border-line bg-white/60 p-5'
              }
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold">{lang === 'AR' ? tier.nameAr : tier.nameEn}</h3>
                <p>
                  {/* `numeric` wraps bare digits only. The currency word beside it would
                      be pushed to the wrong side by the LTR isolation it applies. */}
                  <span className="numeric text-xl font-bold">{tier.price}</span>{' '}
                  <span className="text-xs text-ink-soft">{t.home.currency}</span>
                </p>
              </div>

              <p className="mt-1 text-sm text-ink-soft">
                {lang === 'AR' ? tier.taglineAr : tier.taglineEn}
              </p>

              <p className="numeric mt-2 text-xs text-ink-faint">
                {tier.hours} {t.photobooth.hoursLabel}
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
                    <span className="text-pretty">{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
                {t.photobooth.extraHourLabel}:{' '}
                <span className="numeric">{tier.extraHourPrice}</span> {t.home.currency}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
