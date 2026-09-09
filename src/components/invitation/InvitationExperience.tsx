'use client';

import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ConfettiBurst } from './ConfettiBurst';
import { MuteToggle } from './MuteToggle';
import { getInvitationCopy } from '@/i18n/invitation';
import { getThemeComponents } from '@/themes/components';
import { getTheme } from '@/themes/registry';
import { useInvitationAudio } from '@/lib/useInvitationAudio';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * Owns the one piece of state the whole card turns on: whether it has been opened.
 *
 * The tap that opens it is also the gesture that lets the browser play audio, so
 * starting the music and revealing the card are the same event. The audio call comes
 * first and is synchronous, because Safari only counts it as user initiated while the
 * handler is still on the stack.
 */
export function InvitationExperience({
  view,
  contained = false,
}: {
  view: InvitationView;
  contained?: boolean;
}) {
  const [opened, setOpened] = useState(false);

  /*
   * Whether the cover has actually left, which is not the same as whether the card has
   * been opened.
   *
   * `mode="wait"` keeps the cover mounted through its exit, and in this set that exit is
   * the reveal itself — a bud opening, a screen dissolving, a curtain parting. Tying the
   * panel's height to `opened` pulled that height away on the tap, half a second before
   * the cover was done with it: everything the cover was animating collapsed back to the
   * top of the panel and performed its exit from there. The height belongs to the cover
   * for exactly as long as the cover is on screen.
   *
   * Safe as the only gate, because the two events are the same event: with `mode="wait"`
   * the card is not rendered until the exit completes, which is when this fires.
   */
  const [coverGone, setCoverGone] = useState(false);

  const audio = useInvitationAudio(view.musicUrl);
  const copy = getInvitationCopy(view.lang, { verseId: view.verseId, quote: view.quote });
  const { Cover, Card } = getThemeComponents(view.themeId);
  const theme = getTheme(view.themeId);

  // Prevent background scrolling while the cover is closed
  useEffect(() => {
    if (!opened && !contained) {
      const originalOverflow = document.body.style.overflow;
      const originalOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.overscrollBehavior = originalOverscroll;
      };
    }
  }, [opened, contained]);

  function open() {
    // Must stay first and synchronous: this call is what Safari accepts as the user
    // gesture that unlocks audio, and anything before it forfeits that.
    audio.start();
    setOpened(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        /*
         * The closed cover is exactly one panel tall, and the panel says how tall that
         * is.
         *
         * Every cover asks for `h-full`, and a percentage height needs an ancestor with
         * a real one to resolve against. The shell above carries a floor — `min-h` — so
         * the opened card can be as long as it likes, which left every cover quietly
         * falling back to its own content height: in the builder's popup the card sat at
         * the top with a band of theme coloured nothing under it, `justify-between`
         * collapsed and the open button pinned under the date instead of at the bottom
         * edge.
         *
         * `--inv-panel-height` is the fix and the whole of it. The popup sets it to its
         * own height; on a guest's phone nothing sets it and the fallback is the screen.
         * Either way this box is definite, so `h-full` inside every cover resolves.
         *
         * Held until the cover has left rather than until it is asked to leave — see
         * `coverGone` above. Afterwards this is a plain block and the card is as long as
         * it is.
         */
        className={
          !coverGone
            ? 'h-[var(--inv-panel-height,100dvh)] max-h-[var(--inv-panel-height,100dvh)] w-full overflow-hidden flex flex-col'
            : ''
        }
      >
        <AnimatePresence mode="wait" onExitComplete={() => setCoverGone(true)}>
          {opened ? (
            <Card key="card" view={view} copy={copy} />
          ) : (
            <Cover key="cover" view={view} copy={copy} onOpen={open} />
          )}
        </AnimatePresence>
      </div>

      {/*
        Mounted the instant the tap lands rather than when the card finishes entering,
        so the paper erupts over the cover as it dissolves and the reveal arrives
        through it. The burst runs once, in the theme's own colours, and the component
        goes quiet on its own when the last piece falls.
      */}
      {opened ? <ConfettiBurst recipe={theme.confetti} /> : null}

      {opened && audio.available ? (
        <MuteToggle
          muted={audio.muted}
          onToggle={audio.toggleMute}
          labelMute={copy.labels.muteAudio}
          labelUnmute={copy.labels.unmuteAudio}
        />
      ) : null}
    </MotionConfig>
  );
}
