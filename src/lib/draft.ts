import { getByEditToken } from './invitations';
import { getEditToken } from './session';
import type { Invitation } from '@/lib/types';

export type LoadedDraft = {
  invitation: Invitation | null;
  /** True when the database could not be reached, as opposed to there being no draft. */
  unavailable: boolean;
};

/**
 * Loads the draft belonging to this device, if there is one.
 *
 * A failure to reach the database is reported rather than thrown. Before Supabase is
 * provisioned the flow is still worth being able to open and look at on a phone, and
 * once it is provisioned a brief outage should leave the customer looking at a form
 * that cannot save rather than an error page that loses what they typed.
 */
export async function loadDraft(): Promise<LoadedDraft> {
  const token = await getEditToken();
  if (!token) return { invitation: null, unavailable: false };

  try {
    return { invitation: await getByEditToken(token), unavailable: false };
  } catch (error) {
    console.error('[draft] could not read the invitation for the current cookie', error);
    return { invitation: null, unavailable: true };
  }
}
