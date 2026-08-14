import { NextResponse } from 'next/server';
import { getByEditToken } from '@/lib/invitations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Polled by the waiting screen so it flips to active on its own once the operator
 * approves, without the customer sitting there reloading.
 *
 * Deliberately thin. It returns the status and nothing that is not already on the page
 * the caller is looking at.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ editToken: string }> }) {
  const { editToken } = await params;

  const invitation = await getByEditToken(editToken);

  if (!invitation) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    status: invitation.status,
    slug: invitation.slug,
    rejectReason: invitation.status === 'REJECTED' ? invitation.rejectReason : null,
  });
}
