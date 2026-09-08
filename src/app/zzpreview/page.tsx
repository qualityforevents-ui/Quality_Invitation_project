'use client';

import { useMemo, useState } from 'react';
import { THEMES } from '@/themes/registry';
import { NO_VERSE_ID, VERSES } from '@/lib/verses';
import type { EventType, Lang } from '@/lib/types';

/**
 * All thirteen designs on one screen, live.
 *
 * Every tile is a real iframe of the real route a guest gets, not a screenshot and not a
 * miniature drawn for the picker, because the point of this page is to catch the things
 * only the running card shows: a cover that fits on one screen everywhere except here, a
 * countdown whose numerals fall out of their cells in English, an ornament that lands on
 * the names once the Arabic display face has swapped in. Comparing designs is also the
 * only way to see the set as a set — nine themes that each claim a structural device
 * of their own are either visibly nine different objects at this size, or they are not,
 * and that judgement cannot be made one tab at a time.
 *
 * Not linked from anywhere and marked noindex by the frame it loads, in the same spirit
 * as /zzcards and /zzdiag beside it.
 */

/** The one-line claim each design is meant to be judged against. From docs/theme-set-v2.md. */
const PITCHES: Record<string, { axis: string; line: string }> = {
  mashrabiya: {
    axis: 'aperture',
    line: 'A turned-wood screen you cannot read through, opening into windows.',
  },
  iwan: {
    axis: 'frame-as-measure',
    line: 'One great Cairene arch whose legs narrow around you as you scroll.',
  },
  qandeel: {
    axis: 'suspension',
    line: 'Everything hangs from the top of the page on its own thread, at its own depth.',
  },
  khayamiya: {
    axis: 'field stack',
    line: "The tentmaker's appliqué: saturated cloths, sewn seams, no page margin.",
  },
  ghouroub: {
    axis: 'horizon',
    line: 'A sunset. One moving line, content flipping above and below it.',
  },
  netiga: {
    axis: 'dated leaves',
    line: "The wall calendar, showing today's real date — then torn to the one that matters.",
  },
  zarf: {
    axis: 'fold grid',
    line: 'A sealed letter that unfolds, still creased along its folds.',
  },
  hadiqa: {
    axis: 'ornament gutter',
    line: 'One jasmine vine climbs the whole card and every section grows off it.',
  },
  rizma: {
    axis: 'discrete objects',
    line: 'Five insert cards at five different measures, dealt out one at a time.',
  },
  classic: { axis: 'retired', line: 'Bordered panel on cream paper.' },
  modern: { axis: 'retired', line: 'Centred column of hairlines.' },
  floral: { axis: 'retired', line: 'Rounded panel with corner sprigs.' },
  midnight: { axis: 'retired', line: 'Centred column on a dark ground.' },
};

/** The phone the tiles are rendered as, before scaling. iPhone 12/13/14 logical size. */
const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 844;

const SIZES = [
  { id: 'small', label: 'Small', width: 220 },
  { id: 'medium', label: 'Medium', width: 300 },
  { id: 'full', label: 'Full size', width: FRAME_WIDTH },
] as const;

type SizeId = (typeof SIZES)[number]['id'];

const EVENTS: { id: EventType; label: string }[] = [
  { id: 'ENGAGEMENT', label: 'Engagement' },
  { id: 'WEDDING', label: 'Wedding' },
  { id: 'KATB_KETAB', label: 'Katb ketab' },
];

/** Shortest to longest, plus none — the axis a verse block actually has to survive. */
const VERSE_OPTIONS = [
  ...VERSES.map((verse) => ({ id: verse.id, label: verse.labelEn })),
  { id: NO_VERSE_ID, label: 'None' },
];

const SWATCH_KEYS = [
  '--inv-bg',
  '--inv-panel',
  '--inv-ink',
  '--inv-muted',
  '--inv-accent',
  '--inv-accent-soft',
] as const;

