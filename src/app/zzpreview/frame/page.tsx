import type { Metadata } from 'next';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import { getInvitationCopy } from '@/i18n/invitation';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { invitationFontVariables } from '@/lib/fonts';
import { buildSampleView } from '@/lib/sample';
import { getThemeComponents } from '@/themes/components';
import { DEFAULT_THEME, getTheme, isValidThemeId, themeStyle } from '@/themes/registry';
import { DEFAULT_VERSE_ID, isValidVerseId } from '@/lib/verses';
import type { EventType, Lang } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'معاينة تصميم',
  robots: { index: false, follow: false },
};

const EVENT_TYPES: EventType[] = ['ENGAGEMENT', 'WEDDING', 'KATB_KETAB'];

/**
 * One design, on its own, in whatever state you want to look at it in.
 *
 * This is what the tiles of /zzpreview load, one per iframe, and it is also what opens
 * when you click through to a design full size — the same route in both places, so the
 * thing you compared in the grid and the thing you then study on its own cannot be two
 * different renderings.
 *
 * `mode=cover` mounts the real experience, cover first, and behaves exactly as a guest's
 * link does. `mode=card` skips straight to the revealed card for the reason /zzcards
 * exists: the handoff from cover to card waits on an exit animation, and an exit
 * animation waits on frames, so a card behind a cover in a backgrounded tab or a
 * headless browser is unreachable. Reviewing thirteen designs at once means twelve of
 * those tabs are effectively backgrounded, which would make a grid of covers a grid of
 * things you cannot see past.
 *
 * Sound is off unless asked for. Thirteen cards on one screen, each with a track ready to
 * start on the tap that opens it, is not a review tool.
 */
export default async function PreviewFramePage({
  searchParams,
}: {
  searchParams: Promise<{
    theme?: string;
    lang?: string;
    mode?: string;
    event?: string;
    sound?: string;
    verse?: string;
  }>;
}) {
  const { theme, lang, mode, event, sound, verse } = await searchParams;

  const themeId = theme && isValidThemeId(theme) ? theme : DEFAULT_THEME.id;
  const invitationLang: Lang = lang === 'EN' ? 'EN' : 'AR';
  const eventType = EVENT_TYPES.find((candidate) => candidate === event) ?? 'ENGAGEMENT';

  // The four verses differ in length by a factor of three, and `none` removes the
  // block outright, so which one is on the card is a real question about a design's
  // verse block and not a detail of the specimen.
  const verseId = verse && isValidVerseId(verse) ? verse : DEFAULT_VERSE_ID;

  const sample = buildSampleView(invitationLang, themeId, verseId);
  const view = {
    ...sample,
    eventType,
    // An empty src is what the audio hook reads as "no track", which also hides the
    // mute toggle rather than leaving a dead control on the card.
    musicUrl: sound === '1' ? sample.musicUrl : '',
  };

  if (mode === 'cover') {
    return <InvitationShell view={view} />;
  }

  const definition = getTheme(themeId);
  const copy = getInvitationCopy(invitationLang, view.verseId);
  const { Card } = getThemeComponents(themeId);

  return (
    <div
      lang={htmlLangFor(invitationLang)}
      dir={dirFor(invitationLang)}
      style={themeStyle(definition, invitationLang)}
      className={`${invitationFontVariables} min-h-dvh bg-inv-bg text-inv-ink`}
    >
      <Card view={view} copy={copy} />
    </div>
  );
}
