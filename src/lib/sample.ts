import { getEventInstant } from './format';
import { DEFAULT_VERSE_ID } from './verses';
import { getTrack, trackName, trackUrl } from './music';
import { DEFAULT_THEME, getTheme } from '@/themes/registry';
import type { InvitationView } from './invitation-view';
import type { Lang } from '@/generated/prisma/enums';

/**
 * The invitation shown at /sample.
 *
 * The landing page links to it so somebody can see what they are buying before they
 * start, and it doubles as a way to work on a theme without a database or a draft.
 * The date is always some weeks out so the countdown is doing something.
 */
export function buildSampleView(lang: Lang, themeId?: string, verseId?: string): InvitationView {
  const now = new Date();
  const eventDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 45),
  );
  const eventTime = '20:00';

  const theme = getTheme(themeId ?? DEFAULT_THEME.id);
  const track = getTrack(theme.defaultMusicTrackId);

  const arabic = {
    name1: 'كريم',
    name2: 'سلمى',
    venueName: 'قاعة النيل الكبرى',
    customMessage: 'وجودكم معانا هو أجمل هدية',
  };

  const english = {
    name1: 'Karim',
    name2: 'Salma',
    venueName: 'The Grand Nile Hall',
    customMessage: 'Your presence with us is the finest gift of all',
  };

  const content = lang === 'AR' ? arabic : english;

  return {
    lang,
    eventType: 'ENGAGEMENT',
    ...content,
    eventDate,
    eventTime,
    eventInstantMs: getEventInstant(eventDate, eventTime).getTime(),
    venueMapUrl: 'https://maps.google.com/?q=Cairo',
    themeId: theme.id,
    verseId: verseId ?? DEFAULT_VERSE_ID,
    musicUrl: trackUrl(track),
    musicName: trackName(track, lang),
    // The sample deliberately shows the layout without a photo. That version is a real
    // design rather than a fallback, and it is the one most customers will see.
    photoUrl: null,
  };
}
