'use client';

import { motion } from 'framer-motion';
import { formatEventDate } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';
import { EASE_OUT as EASE } from '@/lib/motion';

/**
 * Modern minimal, closed.
 *
 * No frame, no texture, no ornament. The animation is the only decoration: the names
 * arrive with their letter spacing open and settle closed, which reads as typography
 * composing itself rather than as an effect applied to it.
 */
export function ModernCover({
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
      className="relative flex h-full max-h-full w-full flex-col items-center justify-between overflow-hidden bg-inv-bg px-8 pt-4 sm:pt-8 text-center"
      style={{ paddingBottom: 'calc(1.5rem + var(--inv-toggle-offset, 0px))' }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="relative my-auto flex flex-col items-center">
        <motion.p
          className="font-inv-body text-[0.625rem] tracking-[0.45em] text-inv-muted uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {copy.eventName[view.eventType]}
        </motion.p>

        {/* Scaled rather than widened, so the reveal never touches layout. */}
        <motion.span
          className="my-5 sm:my-8 mx-auto block h-px w-[72px] origin-center bg-inv-line"
          initial={{ transform: 'scaleX(0)' }}
          animate={{ transform: 'scaleX(1)' }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
          aria-hidden="true"
        />

        <motion.h1
          className="flex flex-col items-center gap-2 sm:gap-3 font-inv-display font-light text-inv-ink"
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '0.02em' }}
          transition={{ duration: 1.4, delay: 0.25, ease: EASE }}
        >
          <span className="block text-3xl sm:text-[2.25rem] leading-tight text-balance">{view.name1}</span>
          <span className="block text-3xl sm:text-[2.25rem] leading-tight text-balance">{view.name2}</span>
        </motion.h1>

        <motion.div
          className="mt-6 sm:mt-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
        >
          <p className="font-inv-body text-xs sm:text-sm leading-relaxed text-inv-muted text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>
          <p className="font-inv-body text-xs sm:text-sm tracking-[0.22em] text-inv-ink">
            {formatEventDate(view.eventDate, view.lang)}
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onOpen}
        className="tap-target mt-4 sm:mt-6 border-b border-inv-ink pb-1 font-inv-body text-xs sm:text-sm tracking-[0.25em] text-inv-ink uppercase transition active:opacity-60"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
      >
        {copy.openButton}
      </motion.button>
    </motion.div>
  );
}
