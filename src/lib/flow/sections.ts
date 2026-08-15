import type { Package } from '@/generated/prisma/enums';

/**
 * The order the flow asks its questions in, as data rather than as JSX.
 *
 * Keeping the order in an array is what makes "advance" a single lookup instead of a
 * switch that has to be edited in four places, and it is what lets a section be
 * conditional without the surrounding markup knowing about it. Reordering the flow, or
 * merging two questions back into one, is an edit to this file and nothing else.
 *
 * The hero is deliberately not in here. It is not a question, it is always on screen,
 * and tapping Start is what reveals the first real section.
 */
export const SECTION_ORDER = [
  'package',
  'name1',
  'name2',
  'occasion',
  'eventDate',
  'eventTime',
  'venue',
  'map',
  'message',
  'language',
  'theme',
  'music',
  'photo',
  'preview',
  'brief',
  'phone',
  'payment',
] as const;

export type SectionId = (typeof SECTION_ORDER)[number];

/**
 * Sections that can be passed over without an answer.
 *
 * Each of these gets a second, quieter control saying so in words. A question a
 * customer cannot answer and cannot leave is where a flow like this dies, and the map
 * link is the specific case: most people do not have one to hand, and the old form let
 * a half pasted URL silently reject the entire autosave patch.
 */
const SKIPPABLE = new Set<SectionId>(['map', 'message', 'photo']);

export function isSkippable(id: SectionId): boolean {
  return SKIPPABLE.has(id);
}

/**
 * Whether a section belongs in the flow at all, given what has been chosen so far.
 *
 * Only the bespoke tier is asked for a written brief. The predicate is evaluated on
 * every advance rather than once, so changing the package from the payment panel adds
 * or removes that question live.
 */
export function isSectionActive(id: SectionId, packageId: Package): boolean {
  if (id === 'brief') return packageId === 'CUSTOM';
  return true;
}

export function sectionIndex(id: SectionId): number {
  return SECTION_ORDER.indexOf(id);
}

/** The next section after `id` that applies, or null when the flow is finished. */
export function nextSection(id: SectionId, packageId: Package): SectionId | null {
  for (let i = sectionIndex(id) + 1; i < SECTION_ORDER.length; i += 1) {
    const candidate = SECTION_ORDER[i];
    if (isSectionActive(candidate, packageId)) return candidate;
  }
  return null;
}

export function isValidSectionId(value: string): value is SectionId {
  return (SECTION_ORDER as readonly string[]).includes(value);
}

/**
 * How far along the flow is, as a percentage, for the header's progress rail.
 *
 * Measured against the sections that actually apply, so a customer on the basic tier is
 * not permanently short of the end because a question they will never be asked is
 * counted in the denominator.
 */
export function progressPercent(furthest: SectionId | null, packageId: Package): number {
  if (!furthest) return 0;

  const applicable = SECTION_ORDER.filter((id) => isSectionActive(id, packageId));
  const reached = applicable.indexOf(furthest);

  return Math.round(((reached + 1) / applicable.length) * 100);
}
