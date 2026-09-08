import { getEventInstant } from './format';
import { getTrack, trackName, trackUrl } from './music';
import { buildPhotoUrl, parseCrop } from './photo-url';
import type { Invitation } from '@/lib/types';
import type { EventType, Lang } from '@/lib/types';

/**
 * What a theme is given to render.
 *
 * Deliberately not the database row. It carries no editToken, no id, and no operator
 * fields, so the public page cannot leak them into HTML or into the serialised props
 * that get sent to the browser. It is also plain and serialisable, which matters
 * because it crosses into client components.
 */
export type InvitationView = {
  lang: Lang;
  eventType: EventType;
  name1: string;
  name2: string;
  /** UTC midnight of the calendar day, used for display formatting. */
  eventDate: Date;
  eventTime: string;
  /** The real instant the event begins, resolved in Cairo. Drives the countdown. */
  eventInstantMs: number;
  venueName: string;
  venueMapUrl: string | null;
  /**
   * Always null. The couple's words live in `quote` and render in the card's quote
   * slot; this stays on the type because every theme guards a block on it, and those
   * blocks are what would otherwise print the same line a second time near the footer.
   */
  customMessage: string | null;
  /** The line the couple chose, or null for none. Reaches the card as `copy.poetry`. */
  quote: string | null;
  themeId: string;
  /**
   * Which verse the card carries, or `none`. See src/lib/verses.ts.
   *
   * It travels on the view rather than being looked up from the copy module because
   * the copy module has no invitation to look at: it is given a language and asked for
   * the words, and the verse is now the one word set that depends on the row.
   */
  verseId: string;
  /** Null when the track file is not in the build, which is not an error. */
  musicUrl: string;
  musicName: string;
  /**
   * Delivery URL with the crop already applied, or null when there is no photo.
   *
   * Null is a real layout, not a degraded one. Every theme has a version without a
   * photo where the names and the ornaments get the room instead.
   */
  photoUrl: string | null;
};

export function toInvitationView(invitation: Invitation): InvitationView {
  const track = getTrack(invitation.musicTrackId);

  /*
   * A card cannot be drawn without a date, and a draft can now genuinely be without
   * one. Nothing reaches here in that state — the readiness check gates the preview and
   * activation both — so this fills in rather than throws, and the preview built from
   * the flow's own values does exactly the same.
   */
  const eventDate = invitation.eventDate ?? new Date();
  const eventTime = invitation.eventTime || '20:00';

  return {
    lang: invitation.invitationLang,
    eventType: invitation.eventType,
    name1: invitation.name1,
    name2: invitation.name2,
    eventDate,
    eventTime,
    eventInstantMs: getEventInstant(eventDate, eventTime).getTime(),
    venueName: invitation.venueName,
    venueMapUrl: invitation.venueMapUrl,
    customMessage: null,
    quote: invitation.customMessage,
    themeId: invitation.themeId,
    verseId: invitation.verseId,
    musicUrl: trackUrl(track),
    musicName: trackName(track, invitation.invitationLang),
    photoUrl: invitation.photoFileId
      ? buildPhotoUrl(invitation.photoFileId, parseCrop(invitation.photoCrop), { width: 900 })
      : null,
  };
}
