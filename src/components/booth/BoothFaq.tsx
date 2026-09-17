import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Dictionary } from '@/i18n/ui';

/**
 * The six questions that otherwise arrive on WhatsApp.
 *
 * Space, power, setup time, prints, the digital gallery and cancellation. Every one of
 * them is a question somebody has to answer by hand, at night, on a phone, and every
 * one answered here is an hour the operator gets back and a customer who did not have
 * to ask a stranger before deciding to spend money.
 */
export function BoothFaq({ t }: { t: Dictionary }) {
  return (
    <section>
      <h2 className="text-xl font-bold">{t.photobooth.faqTitle}</h2>

      <Accordion type="single" collapsible className="mt-3">
        {t.photobooth.faq.map((entry) => (
          <AccordionItem key={entry.q} value={entry.q}>
            <AccordionTrigger className="text-start text-sm font-semibold">
              {entry.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-ink-soft text-pretty">
              {entry.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
