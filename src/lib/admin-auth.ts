import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/config';

export type Operator = { id: string; email: string | null };

/**
 * The signed in operator, or null.
 *
 * Uses getUser rather than getSession. getSession reads the cookie and believes it;
 * getUser sends the token to Supabase to be verified. A cookie is something the
 * browser hands over, so on a surface that can activate invitations and read customer
 * phone numbers, it gets verified.
 */
export async function getOperator(): Promise<Operator | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Guards an admin page or action. Every admin route calls this on the server. The
 * middleware refreshes the session but is not the check: middleware can be bypassed by
 * routing quirks, so authorisation lives next to the thing being protected.
 */
export async function requireOperator(): Promise<Operator> {
  const operator = await getOperator();
  if (!operator) redirect('/admin/login');
  return operator;
}

/** For server actions, where redirecting is the wrong shape of failure. */
export async function assertOperator(): Promise<Operator> {
  const operator = await getOperator();
  if (!operator) throw new Error('Not authorised');
  return operator;
}
