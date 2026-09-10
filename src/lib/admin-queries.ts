import { invitations, reviews } from './db';
import { mapInvitation } from './invitations';
import { getEventInstant } from './format';
import { EVENT_TIMEZONE } from './constants';
import { packagePrice } from './packages';
import { normaliseEgyptianPhone } from './validation';
import type { Invitation } from './types';

/** Anything waiting this long is a customer who tapped the button and went quiet. */
export const STALE_AFTER_HOURS = 4;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight on the first of the current month, Cairo time. */
function monthStart(now: Date): Date {
  const [year, month] = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .split('-')
    .map(Number);

  return getEventInstant(new Date(Date.UTC(year, month - 1, 1)), '00:00');
}

export type AdminStats = {
  builtLast7: number;
  paidLast7: number;
  revenueThisMonth: number;
  /** Built to paid over the last 30 days. Null when nothing was built to divide by. */
  conversionRate: number | null;
  conversionBuilt: number;
  conversionPaid: number;
};

/**
 * The numbers on the home screen.
 *
 * Rolling windows rather than calendar weeks, so the figures mean the same thing on a
 * Monday as on a Saturday, and there is no argument about which day a week starts on.
 * Revenue is the exception and follows the calendar month, because that is the number
 * anyone actually wants when they think about a month.
 *
 * The conversion pair used to be two counts, one of them filtering on createdAt and
 * activatedAt at once. Firestore will not range-filter two fields in one query, so the
 * thirty day window is fetched once and both numbers are counted from it in memory.
 * At this volume that is one read of a few hundred small documents; if the business
 * ever outgrows that, the fix is a stored daily rollup, not a bigger query.
 */
export async function getStats(): Promise<AdminStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [builtLast7, paidLast7, activatedThisMonth, lastThirtyDays] = await Promise.all([
    invitations().where('createdAt', '>=', sevenDaysAgo).count().get(),
    invitations().where('activatedAt', '>=', sevenDaysAgo).count().get(),
    invitations().where('activatedAt', '>=', monthStart(now)).get(),
    invitations().where('createdAt', '>=', thirtyDaysAgo).get(),
  ]);

  const conversionBuilt = lastThirtyDays.size;
  const conversionPaid = lastThirtyDays.docs.filter((doc) => doc.get('activatedAt')).length;

  return {
    builtLast7: builtLast7.data().count,
    paidLast7: paidLast7.data().count,
    // Summed per invitation rather than multiplied by one price. Three tiers exist and
    // an average would be wrong every month.
    revenueThisMonth: activatedThisMonth.docs.reduce(
      (total, doc) => total + packagePrice(doc.get('package') ?? 'BASIC'),
      0,
    ),
    conversionRate: conversionBuilt > 0 ? conversionPaid / conversionBuilt : null,
    conversionBuilt,
    conversionPaid,
  };
}

/**
 * The queue, longest wait first.
 *
 * This used to be newest first, which is the order a feed wants and the wrong order for
 * a queue: it buries the person who has been waiting since last night under everyone
 * who arrived since, and the operator works down from the top. The one case newest-first
 * served — a request that just landed in WhatsApp — is served better by the search box,
 * which is where the operator arrives with a request id in hand anyway.
 */
export async function getPending(): Promise<Invitation[]> {
  const snapshot = await invitations()
    .where('status', '==', 'AWAITING_CONFIRMATION')
    .orderBy('updatedAt', 'asc')
    .limit(100)
    .get();

  return snapshot.docs.map(mapInvitation);
}

export function isStale(invitation: Invitation): boolean {
  return Date.now() - invitation.updatedAt.getTime() > STALE_AFTER_HOURS * 60 * 60 * 1000;
}

export async function getById(id: string): Promise<Invitation | null> {
  if (!id) return null;
  const doc = await invitations().doc(id).get();
  return doc.exists ? mapInvitation(doc) : null;
}

/** How many recent invitations the search box will look through. */
const SEARCH_SCAN_LIMIT = 500;

