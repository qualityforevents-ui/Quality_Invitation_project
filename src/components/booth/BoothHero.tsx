'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SiteImage } from '@/components/media/SiteImage';
import { PriceTag } from '@/components/home/PriceTag';
import { metaTrack } from '@/lib/meta/pixel';
import { EASE_OUT, STAGGER_STEP } from '@/lib/motion';
import { BOOTH_MEDIA, boothStartingPrice } from '@/lib/photobooth/config';
import type { Dictionary } from '@/i18n/ui';

/**
 * The top of the booth page: one photograph, one promise, one price, one button.
 *
 * The button scrolls rather than navigating. The calendar is the thing this visitor
 * came for and it is already on this page; sending them to a second URL to see it would
 * cost a round trip and lose the package they may have arrived on.
 *
 * Smooth scrolling is left to CSS, which the stylesheet already turns off under
 * prefers-reduced-motion. Doing it here with a behaviour flag would override that.
 */
export function BoothHero({ t }: { t: Dictionary }) {
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
    <section className="pt-6">
      <div className="relative overflow-hidden rounded-2xl">
        {/*
          4:5 rather than 4:3. Every photograph the business has is a portrait phone
          shot of a booth standing on its end, and a landscape frame crops the top off
          the only subject in the picture.
        */}
        <SiteImage
          path={BOOTH_MEDIA.hero}
          alt={t.photobooth.heroTitle}
          width={760}
          height={950}
          priority
          className="aspect-[4/5] object-cover"
        />
      </div>

      <motion.h1 {...rise(0)} className="mt-6 text-3xl leading-tight font-bold text-balance">
        {t.photobooth.heroTitle}
      </motion.h1>

      <motion.p {...rise(1)} className="mt-3 text-base leading-relaxed text-ink-soft text-pretty">
        {t.photobooth.heroSubline}
      </motion.p>

      <motion.div {...rise(2)} className="mt-5 flex flex-wrap items-center gap-4">
        <PriceTag price={boothStartingPrice()} t={t} />
      </motion.div>

      <motion.div {...rise(3)} className="mt-6">
        <Button
          asChild
          size="lg"
          className="w-full rounded-full text-base"
          onClick={() => {
            metaTrack('ServiceSelected', {
              content_category: 'photobooth',
              content_name: 'check_availability',
            });
          }}
        >
          <a href="#booking">{t.photobooth.heroCta}</a>
        </Button>
      </motion.div>
    </section>
  );
}
