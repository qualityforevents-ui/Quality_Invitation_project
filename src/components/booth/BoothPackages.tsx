import { Check } from 'lucide-react';
import { BOOTH_ADD_ONS, BOOTH_PACKAGES } from '@/lib/photobooth/config';
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
        {BOOTH_PACKAGES.map((tier) => {
          const features = lang === 'AR' ? tier.featuresAr : tier.featuresEn;

          return (
            <article key={tier.id} className="rounded-xl border-2 border-gold bg-gold-wash p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold">{lang === 'AR' ? tier.nameAr : tier.nameEn}</h3>
                <p className="text-end">
                  {/*
                    The standard rate, struck through, above the offer. Only rendered
                    when one is configured, because a reference price that was never
                    charged is a misleading price.
                  */}
                  {tier.listPrice ? (
                    <span className="block text-xs text-ink-faint line-through">
                      <span className="numeric">{tier.listPrice}</span> {t.home.currency}
                    </span>
                  ) : null}
                  {/* `numeric` wraps bare digits only. The currency word beside it would
                      be pushed to the wrong side by the LTR isolation it applies. */}
                  <span className="numeric text-2xl font-bold">{tier.price}</span>{' '}
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

      {/*
        The add ons, described here and chosen in the booking form further down. Two
        places that both let you pick would be two places that can disagree about what
        the customer wanted.
      */}
      <div className="mt-8">
        <h3 className="text-base font-bold">{t.photobooth.addOnsTitle}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t.photobooth.addOnsSub}</p>

        <ul className="mt-4 flex flex-col gap-3">
          {BOOTH_ADD_ONS.map((addOn) => (
            <li
              key={addOn.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white/60 px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {lang === 'AR' ? addOn.nameAr : addOn.nameEn}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft text-pretty">
                  {lang === 'AR' ? addOn.noteAr : addOn.noteEn}
                </span>
              </span>

              <span className="shrink-0 whitespace-nowrap text-sm font-bold text-gold-deep">
                <span className="numeric">+{addOn.price}</span>{' '}
                <span className="text-xs font-medium text-ink-soft">{t.home.currency}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
