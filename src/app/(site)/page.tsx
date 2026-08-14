import Link from 'next/link';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SupportButton } from '@/components/SupportButton';
import { Flow } from '@/components/landing/Flow';
import { Packages } from '@/components/landing/Packages';
import { Reviews } from '@/components/landing/Reviews';
import { buttonClass } from '@/components/ui/Button';
import { getDictionary } from '@/i18n/ui';
import { getApprovedReviews } from '@/lib/reviews';
import { PACKAGES } from '@/lib/packages';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const reviews = await getApprovedReviews();

  // The headline price is the cheapest way in, so the number people see first is the
  // smallest true one rather than an average nobody pays.
  const lowestPrice = Math.min(...PACKAGES.map((p) => p.price));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-16">
      <header className="flex items-center justify-between py-5">
        <span className="text-sm font-semibold tracking-wide text-gold-deep">qlty.events</span>
        <LanguageToggle lang={lang} label={t.common.switchTo} />
      </header>

      <section className="pt-6 pb-10">
        <Ornament />

        <h1 className="mt-6 text-[2rem] leading-[1.25] font-bold text-balance">{t.landing.title}</h1>

        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
          {t.landing.subtitle}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="#packages" className={buttonClass('primary', 'w-full text-lg')}>
            {t.landing.cta}
          </Link>
          <Link href="/sample" className={buttonClass('secondary', 'w-full')}>
            {t.landing.sample}
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-gold-wash px-4 py-4 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-sm text-ink-soft">{t.landing.priceLabel}</span>
            <span className="text-sm text-ink-soft">{lang === 'AR' ? 'يبدأ من' : 'from'}</span>
            <span className="numeric text-2xl font-bold text-gold-deep">{lowestPrice}</span>
            <span className="text-sm font-medium text-gold-deep">{t.common.egp}</span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">{t.landing.priceNote}</p>
        </div>
      </section>

      <Packages lang={lang} t={t} />

      <div className="mt-10">
        <Flow lang={lang} t={t} />
      </div>

      <div className="mt-10">
        <Reviews reviews={reviews} lang={lang} t={t} />
      </div>

      <SupportButton message={t.landing.supportMessage} label={t.landing.support} />
    </main>
  );
}

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-gold" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-l from-gold/60 to-transparent" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 2.5 16.4 9.8 23.9 12.2 16.4 14.6 14 21.9 11.6 14.6 4.1 12.2 11.6 9.8Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="24.5" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
    </div>
  );
}
