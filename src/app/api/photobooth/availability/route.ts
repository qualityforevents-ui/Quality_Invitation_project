import { NextResponse, after } from 'next/server';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';
import { getAvailability } from '@/lib/photobooth/reservations';
import { BOOTH_AVAILABILITY_TAG } from '@/lib/photobooth/cache';
import { isIncrementalStale, runIncrementalSync } from '@/lib/notion/reconcile';
import { isNotionConfigured } from '@/lib/notion/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Which days the booth is free, for the calendar on /photobooth.
 *
 * The response is deliberately impoverished: a status per date and nothing else. Not
 * how many booths are left beyond what "last" already implies, not who booked them, not
 * a count of anything. This is an unauthenticated endpoint on a public URL, and a
 * competitor should not be able to pull this business's booking volume out of it by
 * fetching thirteen months and counting.
 *
 * A month at a time, up to six, because the calendar fetches when the visitor pages
 * forward and there is no reason to let one request ask for a decade.
 */
const QuerySchema = z.object({
  /** "YYYY-MM". The calendar thinks in months; the engine thinks in days. */
  from: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'from must look like 2026-03'),
  months: z.coerce.number().int().min(1).max(6).default(3),
});

/**
 * Sixty seconds, and a tag every write path invalidates.
 *
 * The number is a compromise rather than a target. Availability that is a minute stale
 * can show a date as free that has just gone, which costs one customer one message;
 * availability read fresh on every paint costs a Firestore query per calendar swipe on
 * a page that is mostly browsed by people who will never book. The booking transaction
 * is what actually prevents a double sale, so this cache is allowed to be a little
 * wrong in the direction of being fast.
 */
const readAvailability = unstable_cache(
  async (from: string, to: string) => getAvailability(from, to),
  ['booth-availability'],
  { revalidate: 60, tags: [BOOTH_AVAILABILITY_TAG] },
);

export async function GET(request: Request) {
  pruneRateLimits();

  const headerList = await headers();
  const key =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown';

  // Enough for somebody paging through a year of calendar, nothing like enough to
  // enumerate the business's whole booking history.
  const { allowed, retryAfterSeconds } = checkRateLimit(`booth-availability:${key}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'too many' },
      { status: 429, headers: { 'retry-after': String(retryAfterSeconds) } },
    );
  }

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    from: url.searchParams.get('from') ?? '',
    months: url.searchParams.get('months') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad range' }, { status: 400 });
  }

  const { from, months } = parsed.data;

  const [year, month] = from.split('-').map(Number);
  const firstDay = `${from}-01`;

  // The last day of the final month, found by stepping to the first of the month after
  // it and going back one day. Avoids a table of month lengths and a leap year rule.
  const endExclusive = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(endExclusive.getTime() - 86_400_000).toISOString().slice(0, 10);

  try {
    const days = await readAvailability(firstDay, lastDay);

    /*
     * The opportunistic sync trigger.
     *
     * A site with visitors keeps itself in step with Notion without any scheduler at
     * all, which matters because the Vercel plan this runs on allows one cron a day.
     * Somebody browsing the calendar is the most useful possible moment to notice the
     * sync has gone stale, because they are about to rely on what it says.
     *
     * In `after()`, so the visitor never waits for it, and behind the same lock
     * document the cron uses, so a busy evening cannot start twenty of them at once.
     */
    if (isNotionConfigured()) {
      after(async () => {
        try {
          if (await isIncrementalStale()) await runIncrementalSync();
        } catch (error) {
          console.error('[booth] opportunistic sync failed', error);
        }
      });
    }

    return NextResponse.json({ ok: true, from: firstDay, to: lastDay, days });
  } catch (error) {
    console.error('[api/photobooth/availability] could not read the calendar', error);
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
