'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FLOW_STEP_COOKIE } from '@/lib/constants';
import { clearEditToken } from '@/lib/session';

/**
 * Abandons the draft on this device and starts a fresh one.
 *
 * It forgets rather than deletes. The draft row stays exactly where it is, because an
 * abandoned draft is the operator's record of somebody who nearly bought something,
 * and the admin's drafts list exists to surface those. Deleting it here would throw
 * away the one thing that makes a half-finished invitation worth anything to the
 * business, in exchange for tidiness nobody can see.
 *
 * Both cookies have to go. The editToken is the entire mechanism by which a device
 * finds its draft again, and the step cookie is written by the client and never
 * cleared by it, so leaving it behind would drop the customer into the middle of a
 * flow whose answers no longer exist.
 *
 * The consequence is real and the confirmation says so: there are no accounts in this
 * product, so once the cookie is gone this device cannot reach that invitation again.
 */
export async function startOver(): Promise<void> {
  await clearEditToken();

  const store = await cookies();
  store.delete(FLOW_STEP_COOKIE);

  redirect('/');
}
