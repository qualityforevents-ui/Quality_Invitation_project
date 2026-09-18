import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { runIncrementalSync } from '@/lib/notion/reconcile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The scheduled catch up.
 *
 * Called from three places, which between them cover the ways a webhook can be lost:
 *
 *   A GitHub Actions schedule, every fifteen minutes, with ?full=0. This is the real
 *   heartbeat. It is free, and it works on a Vercel plan that only allows one cron a
 *   day, which is the plan this business is on.
 *
 *   A Vercel cron, once a day, with ?full=1. The full pass ignores the cursor and walks
 *   everything, which is what catches a page that both the webhook and every
 *   incremental run missed.
 *
 *   The admin's "sync now" button, which calls the same function directly rather than
 *   coming through here.
 *
 * GET rather than POST, because Vercel's cron and GitHub Actions both issue a GET and
 * neither can be persuaded otherwise. The secret is what makes that acceptable: this is
 * not a public endpoint that happens to be idempotent, it is a private one.
 */

/**
 * Constant time comparison, so the secret cannot be recovered a byte at a time by
 * timing the response.
 */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const full = new URL(request.url).searchParams.get('full') === '1';

  const report = await runIncrementalSync({ full });

  /*
   * Always 200, even when the report carries errors.
   *
   * A non 200 here makes GitHub Actions mark the workflow failed and email somebody
   * every fifteen minutes, and the errors this job collects are mostly one page that
   * could not be read. The report is the signal; the admin settings screen shows the
   * last error, which is where a human will actually look.
   */
  return NextResponse.json({ ok: true, ...report });
}
