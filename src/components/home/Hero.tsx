'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EASE_OUT, STAGGER_STEP } from '@/lib/motion';
import type { Dictionary } from '@/i18n/ui';

/**
 * The first thing on the page: what this business does, and the two ways in.
 *
 * The booth button leads. It is the newer service, the more expensive one, and the one
 * a visitor cannot discover any other way, whereas the invitation builder is already
 * linked from the header, the footer, every sample page and every invitation a guest
 * has ever been sent.
 *
 * The only moving thing above the fold. Three elements rising in sequence at fifty
 * milliseconds apart, which is inside the range where a stagger is felt rather than
 * watched. Under prefers-reduced-motion the whole thing renders in its final state
 * rather than fading, because a fade is still something arriving on a page somebody
 * asked to hold still.
 */
export function Hero({ t }: { t: Dictionary }) {
  const reduced = useReducedMotion();

  const rise = (index: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * STAGGER_STEP, ease: EASE_OUT },
        };

  return (
    <section className="pt-10">
      <motion.h1 {...rise(0)} className="text-3xl leading-tight font-bold text-balance">
        {t.home.tagline}
      </motion.h1>

      <motion.p {...rise(1)} className="mt-3 text-base leading-relaxed text-ink-soft text-pretty">
        {t.home.subline}
      </motion.p>

      <motion.div {...rise(2)} className="mt-6 flex flex-col gap-3">
        <Button asChild size="lg" className="w-full rounded-full text-base">
          <Link href="/photobooth">{t.home.ctaBooth}</Link>
        </Button>

        <Button asChild size="lg" variant="outline" className="w-full rounded-full text-base">
          <Link href="/invitations">{t.home.ctaInvitations}</Link>
        </Button>
      </motion.div>
    </section>
  );
}
