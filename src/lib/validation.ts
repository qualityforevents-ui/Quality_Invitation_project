import { z } from 'zod';

/**
 * Hosts a venue link is allowed to point at.
 *
 * The field is free text pasted from a phone's share sheet, and the share sheet
 * produces several different shapes: a full maps.google.com URL, a goo.gl short link,
 * or the newer maps.app.goo.gl one. Anything outside this list is either a mistake or
 * someone using the venue field to place a link on a page that gets sent to hundreds
 * of people, so it is rejected rather than sanitised.
 */
const ALLOWED_MAP_HOSTS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
  'goo.gl',
  'maps.app.goo.gl',
  'g.co',
];

export function isGoogleMapsUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

  const host = url.hostname.toLowerCase();

  // google.com.eg, google.co.uk and the rest of the country domains.
  const isCountryDomain = /^(www\.)?google\.[a-z.]{2,6}$/.test(host);

  return ALLOWED_MAP_HOSTS.includes(host) || isCountryDomain;
}

/** Egyptian mobile numbers: 010, 011, 012 and 015, then eight digits. */
export function normaliseEgyptianPhone(value: string): string | null {
  const digits = value.replace(/[^\d]/g, '');

  const local = digits.startsWith('20')
    ? `0${digits.slice(2)}`
    : digits.startsWith('0')
      ? digits
      : `0${digits}`;

  return /^01[0125]\d{8}$/.test(local) ? local : null;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

/**
 * Every field is optional here on purpose. This validates an autosave patch, which
 * fires while the customer is still halfway through typing, so a partly filled form
 * has to be storable. Completeness is checked separately by isReadyForPreview.
 */
export const invitationPatchSchema = z.object({
  uiLang: z.enum(['AR', 'EN']).optional(),
  invitationLang: z.enum(['AR', 'EN']).optional(),
  eventType: z.enum(['ENGAGEMENT', 'WEDDING', 'KATB_KETAB']).optional(),

  name1: z.string().trim().max(60).optional(),
  name2: z.string().trim().max(60).optional(),

  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
    .optional(),
  eventTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM')
    .optional(),

  venueName: z.string().trim().max(120).optional(),
  venueMapUrl: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()
    .refine((value) => value == null || isGoogleMapsUrl(value), {
      message: 'Not a Google Maps link',
    }),

  customMessage: optionalText(200),

  package: z.enum(['BASIC', 'UNLIMITED', 'CUSTOM']).optional(),

  /** The design brief, collected only on the bespoke tier. */
  customRequest: optionalText(1200),

  themeId: z.string().trim().max(40).optional(),
  musicTrackId: z.string().trim().max(40).optional(),

  /** The ImageKit file path. Null clears the photo. */
  photoFileId: z
    .string()
    .trim()
    .max(300)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional(),

  /**
   * Crop coordinates in the source image's own pixels. Stored rather than applied, so
   * repositioning never means uploading again.
   */
  photoCrop: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .nullable()
    .optional(),

  customerPhone: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()
    .refine((value) => value == null || normaliseEgyptianPhone(value) !== null, {
      message: 'Not an Egyptian mobile number',
    }),
});

export type InvitationPatch = z.infer<typeof invitationPatchSchema>;

/** The fields without which there is nothing to preview. */
export type RequiredForPreview = {
  name1: string;
  name2: string;
  venueName: string;
  eventTime: string;
  eventDate: Date;
};

/**
 * `eventDate` is checked against today rather than against emptiness, because it can
 * never be empty: it is a non-null column and `createDraft` writes today plus sixty days
 * into every row it creates. That default is indistinguishable from a chosen date on the
 * server, and no validation fixes that without a schema change.
 *
 * What this does catch is the case that is actually reachable: a draft created in
 * January carrying a March placeholder, abandoned, and resumed in June would otherwise
 * report itself ready with a date that has already been and gone.
 *
 * The thing that keeps a customer from buying a date they never chose is the flow, not
 * this function. `eventDate` starts empty in `emptyValues`, the date question is not
 * answered until it matches the date pattern, and a resumed session is never let past an
 * unanswered date. Those three are the guard; this is the backstop.
 */
export function missingRequiredFields(
  invitation: RequiredForPreview,
  /** Today in Cairo as "YYYY-MM-DD". ISO date strings compare correctly as strings. */
  todayIso: string,
): string[] {
  const missing: string[] = [];
  if (!invitation.name1.trim()) missing.push('name1');
  if (!invitation.name2.trim()) missing.push('name2');
  if (!invitation.venueName.trim()) missing.push('venueName');
  if (!invitation.eventTime.trim()) missing.push('eventTime');

  const stored = invitation.eventDate;
  const iso = `${stored.getUTCFullYear().toString().padStart(4, '0')}-${(stored.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${stored.getUTCDate().toString().padStart(2, '0')}`;
  if (iso < todayIso) missing.push('eventDate');

  return missing;
}

export function isReadyForPreview(invitation: RequiredForPreview, todayIso: string): boolean {
  return missingRequiredFields(invitation, todayIso).length === 0;
}
