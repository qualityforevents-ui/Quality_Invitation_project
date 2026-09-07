import { isSectionActive, SECTION_ORDER, sectionIndex, type SectionId } from './sections';
import { toDateInputValue } from '../format';
import { parseCrop, type PhotoCrop } from '../photo-url';
import { isGoogleMapsUrl, normaliseEgyptianPhone } from '../validation';
import { suggestArabicName, suggestLatinName } from '../arabic-suggest';
import { getPackage } from '../packages';
import { DEFAULT_THEME_ID } from '../constants';
import { DEFAULT_VERSE_ID } from '../verses';
import { getTheme } from '@/themes/registry';
import type { Invitation } from '@/generated/prisma/client';
import type { EventType, Lang, Package } from '@/generated/prisma/enums';

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MESSAGE_MAX = 200;
export const BRIEF_MAX = 1200;

/**
 * Everything the flow holds, in one flat object.
 *
 * Flat rather than grouped by section, because the autosave patch is flat and the two
 * being the same shape is what keeps `toPatch` readable.
 */
export type FlowValues = {
  package: Package;
  name1: string;
  name2: string;
  eventType: EventType;
  /** "YYYY-MM-DD", or empty until the customer has actually chosen one. */
  eventDate: string;
  /** "HH:MM", or empty until chosen. */
  eventTime: string;
  venueName: string;
  venueMapUrl: string;
  customMessage: string;
  invitationLang: Lang;
  /** One of the four verse ids, or `none`. See src/lib/verses.ts. */
  verseId: string;
  themeId: string;
  musicTrackId: string;
  photoFileId: string | null;
  photoCrop: PhotoCrop | null;
  customRequest: string;
  customerPhone: string;
};

/**
 * The starting values for somebody who has never been here.
 *
 * The date and the time start empty on purpose, unlike the old form which pre filled a
 * date sixty days out. A pre filled answer to a question nobody has been asked is the
 * root of the resume problem this flow had to solve: once it is in the field it is
 * indistinguishable from a choice, and a customer can carry it all the way to payment
 * without ever noticing their wedding is booked for the wrong day.
 */
export function emptyValues(requestedPackage: Package): FlowValues {
  const theme = getTheme(DEFAULT_THEME_ID);

  return {
    package: requestedPackage,
    name1: '',
    name2: '',
    eventType: 'ENGAGEMENT',
    eventDate: '',
    eventTime: '',
    venueName: '',
    venueMapUrl: '',
    customMessage: '',
    invitationLang: 'AR',
    verseId: DEFAULT_VERSE_ID,
    themeId: theme.id,
    musicTrackId: theme.defaultMusicTrackId,
    photoFileId: null,
    photoCrop: null,
    customRequest: '',
    customerPhone: '',
  };
}

export function valuesFromInvitation(
  invitation: Invitation | null,
  requestedPackage: Package | null,
): FlowValues {
  const base = emptyValues(requestedPackage ?? 'BASIC');
  if (!invitation) return base;

  return {
    // An explicit choice made just now beats whatever the draft was carrying. Arriving
    // through a package card is somebody deciding, and ignoring that because they
    // started a draft last week would be the app arguing with them.
    package: requestedPackage ?? invitation.package,
    name1: invitation.name1,
    name2: invitation.name2,
    eventType: invitation.eventType,
    eventDate: toDateInputValue(invitation.eventDate),
    eventTime: invitation.eventTime,
    venueName: invitation.venueName,
    venueMapUrl: invitation.venueMapUrl ?? '',
    customMessage: invitation.customMessage ?? '',
    invitationLang: invitation.invitationLang,
    verseId: invitation.verseId,
    themeId: invitation.themeId,
    musicTrackId: invitation.musicTrackId,
    photoFileId: invitation.photoFileId,
    // Seeded from the stored crop, not from null. Starting empty meant that merely
    // reopening a later question and changing the theme sent photoCrop: null and wiped
    // the customer's framing.
    photoCrop: parseCrop(invitation.photoCrop),
    customRequest: invitation.customRequest ?? '',
    customerPhone: invitation.customerPhone ?? '',
  };
}

/**
 * Builds the autosave patch.
 *
 * This function owns one rule and it is the reason it exists separately: a patch is all
 * or nothing on the server, so a single field that would fail validation rejects every
 * other field with it. A half typed Google Maps link must therefore be left out rather
 * than sent and refused, or the customer's names stop saving while they are still
 * pasting a URL.
 *
 * Every omission below is that rule, and nothing else is omitted.
 */
