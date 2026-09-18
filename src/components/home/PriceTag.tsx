'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';
import type { Dictionary } from '@/i18n/ui';

/**
 * The signature motif: an oversized gold price tag, hung slightly off square.
 *
 * Used once on the whole site, on the booth card's starting price, and that restraint is
 * the design rather than a limitation of it. A page where one element is tilted has a
 * focal point; a page where four are has a theme, and the theme is the wrong kind of
 * loud for a business asking to be trusted with a wedding.
 *
 * The tilt is on the tag and not on its text: rotating a block of Arabic drags its
 * diacritics through the rotation and they stop sitting where the reader expects. So the
 * card turns and the words inside turn back.
 *
 * Three spans rather than one interpolated string, because `numeric` forces LTR to stop
 * the bidi algorithm reordering digits inside Arabic, and it may only ever wrap bare
 * digits. Wrapping "3500 جنيه" in it would push the currency word to the wrong side.
 */
export function PriceTag({ price, t }: { price: number; t: Dictionary }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      // Settles into its angle rather than arriving at it. The whole animation is one
      // element moving four degrees, which is the entire motion budget of this page.
      initial={reduced ? false : { rotate: 0, scale: 0.94, opacity: 0 }}
      whileInView={reduced ? undefined : { rotate: -4, scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      style={reduced ? { rotate: -4 } : undefined}
      className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-white shadow-[0_8px_24px_-10px_rgba(138,106,50,0.7)]"
    >
      {/* The punched hole and its string, which is what makes it read as a tag at all. */}
      <span
        className="size-2 shrink-0 rounded-full bg-gold-deep/60 ring-2 ring-white/40"
        aria-hidden="true"
      />

      <span className="text-sm font-medium opacity-90">{t.home.fromLabel}</span>
      <span className="numeric text-xl font-bold">{price}</span>
      <span className="text-sm font-medium opacity-90">{t.home.currency}</span>
    </motion.div>
  );
}
