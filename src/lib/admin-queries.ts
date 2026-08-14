import { prisma } from './db';
import { getEventInstant } from './format';
import { EVENT_TIMEZONE, PRICE_EGP } from './constants';
import { normaliseEgyptianPhone } from './validation';
import type { Invitation } from '@/generated/prisma/client';

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
 */
export async function getStats(): Promise<AdminStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [builtLast7, paidLast7, paidThisMonth, conversionBuilt, conversionPaid] = await Promise.all([
    prisma.invitation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.invitation.count({ where: { activatedAt: { gte: sevenDaysAgo } } }),
    prisma.invitation.count({ where: { activatedAt: { gte: monthStart(now) } } }),
    prisma.invitation.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.invitation.count({
      where: { createdAt: { gte: thirtyDaysAgo }, activatedAt: { not: null } },
    }),
  ]);

  return {
    builtLast7,
    paidLast7,
    revenueThisMonth: paidThisMonth * PRICE_EGP,
    conversionRate: conversionBuilt > 0 ? conversionPaid / conversionBuilt : null,
    conversionBuilt,
    conversionPaid,
  };
}

/** Newest first. This is the screen the operator lives on. */
export async function getPending(): Promise<Invitation[]> {
  return prisma.invitation.findMany({
    where: { status: 'AWAITING_CONFIRMATION' },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
}

export function isStale(invitation: Invitation): boolean {
  return Date.now() - invitation.updatedAt.getTime() > STALE_AFTER_HOURS * 60 * 60 * 1000;
}

export async function getById(id: string): Promise<Invitation | null> {
  return prisma.invitation.findUnique({ where: { id } });
}

/**
 * One box, several kinds of input.
 *
 * The overwhelmingly common case is a request id pasted out of a WhatsApp message, so
 * that is tried first and exactly. Failing that it is a customer asking for help, and
 * the operator has either their phone number or the couple's names.
 */
export async function search(query: string): Promise<Invitation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const asRequestId = trimmed.toUpperCase().startsWith('QLT-')
    ? trimmed.toUpperCase()
    : `QLT-${trimmed.toUpperCase()}`;

  const exact = await prisma.invitation.findUnique({ where: { requestId: asRequestId } });
  if (exact) return [exact];

  const phone = normaliseEgyptianPhone(trimmed);

  return prisma.invitation.findMany({
    where: {
      OR: [
        ...(phone ? [{ customerPhone: { contains: phone } }] : []),
        { customerPhone: { contains: trimmed } },
        { name1: { contains: trimmed, mode: 'insensitive' as const } },
        { name2: { contains: trimmed, mode: 'insensitive' as const } },
        { slug: { contains: trimmed.toLowerCase() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
}

export type StatusFilter = 'ALL' | 'DRAFT' | 'AWAITING_CONFIRMATION' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';

export async function listByStatus(filter: StatusFilter): Promise<Invitation[]> {
  return prisma.invitation.findMany({
    where: filter === 'ALL' ? {} : { status: filter },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