export function toPatch(values: FlowValues, uiLang: Lang): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    uiLang,
    package: values.package,
    eventType: values.eventType,
    name1: values.name1,
    name2: values.name2,
    venueName: values.venueName,
    customMessage: values.customMessage,
    invitationLang: values.invitationLang,
    verseId: values.verseId,
    themeId: values.themeId,
    musicTrackId: values.musicTrackId,
    photoFileId: values.photoFileId,
    photoCrop: values.photoCrop,
    // Only the bespoke tier stores a brief. Cleared rather than left behind when the
    // customer moves down a tier, so the operator never reads a promise that was not
    // paid for.
    customRequest: getPackage(values.package).customDesign ? values.customRequest : '',
  };

  if (DATE_PATTERN.test(values.eventDate)) patch.eventDate = values.eventDate;
  if (TIME_PATTERN.test(values.eventTime)) patch.eventTime = values.eventTime;

  const mapUrl = values.venueMapUrl.trim();
  if (mapUrl.length === 0 || isGoogleMapsUrl(mapUrl)) patch.venueMapUrl = values.venueMapUrl;

  const phone = values.customerPhone.trim();
  if (phone.length === 0 || normaliseEgyptianPhone(phone) !== null) {
    patch.customerPhone = values.customerPhone;
  }

  return patch;
}

/**
 * The name spellings worth offering to rewrite, given the language the card is now set
 * in. Empty when there is nothing to offer.
 *
 * Shared rather than computed inside the language question, because the flow itself has
 * to know: with a suggestion on screen the section holds and waits for an answer, and
 * without one, choosing a language is the whole question and it advances immediately.
 * Two copies of this rule would drift, and the failure mode is a question with no way
 * out of it.
 */
export function scriptSuggestions(
  invitationLang: Lang,
  name1: string,
  name2: string,
): Array<{ key: 'name1' | 'name2'; current: string; next: string }> {
  const suggest = invitationLang === 'AR' ? suggestArabicName : suggestLatinName;

  return (
    [
      { key: 'name1' as const, current: name1, next: suggest(name1) },
      { key: 'name2' as const, current: name2, next: suggest(name2) },
    ].filter((entry) => entry.next !== null) as Array<{
      key: 'name1' | 'name2';
      current: string;
      next: string;
    }>
  );
}

/** Whether a section has an answer good enough to move past it. */
export function isAnswered(id: SectionId, values: FlowValues): boolean {
  switch (id) {
    case 'package':
    case 'occasion':
    case 'language':
    case 'verse':
    case 'theme':
    case 'music':
      // These always hold a valid value, so reaching them is answering them.
      return true;
    case 'name1':
      return values.name1.trim().length > 0;
    case 'name2':
      return values.name2.trim().length > 0;
    case 'eventDate':
      return DATE_PATTERN.test(values.eventDate);
    case 'eventTime':
      return TIME_PATTERN.test(values.eventTime);
    case 'venue':
      return values.venueName.trim().length > 0;
    case 'map':
      return values.venueMapUrl.trim().length === 0 || isGoogleMapsUrl(values.venueMapUrl);
    case 'message':
    case 'photo':
    case 'preview':
      return true;
    case 'brief':
      return values.customRequest.trim().length > 0;
    case 'phone':
      return normaliseEgyptianPhone(values.customerPhone) !== null;
    case 'payment':
      return false;
    default:
      return false;
  }
}

/**
 * Where a returning customer should land when this device has no record of how far they
 * got.
 *
 * Capped at the date question on purpose. Only the fields a customer must type are
 * evidence of anything: `createDraft` writes a default event date, a default time, a
 * theme and a track into every row it creates, so anything past the names could be a
 * default wearing an answer's clothes. Re-asking two questions is a small cost.
 * Presenting a date somebody never chose as though they had is not.
 */
export function inferFurthest(values: FlowValues): SectionId | null {
  if (values.name1.trim().length === 0) return null;
  if (values.name2.trim().length === 0) return 'name1';
  return 'occasion';
}

/**
 * Clamps a remembered position against the values actually stored.
 *
 * A cookie can outlive the draft it describes, and can be edited by hand. Trusting it
 * blindly would let the flow open at the payment panel with no bride's name in it, so
 * it is never allowed past the first unanswered question that cannot be skipped.
 */
export function clampFurthest(
  remembered: SectionId | null,
  values: FlowValues,
): SectionId | null {
  if (!remembered) return inferFurthest(values);

  const limit = sectionIndex(remembered);

  for (let i = 0; i <= limit && i < SECTION_ORDER.length; i += 1) {
    const id = SECTION_ORDER[i];
    if (!isSectionActive(id, values.package, values.invitationLang)) continue;
    if (!isAnswered(id, values)) {
      // Land on the question itself, which means revealing everything before it.
      return i === 0 ? null : SECTION_ORDER[i - 1];
    }
  }

  return remembered;
}
