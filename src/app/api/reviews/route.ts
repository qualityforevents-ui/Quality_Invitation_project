import { NextResponse } from 'next/server';
import { createReview } from '@/lib/reviews';
import { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from '@/lib/constants';
import { getByEditToken } from '@/lib/invitations';
import { getEditToken } from '@/lib/session';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A customer writing a review.
 *
 * Nothing here reaches the public page. Everything lands as PENDING and waits for the
 * operator, which is what stops this endpoint from being a way to publish arbitrary text
 * on a site people are deciding whether to trust.
 *
 * If the writer holds an edit cookie, the invitation is recorded alongside the review.
 * That is the operator's evidence that a review came from somebody who actually bought
 * something, rather than from a form on the open internet.
 */
export async function POST(request: Request) {
  pruneRateLimits();

  const headerList = await headers();
  const key =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown';

  // Generous for a person, useless for a script.
  const { allowed } = checkRateLimit(`review:${key}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: 'too many' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'malformed' }, { status: 400 });
  }

  const input = body as { name?: unknown; city?: unknown; body?: unknown };

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const city = typeof input.city === 'string' ? input.city.trim() : '';
  const text = typeof input.body === 'string' ? input.body.trim() : '';

  if (name.length < 2 || name.length > REVIEW_MAX_NAME) {
    return NextResponse.json({ ok: false, error: 'name' }, { status: 400 });
  }
  if (text.length < 10 || text.length > REVIEW_MAX_BODY) {
    return NextResponse.json({ ok: false, error: 'body' }, { status: 400 });
  }

  const token = await getEditToken();
  const invitation = token ? await getByEditToken(token).catch(() => null) : null;

  try {
    await createReview({ name, city: city || null, body: text, invitationId: invitation?.id ?? null });
  } catch (error) {
    console.error('[api/reviews] could not save', error);
    return NextResponse.json({ ok: false, error: 'save' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
