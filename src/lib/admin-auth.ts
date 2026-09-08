import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, isAuthConfigured, verifySessionCookie } from './firebase/auth';

export type Operator = { id: string; email: string | null };

/**
 * The signed in operator, or null.
 *
 * The cookie is verified against Firebase on every call rather than merely decoded,
 * and the check includes whether the account has been revoked since. A cookie is
 * something the browser hands over, so on a surface that can activate invitations and
 * read customer phone numbers, it gets verified.
 */
export async function getOperator(): Promise<Operator | null> {
  if (!isAuthConfigured()) return null;

  const store = await cookies();
  const cookie = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookie) return null;

  return verifySessionCookie(cookie);
}

/**
 * Guards an admin page or action. Every admin route calls this on the server.
 *
 * Authorisation lives next to the thing being protected rather than in the proxy,
 * because a proxy can be bypassed by routing quirks. That was true when the proxy also
 * refreshed Supabase tokens, and it is still true now that the proxy does nothing but
 * rewrite the admin subdomain.
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
