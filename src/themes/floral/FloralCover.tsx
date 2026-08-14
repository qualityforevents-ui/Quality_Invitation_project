'use client';

import { motion } from 'framer-motion';
import { FloralDivider, Sprig } from './FloralOrnaments';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Floral soft, closed.
 *
 * The sprigs grow in from the corners as the card appears, which is this theme's
 * open animation: soft and unhurried, nothing snapping into place.
 */
export function FloralCover({
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
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <motion.div
        className="pointer-events-none absolute top-4 left-4 text-inv-accent"
        initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.3, ease: EASE }}
        aria-hidden="true"
      >
        <Sprig />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-4 bottom-4 rotate-180 text-inv-accent-soft"
        initial={{ opacity: 0, scale: 0.7, rotate: 168 }}
        animate={{ opacity: 1, scale: 1, rotate: 180 }}
        transition={{ duration: 1.3, delay: 0.15, ease: EASE }}
        aria-hidden="true"
      >
        <Sprig />
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
      >
        <p className="font-inv-body text-[0.6875rem] tracking-[0.3em] text-inv-muted">
          {copy.eventName[view.eventType]}
        </p>

        <FloralDivider className="my-7" />

        <h1 className="font-inv-display text-inv-ink">
          <span className="block text-[2.5rem] leading-[1.4] text-balance">{view.name1}</span>
          <span className="my-1 block text-xl text-inv-accent" aria-hidden="true">
            {copy.nameSeparator}
          </span>
          <span className="block text-[2.5rem] leading-[1.4] text-balance">{view.name2}</span>
        </h1>

        <FloralDivider className="my-7" />

        <p className="font-inv-body text-[0.9375rem] leading-relaxed text-inv-muted text-pretty">
          {copy.inviteLine[view.eventType]}
        </p>

        <p className="mt-4 font-inv-body text-sm tracking-[0.18em] text-inv-accent">
          {formatEventDate(view.eventDate, view.lang)}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpen}
        className="tap-target mt-12 rounded-full bg-inv-accent px-9 py-4 font-inv-body text-base text-white shadow-[0_10px_26px_-14px_rgba(0,0,0,0.5)] transition active:scale-95"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, scale: [1, 1.03, 1] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6, ease: EASE },
          y: { duration: 0.8, delay: 0.6, ease: EASE },
          scale: { duration: 3, repeat: Infinity, delay: 1.6, ease: 'easeInOut' },
        }}
      >
        {copy.openButton}
      </motion.button>
    </motion.div>
  );
}
