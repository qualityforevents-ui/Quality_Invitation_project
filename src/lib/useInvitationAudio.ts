'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Loud enough to be present, quiet enough not to startle someone in a quiet room. */
const TARGET_VOLUME = 0.4;
const FADE_MS = 2000;
const FADE_TICK_MS = 50;

export type InvitationAudio = {
  /** False once the file has failed to load, which hides the toggle. */
  available: boolean;
  muted: boolean;
  started: boolean;
  /** Must be called synchronously inside the tap handler. */
  start: () => void;
  toggleMute: () => void;
};

/**
 * Music for the invitation.
 *
 * Two constraints shape all of this. Browsers refuse to play audio that no user asked
 * for, so nothing happens until the open button is tapped, and the play call has to
 * happen inside that tap handler rather than after any await, or Safari treats it as
 * having come from nowhere and blocks it.
 *
 * The file is also not fetched until the tap. Loading a megabyte of audio on page load
 * for a guest who may never open the card is a megabyte of somebody's mobile data.
 */
export function useInvitationAudio(src: string | null): InvitationAudio {
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  const [available, setAvailable] = useState(Boolean(src));
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const clearFade = useCallback(() => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(
    (element: HTMLAudioElement) => {
      clearFade();

      const step = TARGET_VOLUME / (FADE_MS / FADE_TICK_MS);

      fadeRef.current = window.setInterval(() => {
        const next = element.volume + step;
        if (next >= TARGET_VOLUME) {
          element.volume = TARGET_VOLUME;
          clearFade();
          return;
        }
        element.volume = next;
      }, FADE_TICK_MS);
    },
    [clearFade],
  );

  const start = useCallback(() => {
    if (!src || elementRef.current) return;

    const element = new Audio();
    element.src = src;
    element.loop = true;
    element.volume = 0;
    element.preload = 'auto';

    // A missing or unplayable file is not an error worth showing anyone. The card
    // simply opens in silence and the toggle takes itself away.
    element.addEventListener('error', () => {
      setAvailable(false);
      setStarted(false);
    });

    elementRef.current = element;

    const playback = element.play();

    if (playback && typeof playback.then === 'function') {
      playback
        .then(() => {
          setStarted(true);
          fadeIn(element);
        })
        .catch(() => {
          setAvailable(false);
        });
      return;
    }

    setStarted(true);
    fadeIn(element);
  }, [src, fadeIn]);

  const toggleMute = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const next = !element.muted;
    element.muted = next;
    setMuted(next);
  }, []);

  useEffect(() => {
    return () => {
      clearFade();
      const element = elementRef.current;
      if (element) {
        element.pause();
        element.src = '';
        elementRef.current = null;
      }
    };
  }, [clearFade]);

  return { available, muted, started, start, toggleMute };
}
