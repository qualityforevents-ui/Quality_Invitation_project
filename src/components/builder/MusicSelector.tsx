'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { MUSIC_TRACKS, trackMood, trackName, trackUrl } from '@/lib/music';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Tracks are named, never listed by filename, and each one can be auditioned before
 * it is chosen.
 *
 * The audio files are not in the repo. Any track whose file is missing reports itself
 * as unavailable the first time it is auditioned and then says so, rather than
 * appearing to be broken. Selecting one still works, so the choice a customer makes
 * today is honoured the moment the file lands.
 */
export function MusicSelector({
  selectedId,
  lang,
  t,
  onSelect,
}: {
  selectedId: string;
  /** The builder language, since these names are part of the interface. */
  lang: Lang;
  t: Dictionary;
  onSelect: (trackId: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function audition(trackId: string, url: string) {
    const current = audioRef.current;

    if (playingId === trackId && current) {
      current.pause();
      setPlayingId(null);
      return;
    }

    current?.pause();

    const element = new Audio(url);
    element.volume = 0.5;
    element.addEventListener('ended', () => setPlayingId(null));
    element.addEventListener('error', () => {
      setUnavailable((previous) => new Set(previous).add(trackId));
      setPlayingId(null);
    });

    audioRef.current = element;
    setPlayingId(trackId);

    element.play().catch(() => {
      setUnavailable((previous) => new Set(previous).add(trackId));
      setPlayingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {MUSIC_TRACKS.map((track) => {
        const selected = track.id === selectedId;
        const isPlaying = playingId === track.id;
        const isMissing = unavailable.has(track.id);

        return (
          <div
            key={track.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition',
              selected ? 'border-gold bg-gold-wash' : 'border-line',
            )}
          >
            <button
              type="button"
              onClick={() => audition(track.id, trackUrl(track))}
              aria-label={`${isPlaying ? t.theme.pause : t.theme.play}: ${trackName(track, lang)}`}
              className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-gold-deep transition active:scale-95"
            >
              {isPlaying ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
                  <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.3-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2Z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelect(track.id)}
              className="press tap-target flex flex-1 flex-col justify-center text-start"
              aria-pressed={selected}
            >
              <span className="block text-sm font-medium text-ink">{trackName(track, lang)}</span>
              <span className="block text-xs text-ink-faint">
                {isMissing ? t.theme.musicMissing : trackMood(track, lang)}
              </span>
            </button>

            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                selected ? 'border-gold bg-gold' : 'border-line',
              )}
              aria-hidden="true"
            >
              {selected ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                  <path
                    d="M2.5 6.2L4.8 8.5L9.5 3.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