/**
 * One box, several kinds of input.
 *
 * The overwhelmingly common case is a request id pasted out of a WhatsApp message, so
 * that is tried first and exactly, as a real indexed lookup.
 *
 * Everything after it is a substring match, and this is the one capability the move to
 * Firestore actually costs: Postgres could answer `name1 ILIKE '%kar%'`, and Firestore
 * cannot express it at all — it indexes whole field values and prefixes, never the
 * middle of a string. So the fallback reads the most recent SEARCH_SCAN_LIMIT
 * invitations and filters them here. It is honest at this size and it is bounded, but
 * it is a scan: an operator searching for a customer from two years and ten thousand
 * invitations ago will not find them this way. The exact request id path, which is how
 * the operator actually arrives here, is unaffected.
 */
export async function search(query: string): Promise<Invitation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const asRequestId = trimmed.toUpperCase().startsWith('QLT-')
    ? trimmed.toUpperCase()
    : `QLT-${trimmed.toUpperCase()}`;

  const exact = await invitations().where('requestId', '==', asRequestId).limit(1).get();
  if (!exact.empty) return [mapInvitation(exact.docs[0])];

  const phone = normaliseEgyptianPhone(trimmed);
  const needle = trimmed.toLowerCase();

  const recent = await invitations()
    .orderBy('createdAt', 'desc')
    .limit(SEARCH_SCAN_LIMIT)
    .get();

  return recent.docs
    .map(mapInvitation)
    .filter((invitation) => {
      const phoneOnRow = invitation.customerPhone ?? '';

      return (
        (phone !== null && phoneOnRow.includes(phone)) ||
        phoneOnRow.includes(trimmed) ||
        invitation.name1.toLowerCase().includes(needle) ||
        invitation.name2.toLowerCase().includes(needle) ||
        invitation.slug.includes(needle)
      );
    })
    .slice(0, 40);
}

export type StatusFilter =
  | 'ALL'
  | 'DRAFT'
  | 'AWAITING_CONFIRMATION'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REJECTED';

export async function listByStatus(filter: StatusFilter): Promise<Invitation[]> {
  const base = invitations().orderBy('createdAt', 'desc').limit(100);
  const query = filter === 'ALL' ? base : invitations()
    .where('status', '==', filter)
    .orderBy('createdAt', 'desc')
    .limit(100);

  const snapshot = await query.get();
  return snapshot.docs.map(mapInvitation);
}

/** The numbers on the tab bar. Three count aggregations, no documents read. */
export async function getNavCounts(): Promise<{
  pending: number;
  drafts: number;
  reviews: number;
}> {
  const [pending, drafts, reviewsPending] = await Promise.all([
    invitations().where('status', '==', 'AWAITING_CONFIRMATION').count().get(),
    invitations().where('status', '==', 'DRAFT').count().get(),
    reviews().where('status', '==', 'PENDING').count().get(),
  ]);

  return {
    pending: pending.data().count,
    drafts: drafts.data().count,
    reviews: reviewsPending.data().count,
  };
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * How long somebody has been waiting, in Arabic.
 *
 * An absolute timestamp is the wrong unit for a queue. "امبارح 23:14" has to be
 * subtracted from the current time before it means anything, and the thing the operator
 * is deciding — who has been left hanging longest — is exactly that subtraction.
 *
 * Arabic counts in four buckets rather than two, and a singular where a dual belongs
 * reads as broken to every customer this is about. Digits stay Latin, which is what the
 * rest of the product uses and what a phone keyboard produces.
 */
export function formatWaited(since: Date, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - since.getTime());

  if (elapsed < HOUR_MS) {
    return counted(Math.max(1, Math.floor(elapsed / MINUTE_MS)), 'دقيقة', 'دقيقتين', 'دقايق');
  }

  if (elapsed < 24 * HOUR_MS) {
    return counted(Math.floor(elapsed / HOUR_MS), 'ساعة', 'ساعتين', 'ساعات');
  }

  return counted(Math.floor(elapsed / (24 * HOUR_MS)), 'يوم', 'يومين', 'أيام');
}

function counted(n: number, one: string, two: string, few: string): string {
  if (n === 1) return `من ${one}`;
  if (n === 2) return `من ${two}`;
  // Three to ten take the plural; eleven and up go back to the singular after the
  // number. This is the rule, not a stylistic choice.
  if (n <= 10) return `من ${n} ${few}`;
  return `من ${n} ${one}`;
}
