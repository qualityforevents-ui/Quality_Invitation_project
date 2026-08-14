'use client';

import { motion } from 'framer-motion';
import { Monogram } from '@/components/invitation/Monogram';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Dark elegant, closed.
 *
 * The animation is a light sweep: the card starts almost black and a soft gold glow
 * rises behind the names, which is the one moment of drama the theme allows itself.
 */
export function MidnightCover({
  view,
  copy,
  onOpen,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}) {
  return (
    <motion.div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-inv-bg px-10 py-16 text-center"
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* Gold light behind the names, rising as the card settles. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 55% at 50% 42%, rgba(212,177,105,0.20) 0%, rgba(212,177,105,0) 62%)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-5 border border-inv-line" aria-hidden="true" />

      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <Monogram name1={view.name1} name2={view.name2} size="lg" />

        <p className="mt-7 font-inv-body text-[0.6875rem] tracking-[0.4em] text-inv-accent">
          {copy.eventName[view.eventType]}
        </p>

        <motion.span
          className="my-7 block h-px bg-inv-accent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 130, opacity: 0.6 }}
          transition={{ duration: 1.3, delay: 0.4, ease: EASE }}
          aria-hidden="true"
        />

        <h1 className="font-inv-display text-inv-ink">
          <span className="block text-[2.375rem] leading-[1.45] text-balance">{view.name1}</span>
          <span className="my-1 block text-lg text-inv-accent" aria-hidden="true">
            &amp;
          </span>
          <span className="block text-[2.375rem] leading-[1.45] text-balance">{view.name2}</span>
        </h1>

        <p className="mt-7 font-inv-body text-[0.9375rem] leading-relaxed text-inv-muted text-pretty">
          {copy.inviteLine[view.eventType]}
        </p>

        <p className="mt-4 font-inv-body text-sm tracking-[0.2em] text-inv-accent">
          {formatEventDate(view.eventDate, view.lang)}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpen}
        className="tap-target relative mt-12 rounded-full border border-inv-accent/70 px-9 py-4 font-inv-body text-base tracking-wide text-inv-accent transition active:scale-95"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: [
            '0 0 0 0 rgba(212,177,105,0)',
            '0 0 22px 2px rgba(212,177,105,0.22)',
            '0 0 0 0 rgba(212,177,105,0)',
          ],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.8, ease: EASE },
          y: { duration: 0.8, delay: 0.8, ease: EASE },
          boxShadow: { duration: 3.2, repeat: Infinity, delay: 1.8, ease: 'easeInOut' },
        }}
      >
        {copy.openButton}
      </motion.button>
    </motion.div>
  );
}
