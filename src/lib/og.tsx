import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { formatEventDate } from './format';
import { getInvitationCopy } from '@/i18n/invitation';
import { getTheme } from '@/themes/registry';
import type { EventType, Lang } from '@/lib/types';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const FONT_DIR = path.join(process.cwd(), 'src', 'assets', 'fonts');

type LoadedFont = { name: string; data: Buffer; weight: 400 | 700; style: 'normal' };

let fontsPromise: Promise<LoadedFont[]> | null = null;

/**
 * Tajawal, and not the theme's own face.
 *
 * The card is drawn by satori, whose font parser is limited in two ways that between
 * them rule out every Arabic serif worth using here. It rejects contextual substitution
 * lookups, which is how Amiri and Scheherazade New do their Naskh joining, with
 * "lookupType: 5 - substFormat: 3 is not yet supported". And it cannot read variable
 * fonts at all, which rules out Markazi Text, Noto Naskh Arabic, Reem Kufi and El
 * Messiri. All six were tried. Only static sans faces survive.
 *
 * Tajawal is the pick because it works, because it is already the typeface of the
 * builder so the preview looks like it belongs to the same product, and because at
 * 118KB for both weights it is a seventh of what Amiri would have cost a serverless
 * bundle. The invitation itself still uses its theme's proper serif; only this preview
 * image differs.
 *
 * Read from disk rather than fetched from an import.meta.url. That pattern appears in
 * most Next examples but Turbopack does not implement fetch for file URLs and fails at
 * runtime with "not implemented". The files are listed in outputFileTracingIncludes in
 * next.config.ts so the build keeps them.
 */
function loadFonts(): Promise<LoadedFont[]> {
  // Cached at module scope, on a route built to render once and be cached from then on.
  fontsPromise ??= Promise.all([
    readFile(path.join(FONT_DIR, 'Tajawal-Regular.ttf')),
    readFile(path.join(FONT_DIR, 'Tajawal-Bold.ttf')),
  ]).then(([regular, bold]): LoadedFont[] => [
    { name: 'Tajawal', data: regular, weight: 400, style: 'normal' },
    { name: 'Tajawal', data: bold, weight: 700, style: 'normal' },
  ]);

  return fontsPromise;
}

const HAS_ARABIC = /[؀-ۿ]/;

/**
 * Puts Arabic word order back the right way round for satori.
 *
 * Satori lays multi word Arabic out in reverse: given "قاعة النيل الكبرى" it draws
 * "الكبرى النيل قاعة". Setting direction on the container makes no difference, it
 * produces the identical wrong result either way. Reversing the words on the way in
 * cancels it out exactly, which was checked against the browser's own rendering of the
 * same string until the two were indistinguishable.
 *
 * This only holds for a line that is one phrase. A line mixing an Arabic phrase, a
 * separator and a number has several bidi runs, and satori reorders those
 * independently, so no single reversal fixes it. That is why the date, the venue and
 * the occasion each get their own line on the card rather than being joined with a
 * separator. Do not combine them.
 *
 * If a future satori fixes its RTL handling, this will start producing reversed text
 * and should be deleted rather than adjusted.
 */
function satoriText(text: string, lang: Lang): string {
  if (lang !== 'AR' || !HAS_ARABIC.test(text)) return text;
  return text.split(' ').reverse().join(' ');
}

export type OgInput = {
  name1: string;
  name2: string;
  eventType: EventType;
  eventDate: Date;
  venueName: string;
  lang: Lang;
  themeId: string;
};

/**
 * The WhatsApp preview.
 *
 * Every guest sees this before they decide whether to tap, which makes it the most
 * looked at thing the product renders. It carries the names, the occasion, the date and
 * the venue, on the theme's own background, and nothing else.
 */
export async function renderOgImage(input: OgInput): Promise<ImageResponse> {
  const theme = getTheme(input.themeId);
  const copy = getInvitationCopy(input.lang);
  const isArabic = input.lang === 'AR';

  const bg = theme.vars['--inv-bg'] ?? '#faf5ec';
  const ink = theme.vars['--inv-ink'] ?? '#33302a';
  const muted = theme.vars['--inv-muted'] ?? '#7a6f5c';
  const accent = theme.vars['--inv-accent'] ?? '#b18b47';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          color: ink,
          fontFamily: 'Tajawal',
          textAlign: 'center',
          padding: 64,
          direction: isArabic ? 'rtl' : 'ltr',
        }}
      >
        {/* Border, drawn as a positioned box because satori has no outline support. */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: `2px solid ${accent}`,
            opacity: 0.35,
            borderRadius: 6,
          }}
        />

        <div
          style={{
            fontSize: 26,
            letterSpacing: isArabic ? 0 : 6,
            color: muted,
            marginBottom: 18,
          }}
        >
          {satoriText(copy.eventName[input.eventType], input.lang)}
        </div>

        {/*
          The diamond is a rotated box, not the ◆ character. Satori draws only what is
          in the font it was handed, and Tajawal has no U+25C6, so the glyph came out
          as an empty tofu square.
        */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
          <div style={{ width: 90, height: 1, backgroundColor: accent, opacity: 0.5 }} />
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: accent,
              transform: 'rotate(45deg)',
              margin: '0 20px',
            }}
          />
          <div style={{ width: 90, height: 1, backgroundColor: accent, opacity: 0.5 }} />
        </div>

        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.25 }}>
          {satoriText(input.name1, input.lang)}
        </div>
        <div style={{ fontSize: 44, color: accent, lineHeight: 1.2 }}>{copy.nameSeparator}</div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.25 }}>
          {satoriText(input.name2, input.lang)}
        </div>

        {/*
          Date and venue on separate lines, never joined with a separator. Each is one
          phrase, which is the only shape satoriText can put back in order. See the note
          on that function.
        */}
        <div style={{ marginTop: 34, fontSize: 32, color: ink }}>
          {satoriText(formatEventDate(input.eventDate, input.lang), input.lang)}
        </div>

        <div style={{ marginTop: 10, fontSize: 27, color: muted, maxWidth: 900 }}>
          {satoriText(input.venueName, input.lang)}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
