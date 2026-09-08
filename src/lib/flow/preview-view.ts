import type { FlowValues } from './values';
import { fromDateInputValue, getEventInstant } from '../format';
import { getTrack, trackName, trackUrl } from '../music';
import { buildPhotoUrl } from '../photo-url';
import type { InvitationView } from '../invitation-view';

/**
 * Builds what a theme renders, from the values held in the flow rather than from the
 * database row.
 *
 * The preview used to be its own route, so it could be fed `toInvitationView` on the
 * server. On one page it has to open from whatever the customer has just typed, and
 * waiting for a save and a server round trip before the card appears would put a
 * spinner in the middle of the moment the whole product is selling.
 *
 * Everything imported here is client safe. `buildPhotoUrl` comes from `photo-url`
 * rather than `imagekit`, whose first line reaches for node:crypto.
 */
export function viewFromValues(values: FlowValues, themeOverride?: string): InvitationView {
  const track = getTrack(values.musicTrackId);
  const eventDate = fromDateInputValue(values.eventDate) ?? new Date();
  const eventTime = values.eventTime || '20:00';

  return {
    lang: values.invitationLang,
    eventType: values.eventType,
    name1: values.name1,
    name2: values.name2,
    eventDate,
    eventTime,
    eventInstantMs: getEventInstant(eventDate, eventTime).getTime(),
    venueName: values.venueName,
    venueMapUrl: values.venueMapUrl.trim() || null,
    customMessage: null,
    quote: values.customMessage.trim() || null,
    themeId: themeOverride ?? values.themeId,
    verseId: values.verseId,
    musicUrl: trackUrl(track),
    musicName: trackName(track, values.invitationLang),
    photoUrl: values.photoFileId ? buildPhotoUrl(values.photoFileId, values.photoCrop) : null,
  };
}
