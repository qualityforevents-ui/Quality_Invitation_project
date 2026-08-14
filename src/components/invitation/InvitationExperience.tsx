'use client';

import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useState } from 'react';
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
export function InvitationExperience({ view }: { view: InvitationView }) {
  const [opened, setOpened] = useState(false);

  const audio = useInvitationAudio(view.musicUrl);
  const copy = getInvitationCopy(view.lang);
  const { Cover, Card } = getThemeComponents(view.themeId);
  const theme = getTheme(view.themeId);

  function open() {
    // Must stay first and synchronous: this call is what Safari accepts as the user
    // gesture that unlocks audio, and anything before it forfeits that.
    audio.start();
    setOpened(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {opened ? (
          <Card key="card" view={view} copy={copy} />
        ) : (
          <Cover key="cover" view={view} copy={copy} onOpen={open} />
        )}
      </AnimatePresence>

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
