import { boothReservations, boothSyncStateDoc } from '@/lib/db';
import { todayInCairo } from '@/lib/format';
import { revalidateBoothAvailability } from '@/lib/photobooth/cache';
import { releaseExpiredHolds } from '@/lib/photobooth/reservations';
import { isNotionConfigured, queryEditedSince } from './client';
import { pullPageFromNotion, pushReservationToNotion } from './sync';

/**
 * The safety net under the webhook.
 *
 * Webhooks are best effort. Notion aggregates events, drops some, delivers others late,
 * and a deploy that happens mid delivery loses whatever was in flight. An integration
 * that only has webhooks is an integration that is silently wrong some of the time, and
 * the thing being got wrong here is which Saturdays are still for sale.
 *
 * So everything the webhook does, this can do again from scratch, and it runs on a
 * schedule regardless of whether any webhook arrived.
 */

export type ReconcileReport = {
  ran: boolean;
  skipped?: string;
  pulled: number;
  pushed: number;
  holdsReleased: number;
  cursor: string | null;
  errors: string[];
};

const LOCK_MS = 4 * 60 * 1000;

/**
 * Takes the lock, or reports that somebody else has it.
 *
 * Two reconciles at once is not a correctness problem — every write underneath is
 * transactional and idempotent — but it is a rate limit problem: Notion allows about
 * three requests a second and the client's pacing is per instance, so two instances
 * pacing themselves politely still add up to twice the allowance.
 *
 * A transaction, because "read the lock, see it is free, take it" is exactly the race
 * this is meant to prevent.
 */
async function acquireLock(now: Date): Promise<boolean> {
  const ref = boothSyncStateDoc();

  return ref.firestore.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const lockedUntil = snapshot.data()?.lockedUntil?.toDate?.() as Date | undefined;

    if (lockedUntil && lockedUntil.getTime() > now.getTime()) return false;

    // An expiry rather than a release, so a run that dies without cleaning up frees the
    // lock on its own a few minutes later instead of wedging the sync forever.
    tx.set(ref, { lockedUntil: new Date(now.getTime() + LOCK_MS) }, { merge: true });
    return true;
  });
}

async function releaseLock(): Promise<void> {
  await boothSyncStateDoc().set({ lockedUntil: null }, { merge: true }).catch(() => {});
}

/**
 * Pulls everything edited in Notion since the last run, pushes everything the site
 * still owes, and releases expired holds.
 *
 * The cursor advances page by page rather than once at the end, so a run that dies half
 * way through has still recorded what it finished. Combined with the ascending sort in
 * the query, the next run resumes exactly where this one stopped.
 */
export async function runIncrementalSync(
  { full = false }: { full?: boolean } = {},
): Promise<ReconcileReport> {
  const now = new Date();

  const report: ReconcileReport = {
    ran: false,
    pulled: 0,
    pushed: 0,
    holdsReleased: 0,
    cursor: null,
    errors: [],
  };

  if (!(await acquireLock(now))) {
    return { ...report, skipped: 'another sync is running' };
  }

  try {
    report.ran = true;

    /*
     * Expired holds first, and unconditionally.
     *
     * This is the one part of the job that matters even when Notion is not configured
     * at all: a hold that has lapsed is a Saturday that should be back on sale, and
     * everything else here is bookkeeping by comparison.
     */
    report.holdsReleased = await releaseExpiredHolds(now).catch((error) => {
      report.errors.push(`holds: ${String(error)}`);
      return 0;
    });

    if (!isNotionConfigured()) {
      return { ...report, skipped: 'Notion is not configured' };
    }

    const state = (await boothSyncStateDoc().get()).data() ?? {};
    /*
     * A full pass asks for everything by passing no cursor. Used by the nightly run, to
     * catch anything a dropped webhook and a missed incremental both lost — which is
     * rare, and is exactly the kind of rare that goes unnoticed for a month.
     */
    let cursor: string | null = full ? null : (state.lastIncrementalCursor ?? null);

    let startCursor: string | null = null;
    let pages = 0;

    do {
      const result = await queryEditedSince(cursor, startCursor);

      for (const page of result.results) {
        try {
          const outcome = await pullPageFromNotion(page.id);
          if (outcome.action !== 'ignored') report.pulled += 1;

          // Advanced per page, so a run that dies keeps what it finished.
          cursor = page.last_edited_time;
          await boothSyncStateDoc().set(
            { lastIncrementalCursor: cursor, lastIncrementalRunAt: new Date() },
            { merge: true },
          );
        } catch (error) {
          report.errors.push(`page ${page.id}: ${String(error)}`);
        }
      }

      startCursor = result.has_more ? result.next_cursor : null;
      pages += 1;
      // A guard against a pagination bug turning into an unbounded loop inside a
      // function that talks to a rate limited API.
    } while (startCursor && pages < 20);

    report.cursor = cursor;

    /* Everything the site failed to push, or never got round to pushing. */
    const owing = await boothReservations().where('syncState', 'in', ['pending', 'error']).limit(50).get();

    for (const doc of owing.docs) {
      await pushReservationToNotion(doc.id);
      report.pushed += 1;
    }

    if (full) {
      /*
       * The nightly pass also pushes every future booking, whether or not it claims to
       * be in sync. This is the check on the loop guard itself: if a hash were ever
       * wrong, every other mechanism here would agree the row was fine forever.
       */
      const today = todayInCairo(now);
      const future = await boothReservations().where('eventDate', '>=', today).limit(200).get();

      for (const doc of future.docs) {
        await pushReservationToNotion(doc.id);
        report.pushed += 1;
      }

      await boothSyncStateDoc().set({ lastFullReconcileAt: new Date() }, { merge: true });
    }

    await boothSyncStateDoc().set(
      { lastError: report.errors.length > 0 ? report.errors[0].slice(0, 500) : null },
      { merge: true },
    );

    revalidateBoothAvailability();

    return report;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.errors.push(message);

    await boothSyncStateDoc()
      .set({ lastError: message.slice(0, 500) }, { merge: true })
      .catch(() => {});

    return report;
  } finally {
    await releaseLock();
  }
}

export type SyncState = {
  lastIncrementalCursor: string | null;
  lastIncrementalRunAt: Date | null;
  lastFullReconcileAt: Date | null;
  lastWebhookAt: Date | null;
  lastError: string | null;
};

export async function getSyncState(): Promise<SyncState> {
  const snapshot = await boothSyncStateDoc().get();
  const data = snapshot.data() ?? {};

  const toDate = (value: unknown): Date | null =>
    value && typeof value === 'object' && 'toDate' in value
      ? (value as { toDate: () => Date }).toDate()
      : null;

  return {
    lastIncrementalCursor: data.lastIncrementalCursor ?? null,
    lastIncrementalRunAt: toDate(data.lastIncrementalRunAt),
    lastFullReconcileAt: toDate(data.lastFullReconcileAt),
    lastWebhookAt: toDate(data.lastWebhookAt),
    lastError: data.lastError ?? null,
  };
}

/**
 * Whether it has been long enough to be worth triggering a catch up run.
 *
 * Used by the availability endpoint, which fires one in `after()` when the last
 * incremental is older than five minutes. That is the opportunistic third trigger: a
 * site with visitors keeps itself in sync without any scheduler at all, which matters
 * because the cheapest Vercel plan allows one cron a day.
 */
export async function isIncrementalStale(maxAgeMs = 5 * 60 * 1000): Promise<boolean> {
  const state = await getSyncState();
  if (!state.lastIncrementalRunAt) return true;
  return Date.now() - state.lastIncrementalRunAt.getTime() > maxAgeMs;
}
