/**
 * Three steps, for one service.
 *
 * The compact sibling of the builder's HowItWorks, which draws five steps down a spine
 * and earns the room because it is answering "when exactly do I pay" for somebody
 * already part way into buying. The home is answering a smaller question, twice, so it
 * gets numbered rows and no spine.
 */
export function HowItWorksCompact({
  title,
  steps,
}: {
  title: string;
  steps: readonly { readonly title: string; readonly body: string }[];
}) {
  return (
    <section>
      <h2 className="text-base font-bold">{title}</h2>

      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="numeric mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-xs font-bold text-gold-deep">
              {index + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft text-pretty">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
