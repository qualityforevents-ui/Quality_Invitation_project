'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatEventDate } from '@/lib/format';
import { EASE_OUT as EASE } from '@/lib/motion';
import {
  JoinBullion,
  NAP_SHEEN,
  PLEAT,
  TasselCord,
  pleatImage,
} from './MakhmalOrnaments';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * مخمل, closed.
 *
 * The viewport is one continuous piece of pleated velvet in two halves meeting at a
 * centre join, and opening it parts the curtain. That is the whole cover: there is no
 * card, no frame and no panel here any more than there is on the card itself, because
 * the theme's claim is that the surface is never interrupted.
 *
 * The parting is the single most theatrical opening in the set, and it is also the one
 * place the theme has to be careful. AnimatePresence runs in `mode="wait"`, so the card
 * does not mount until this component has finished leaving; if the halves slid apart
 * over flat background the reveal would be a hole rather than a reveal. So the fabric is
 * painted twice: once on the root, which is what the parting uncovers, and again on each
 * half at a heavier shade. The curtain opens onto lit velvet, and the card that follows
 * lands on the same material.
 */
export function MakhmalCover({
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
      className="relative flex min-h-dvh flex-col overflow-hidden bg-inv-bg"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.5, ease: EASE }}
    >
      {/* The lit fabric behind the curtain. Both pitches, so the material is identical
          to the card's the instant the halves clear it. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: pleatImage(PLEAT.base) }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `${NAP_SHEEN}, ${pleatImage(PLEAT.nap, 0.55)}` }}
        aria-hidden="true"
      />
      {/* The light the curtain is hiding. It is only visible once the halves move. */}
      <div
        className="pointer-events-none absolute inset-0 text-inv-accent-soft/25"
        style={{
          backgroundImage:
            'radial-gradient(80% 46% at 50% 44%, currentColor 0%, rgba(0,0,0,0) 70%)',
        }}
        aria-hidden="true"
      />

      <CurtainHalf side="left" />
      <CurtainHalf side="right" />

      {/*
        The tassel hangs from the rail, not from the curtain, so it stays put while the
        halves travel and only goes when the whole cover fades. Centred physically: the
        closed curtain is symmetric and must be identical in Arabic and English.
      */}
      <TasselCord className="pointer-events-none absolute top-0 left-1/2 w-40 -translate-x-1/2 text-inv-accent-soft/55 rtl:-scale-x-100" />

      <motion.div
        className="relative flex flex-1 flex-col justify-between px-7 pt-44 pb-10 text-center"
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <motion.div
          className="@container relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {/*
            The monogram, as a worn patch in the nap rather than a drawn mark. Velvet
            that has been handled loses its pile and goes slightly lighter, and that is
            all this is: a soft oval of accent-soft with a breath of white where the nap
            is crushed. Deliberately not initials — a seal in a ring is the device every
            other theme in the set already uses, and drawing one here would hand this
            cover the same centre as theirs.
          */}
          <span
            className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-72 -translate-x-1/2 -translate-y-1/2 text-inv-accent-soft/8"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, currentColor 0%, rgba(0,0,0,0) 68%), radial-gradient(circle at 50% 44%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 62%)',
            }}
            aria-hidden="true"
          />

          <p className="relative font-inv-body text-[0.6875rem] text-inv-accent uppercase [word-spacing:0.3em]">
            {copy.eventName[view.eventType]}
          </p>

          {/*
            Zain has no light weight and the display face is only ever set heavy, so the
            names carry the page on mass alone. Sized against the column rather than in
            rem: 64px is the design size, but "Abdelrahman" is one unbreakable word and
            at 64px it is wider than a 390px phone, so the cap comes down to 13% of the
            measure and only reaches its full size on a screen that can hold it.
          */}
          <h1 className="relative mt-7 font-inv-display font-bold text-inv-ink">
            <span className="block text-[length:min(2.75rem,13cqw)] leading-[1.16] text-balance">
              {view.name1}
            </span>
            <span className="my-2 block font-inv-body text-xl text-inv-accent" aria-hidden="true">
              {copy.nameSeparator}
            </span>
            <span className="block text-[length:min(2.75rem,13cqw)] leading-[1.16] text-balance">
              {view.name2}
            </span>
          </h1>

          <p className="relative mt-8 font-inv-body text-[0.9375rem] leading-[1.9] text-inv-muted text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          {/*
            No left to right isolation. The line mixes a month name with digits and the
            bidi algorithm already orders that correctly; forcing a direction is what
            puts an Arabic date the wrong way round.
          */}
          <p className="relative mt-4 font-inv-body text-sm text-inv-accent">
            {formatEventDate(view.eventDate, view.lang)}
          </p>
        </motion.div>

        {/*
          Structural, not decorative: this tap is the user gesture the browser needs
          before it will start the music, so it is the only thing on the cover to press.
          A solid gold bar rather than an outlined pill, because an outline on pleated
          velvet disappears into the fold shadows at the first crest it crosses.

          No pulse. A repeating box-shadow repaints the whole bar every frame for as long
          as the cover is on screen, and this page has a mid-range Android to get through.
        */}
        <motion.button
          type="button"
          onClick={onOpen}
          className="tap-target press relative mt-12 block w-full bg-inv-accent px-6 py-4 font-inv-body text-base font-medium text-inv-bg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        >
          {copy.openButton}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/**
 * One half of the curtain.
 *
 * Two elements rather than one on purpose. The inner one carries the exit transform, and
 * the outer one carries the reduced-motion rest state as a plain CSS class: with
 * MotionConfig's reducedMotion="user" framer drops transforms out of animations
 * altogether, so a reduced-motion guest would otherwise watch the curtain refuse to
 * open. Under `motion-reduce` the halves are simply already parted and the cover
 * cross-fades to the card, which is the finished state rather than a broken one.
 *
 * scale(1.04) about the *outer* edge is what makes the pleats look like they are folding
 * in on themselves as they go, instead of sliding like a flat board.
 */
function CurtainHalf({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 w-1/2',
        isLeft ? 'left-0 motion-reduce:-translate-x-[52%]' : 'right-0 motion-reduce:translate-x-[52%]',
      )}
      aria-hidden="true"
    >
      <motion.div
        className={cn('absolute inset-0 bg-inv-bg', isLeft ? 'origin-left' : 'origin-right')}
        style={{
          // The half is a heavier drape than the fabric behind it: gathered dark at the
          // rail edge and darker still at the join, so parting it reads as light
          // arriving rather than as two rectangles moving. The angle flips per side so
          // the pair is a mirror — 90deg on both would put the deep gather at the rail
          // on one half and at the join on the other.
          backgroundImage: `linear-gradient(${isLeft ? '90deg' : '270deg'}, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 46%, rgba(0,0,0,0.38) 100%), ${pleatImage(PLEAT.base)}`,
        }}
        exit={{ x: isLeft ? '-52%' : '52%', scale: 1.04 }}
        transition={{ duration: 0.62, delay: 0.14, ease: EASE }}
      >
        <JoinBullion edge={isLeft ? 'right' : 'left'} />
      </motion.div>
    </div>
  );
}
