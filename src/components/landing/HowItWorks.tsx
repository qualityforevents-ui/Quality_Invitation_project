import type { Dictionary } from '@/i18n/ui';

/**
 * The whole journey, spelled out.
 *
 * People buying an invitation online in this market have usually not done it before, and
 * the two questions they arrive with are "do I have to make an account" and "when
 * exactly do I pay". Both are answered here rather than left to be discovered.
 *
 * Drawn as a vertical line with numbered nodes so it reads as a sequence on a narrow
 * screen without needing a diagram. The copy lives in src/i18n/ui.ts rather than in this
 * file, which is how it stopped describing the four screen builder that no longer
 * exists: inline strings escape the type that keeps the two dictionaries honest.
 */
export function HowItWorks({ t }: { t: Dictionary }) {
  return (
    <section className="border-t pt-7">
      <h2 className="text-xl font-bold">{t.landing.flowTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t.landing.flowSub}</p>

      <ol className="relative mt-7 flex flex-col gap-7">
        {/* The spine. Sits behind the nodes and stops short at both ends. */}
        <span className="absolute inset-y-3 start-[0.9375rem] w-px bg-border" aria-hidden="true" />

        {t.landing.howSteps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4">
            <span className="numeric relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary bg-secondary text-sm font-bold text-secondary-foreground">
              {index + 1}
            </span>

            <div className="pt-0.5">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
