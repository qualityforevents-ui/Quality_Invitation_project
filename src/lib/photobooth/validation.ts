import { z } from 'zod';
import { normaliseEgyptianPhone } from '@/lib/validation';
import { isValidDateString } from './availability';
import { BOOTH_AREAS, isValidBoothPackage } from './config';

/**
 * What the public booking form is allowed to send.
 *
 * Everything the customer types is re-validated here, on the server, regardless of what
 * the form already checked. The form's validation is a courtesy to the person filling
 * it in; this one is the only one that counts, because a server action is an HTTP
 * endpoint and anybody can post to it.
 *
 * The price is deliberately not in this schema. It is looked up from the package on the
 * server, because a price that arrives in the request body is a price the customer can
 * choose.
 */

const AREA_IDS = BOOTH_AREAS.map((area) => area.id) as [string, ...string[]];

export const BoothBookingSchema = z.object({
  eventDate: z.string().refine(isValidDateString, 'pick a real date'),

  // A 24 hour clock, which is what the time input produces on every platform.
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'pick a start time'),

  hours: z.coerce.number().int().min(1).max(12),

  packageId: z.string().refine(isValidBoothPackage, 'pick a package'),

  customerName: z.string().trim().min(2).max(80),

  /*
   * Stored in Egyptian local form, the same as an invitation's, so one operator search
   * box can find either. The transform is what does the work: a customer typing
   * +20 10 1234 5678 and a customer typing 01012345678 are the same person and must not
   * become two rows.
   */
  customerPhone: z
    .string()
    .trim()
    .transform((value) => normaliseEgyptianPhone(value))
    .refine((value): value is string => value !== null, 'that is not an Egyptian mobile number'),

  venue: z.string().trim().min(2).max(160),
  area: z.enum(AREA_IDS),
  eventType: z.string().trim().min(1).max(40),
  notes: z
    .string()
    .trim()
    .max(600)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional(),

  /*
   * The add on ids, as however many checkboxes were ticked. Validated against the
   * catalogue on the server rather than trusted, because a price that can be influenced
   * by a request body is a price the customer chooses.
   */
  addOns: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value])),

  lang: z.enum(['AR', 'EN']),

  /**
   * The honeypot.
   *
   * A field no human ever sees, hidden from the layout and from screen readers, that a
   * form filling bot will populate because it fills everything. Anything arriving with
   * this set is dropped, and dropped quietly: telling a bot which check it failed is
   * how the next version of it passes.
   */
  website: z.string().max(0).optional().or(z.literal('')),
});

export type BoothBookingInput = z.infer<typeof BoothBookingSchema>;
