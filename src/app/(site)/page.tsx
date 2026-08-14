import Link from 'next/link';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SupportButton } from '@/components/SupportButton';
import { buttonClass } from '@/components/ui/Button';
import { getDictionary } from '@/i18n/ui';
import { PRICE_EGP } from '@/lib/constants';
import { getUiLang } from '@/lib/session';

export default async function LandingPage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const steps = [
    { title: t.landing.step1Title, body: t.landing.step1Body },
    { title: t.landing.step2Title, body: t.landing.step2Body },
    { title: t.landing.step3Title, body: t.landing.step3Body },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-12">
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
          <Link href="/build" className={buttonClass('primary', 'w-full text-lg')}>
            {t.landing.cta}
          </Link>
          <Link href="/sample" className={buttonClass('secondary', 'w-full')}>
            {t.landing.sample}
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-gold-wash px-4 py-4 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-sm text-ink-soft">{t.landing.priceLabel}</span>
            <span className="numeric text-2xl font-bold text-gold-deep">{PRICE_EGP}</span>
            <span className="text-sm font-medium text-gold-deep">{t.common.egp}</span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">{t.landing.priceNote}</p>
        </div>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="text-lg font-bold">{t.landing.howTitle}</h2>

        <ol className="mt-5 flex flex-col gap-5">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="numeric mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-wash text-sm font-bold text-gold-deep">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/*
        Floats over the page rather than sitting in a footer, so somebody who is stuck
        does not have to reach the bottom to find it. It still does not compete with the
        button that starts the product: different corner, different colour, no words.
      */}
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
