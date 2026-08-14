import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily write that keeps the free Supabase project from pausing.
 *
 * A free project pauses after seven days with no database activity, and a paused
 * project means every live invitation that has not been cached breaks. Vercel Hobby
 * allows one cron per day, which is exactly what this needs.
 *
 * It writes rather than reads on purpose. A read may be answered from cache and does
 * not always register as activity.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Vercel attaches this header automatically when CRON_SECRET is set on the project.
  // Without the check the endpoint is an open write, small but pointless to leave open.
  if (secret) {
    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const beat = await prisma.heartbeat.upsert({
      where: { id: 1 },
      create: { id: 1, count: 1 },
      update: { count: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      beatAt: beat.beatAt.toISOString(),
      count: beat.count,
    });
  } catch (error) {
    console.error('[cron/heartbeat] failed', error);
    return NextResponse.json({ ok: false, error: 'heartbeat failed' }, { status: 500 });
  }
}
