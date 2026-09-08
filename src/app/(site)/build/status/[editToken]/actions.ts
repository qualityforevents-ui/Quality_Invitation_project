'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getByEditToken, updateInvitation } from '@/lib/invitations';
import { setEditToken } from '@/lib/session';

/**
 * Takes a request back out of the operator's queue and returns it to being a draft.
 *
 * Cancelling is not deleting. Everything the customer built stays exactly where it is;
 * what changes is that the invitation stops claiming to be waiting for payment, so the
 * operator is not chasing a customer who has changed their mind, and the customer can
 * edit and send it again. It is the same reasoning as "start over" abandoning rather
 * than deleting a draft, one status further along.
 *
 * Only from AWAITING_CONFIRMATION or REJECTED. An ACTIVE invitation has been paid for
 * and its link may already be in three hundred WhatsApp threads; taking that down is a
 * conversation with a human, not a button.
 *
 * Authorisation is knowing the editToken, which is the same thing that authorises
 * reading this page at all — there are no accounts in this product. The token is put
 * back in the cookie so the device that cancelled lands in its own draft rather than an
 * empty form, which matters because this page is often opened from a WhatsApp message
 * on a phone that never held the cookie.
 */
export async function cancelRequest(editToken: string): Promise<void> {
  const invitation = await getByEditToken(editToken);
  if (!invitation) return;

  if (invitation.status !== 'AWAITING_CONFIRMATION' && invitation.status !== 'REJECTED') {
    return;
  }

  await updateInvitation(invitation.id, { status: 'DRAFT', rejectReason: null });
  await setEditToken(editToken);

  // The operator's pending list and stale alert are both built from this status.
  revalidatePath('/admin');

  redirect('/');
}
