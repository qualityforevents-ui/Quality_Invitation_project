import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidSlug } from '@/lib/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Increments an invitation's view count.
 *
 * Only counts invitations that are actually live, so a slug typed at random cannot
 * inflate anything, and the shape of the slug is checked before the database is
 * touched at all.
 *
 * Returns 204 in every case. The caller is a fire and forget beacon that ignores the
 * response, and a guest opening a wedding invitation should never be told anything
 * about whether their view was recorded.
 */
export async function POST(request: Request) {
  try {
    const { slug } = (await request.json()) as { slug?: unknown };

    if (typeof slug !== 'string' || !isValidSlug(slug)) {
      return new NextResponse(null, { status: 204 });
    }

    await prisma.invitation.updateMany({
      where: { slug, status: 'ACTIVE' },
      data: { viewCount: { increment: 1 } },
    });
  } catch (error) {
    console.error('[api/view] failed', error);
  }

  return new NextResponse(null, { status: 204 });
}
