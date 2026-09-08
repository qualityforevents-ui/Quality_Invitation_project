'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { MUSIC_TRACKS, trackMood, trackName, trackUrl } from '@/lib/music';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

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
    <div role="radiogroup" aria-label={t.theme.music} className="flex flex-col gap-2">
      {MUSIC_TRACKS.map((track) => {
        const selected = track.id === selectedId;
        const isPlaying = playingId === track.id;
        const isMissing = unavailable.has(track.id);

        return (
          <div
            key={track.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2 transition',
              selected ? 'border-primary bg-secondary' : 'border-border bg-card',
            )}
          >
            {/*
              The play control sits outside the selection control on purpose. Merged,
              listening to a track would silently change the answer, and somebody
              comparing all eight would end up with whichever they happened to hear last.
            */}
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() => audition(track.id, trackUrl(track))}
              aria-label={`${isPlaying ? t.theme.pause : t.theme.play}: ${trackName(track, lang)}`}
              className="shrink-0 rounded-full bg-card text-secondary-foreground"
            >
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>

            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(track.id)}
              className="press tap-target flex flex-1 flex-col justify-center text-start"
            >
              <span className="block text-sm font-medium">{trackName(track, lang)}</span>
              <span className="block text-xs text-muted-foreground">
                {isMissing ? t.theme.musicMissing : trackMood(track, lang)}
              </span>
            </button>

            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border',
                selected ? 'border-primary bg-primary' : 'border-border',
              )}
              aria-hidden="true"
            >
              {selected ? <Check className="size-3 text-primary-foreground" /> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
