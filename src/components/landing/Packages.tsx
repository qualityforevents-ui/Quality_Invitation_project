import Link from 'next/link';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { PACKAGES } from '@/lib/packages';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';

/**
 * The three tiers.
 *
 * Each card starts the builder with that package already chosen, carried through as a
 * query parameter and stored on the invitation from the first keystroke. Choosing here
 * rather than at the end means nobody builds a whole invitation before discovering what
 * it costs.
 *
 * The middle tier is marked as most chosen because it is the one worth steering people
 * towards: it is the cheapest upgrade that removes the thing customers are unhappy about
 * later, which is a link that stops working.
 */
export function Packages({ lang, t }: { lang: Lang; t: Dictionary }) {
  const isArabic = lang === 'AR';

  return (
    <section id="packages" className="border-t border-line pt-10">
      <h2 className="text-xl font-bold">{t.landing.packagesTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.landing.packagesSub}</p>

      <div className="mt-6 flex flex-col gap-4">
        {PACKAGES.map((tier) => {
          const highlighted = tier.id === 'UNLIMITED';

          return (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-2xl border-2 bg-white px-5 py-5',
                highlighted ? 'border-gold shadow-[0_10px_30px_-18px_rgba(138,106,50,0.8)]' : 'border-line',
              )}
            >
              {highlighted ? (
                <span className="absolute -top-3 end-4 rounded-full bg-gold px-3 py-1 text-[0.6875rem] font-semibold text-white">
                  {t.landing.packagesPopular}
                </span>
              ) : null}

              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-ink">{isArabic ? tier.nameAr : tier.nameEn}</h3>
                <p className="shrink-0">
                  <span className="numeric text-2xl font-bold text-gold-deep">{tier.price}</span>
                  <span className="ms-1 text-xs font-medium text-gold-deep">{t.common.egp}</span>
                </p>
              </div>

              <p className="mt-1 text-sm text-ink-soft">{isArabic ? tier.taglineAr : tier.taglineEn}</p>

              <ul className="mt-4 flex flex-col gap-2">
                {(isArabic ? tier.featuresAr : tier.featuresEn).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                    <svg
                      viewBox="0 0 16 16"
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/build?package=${tier.id}`}
                className={buttonClass(highlighted ? 'primary' : 'secondary', 'mt-5 w-full')}
              >
                {t.landing.packagesCta}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
