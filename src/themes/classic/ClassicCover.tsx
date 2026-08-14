'use client';

import { motion } from 'framer-motion';
import { Divider, OrnateFrame, PaperTexture, Pip } from '@/components/invitation/Ornaments';
import { Monogram } from '@/components/invitation/Monogram';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The closed state.
 *
 * A monogram seal leads, then the occasion, then the names. Opening on a mark rather
 * than on text gives the card something of its own to be recognised by, and it earns
 * the space now that the couple's initials are doing the work an ampersand used to.
 *
 * The open button is structural rather than decorative: it is the user gesture that
 * lets the browser start the music. That is why it is the only thing to press here,
 * and why it is given a slow pulse rather than left to sit quietly in a corner.
 *
 * The names stack rather than sitting on one line. A pair of short Arabic names would
 * fit either way, but this field accepts any script, and "Abdelrahman" beside
 * "Yasmine" at this size does not fit a 390 pixel screen.
 */
export function ClassicCover({
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
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-inv-bg px-9 py-16 text-center"
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <PaperTexture />
      <OrnateFrame />

      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <Monogram name1={view.name1} name2={view.name2} size="lg" />

        <p className="mt-6 font-inv-body text-[0.6875rem] tracking-[0.32em] text-inv-muted">
          {copy.eventName[view.eventType]}
        </p>

        <Divider className="my-7 w-full" />

        <h1 className="font-inv-display text-inv-ink">
          <span className="block text-[2.5rem] leading-[1.45] text-balance">{view.name1}</span>
          <span className="my-1.5 flex justify-center" aria-hidden="true">
            <Pip className="scale-125" />
          </span>
          <span className="block text-[2.5rem] leading-[1.45] text-balance">{view.name2}</span>
        </h1>

        <Divider className="my-7 w-full" />

        <p className="font-inv-body text-[0.9375rem] leading-relaxed text-inv-muted text-pretty">
          {copy.inviteLine[view.eventType]}
        </p>

        {/*
          No left to right isolation here. The string mixes a month name with digits,
          and the bidi algorithm already orders that correctly in both languages.
          Forcing a direction onto the whole line is what puts an Arabic date in the
          wrong order.
        */}
        <p className="mt-4 font-inv-body text-sm tracking-[0.18em] text-inv-accent">
          {formatEventDate(view.eventDate, view.lang)}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpen}
        className="tap-target relative mt-12 rounded-full border border-inv-accent/60 bg-inv-panel/40 px-9 py-4 font-inv-body text-base tracking-wide text-inv-ink backdrop-blur-[2px] transition active:scale-95"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: [
            '0 0 0 0 rgba(177,139,71,0)',
            '0 0 0 10px rgba(177,139,71,0.09)',
            '0 0 0 0 rgba(177,139,71,0)',
          ],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.5, ease: EASE },
          y: { duration: 0.8, delay: 0.5, ease: EASE },
          boxShadow: { duration: 2.8, repeat: Infinity, delay: 1.4, ease: 'easeInOut' },
        }}
      >
        {copy.openButton}
      </motion.button>
    </motion.div>
  );
}
