import { NextResponse } from 'next/server';
import { getByEditToken, markAwaitingConfirmation } from '@/lib/invitations';
import { getEditToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Called the instant the customer taps through to WhatsApp, before the link opens.
 *
 * Marking the row here rather than when the message actually arrives is deliberate.
 * Somebody who taps the button and then never sends the screenshot is a customer who
 * meant to pay, and the operator can only chase them if the request is on the pending
 * list. That is the list the admin's stale alert reads.
 *
 * The client sends this with keepalive set, so it completes even though the tab is
 * navigating away as it fires.
 */
export async function POST() {
  const token = await getEditToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'No draft on this device' }, { status: 401 });
  }

  try {
    const invitation = await getByEditToken(token);
    if (!invitation) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    const updated = await markAwaitingConfirmation(invitation);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    console.error('[api/invitation/confirm] failed', error);
    return NextResponse.json({ ok: false, error: 'Could not update' }, { status: 500 });
  }
}