export default function ThemePreviewPage() {
  const [lang, setLang] = useState<Lang>('AR');
  const [mode, setMode] = useState<'card' | 'cover'>('card');
  const [event, setEvent] = useState<EventType>('ENGAGEMENT');
  const [size, setSize] = useState<SizeId>('medium');
  const [verse, setVerse] = useState<string>(VERSE_OPTIONS[0].id);
  const [showRetired, setShowRetired] = useState(false);
  const [sound, setSound] = useState(false);
  /**
   * Bumped by Reload all. Changing it changes every iframe's key, which remounts them —
   * the only reliable way to restart a card from the top, since an iframe you merely
   * navigate to the same URL keeps its scroll position and its opened state.
   */
  const [generation, setGeneration] = useState(0);

  const themes = useMemo(
    () => THEMES.filter((theme) => theme.listed || showRetired),
    [showRetired],
  );

  const tileWidth = SIZES.find((candidate) => candidate.id === size)!.width;
  const scale = tileWidth / FRAME_WIDTH;

  function frameSrc(themeId: string) {
    const params = new URLSearchParams({ theme: themeId, lang, mode, event, verse });
    if (sound) params.set('sound', '1');
    return `/zzpreview/frame?${params.toString()}`;
  }

  return (
    // The review chrome is written in English and reads left to right; the root layout
    // is Arabic, so the direction has to be set here or the toolbar comes out mirrored.
    <div dir="ltr" className="min-h-dvh bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-300 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <div className="me-auto">
            <h1 className="text-sm font-semibold">Design review</h1>
            <p className="text-xs text-neutral-500">
              {themes.length} designs · the same routes a guest gets
            </p>
          </div>

          <Control label="Language">
            <Segmented
              options={[
                { id: 'AR', label: 'العربية' },
                { id: 'EN', label: 'English' },
              ]}
              value={lang}
              onChange={(next) => setLang(next as Lang)}
            />
          </Control>

          <Control label="Shows">
            <Segmented
              options={[
                { id: 'card', label: 'Card' },
                { id: 'cover', label: 'Cover' },
              ]}
              value={mode}
              onChange={(next) => setMode(next as 'card' | 'cover')}
            />
          </Control>

          <Control label="Occasion">
            <Segmented
              options={EVENTS.map((entry) => ({ id: entry.id, label: entry.label }))}
              value={event}
              onChange={(next) => setEvent(next as EventType)}
            />
          </Control>

          <Control label="Verse">
            <Segmented options={VERSE_OPTIONS} value={verse} onChange={setVerse} />
          </Control>

          <Control label="Size">
            <Segmented
              options={SIZES.map((entry) => ({ id: entry.id, label: entry.label }))}
              value={size}
              onChange={(next) => setSize(next as SizeId)}
            />
          </Control>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={showRetired}
              onChange={(e) => setShowRetired(e.target.checked)}
            />
            Retired four
          </label>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            Music
          </label>

          <button
            type="button"
            onClick={() => setGeneration((value) => value + 1)}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
          >
            Reload all
          </button>
        </div>

        {mode === 'cover' ? (
          <p className="border-t border-neutral-200 bg-amber-50 px-5 py-1.5 text-center text-[11px] text-amber-900">
            Covers only. Tapping one opens its card inside the tile — the animation needs a
            visible frame, so a tile scrolled off screen will sit on its cover until you
            come back to it.
          </p>
        ) : null}
      </header>

      <main
        className="mx-auto grid max-w-[1600px] gap-6 px-5 py-6"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${tileWidth}px, 1fr))` }}
      >
        {themes.map((theme) => (
          <section key={theme.id} className="flex flex-col gap-2">
            <header className="flex items-baseline gap-2">
              <h2 className="flex items-baseline gap-2 text-sm font-semibold">
                <span>{theme.nameEn}</span>
                <span className="font-normal text-neutral-500" dir="rtl">
                  {theme.nameAr}
                </span>
              </h2>
              <span className="ms-auto text-[10px] uppercase tracking-wide text-neutral-400">
                {theme.listed ? PITCHES[theme.id]?.axis : 'retired'}
              </span>
            </header>

            <p className="min-h-8 text-[11px] leading-snug text-neutral-500">
              {PITCHES[theme.id]?.line}
            </p>

            <div className="flex gap-1">
              {SWATCH_KEYS.map((key) => (
                <span
                  key={key}
                  title={`${key} ${theme.vars[key]}`}
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ background: theme.vars[key] }}
                />
              ))}
              <span className="ms-auto font-mono text-[10px] text-neutral-400">{theme.id}</span>
            </div>

            {/*
              The frame is always rendered at a real phone's 390x844 and then scaled down,
              rather than being given the tile's width directly. A card laid out at 220px
              is a card at a viewport no phone has, and every media query, clamp and
              intrinsic size in it would answer a question nobody asked.
            */}
            <div
              className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm"
              style={{ width: tileWidth, height: FRAME_HEIGHT * scale }}
            >
              <iframe
                key={`${theme.id}-${lang}-${mode}-${event}-${verse}-${sound}-${generation}`}
                src={frameSrc(theme.id)}
                title={`${theme.nameEn} — ${mode}`}
                width={FRAME_WIDTH}
                height={FRAME_HEIGHT}
                loading="lazy"
                className="origin-top-left border-0"
                style={{ transform: `scale(${scale})` }}
              />
            </div>

            <div className="flex gap-3 text-[11px]">
              <a
                className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                href={frameSrc(theme.id)}
                target="_blank"
                rel="noreferrer"
              >
                Open ↗
              </a>
              <a
                className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                href={`/sample?theme=${theme.id}`}
                target="_blank"
                rel="noreferrer"
              >
                As a guest ↗
              </a>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-neutral-400">{label}</span>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-neutral-300">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`px-3 py-1 text-xs ${
            value === option.id
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
