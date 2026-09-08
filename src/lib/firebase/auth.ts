import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from '../db';

/**
 * Sign in for the one operator account.
 *
 * Firebase's own sign-in normally happens in the browser with the client SDK, which
 * would mean shipping a second SDK, holding an ID token in the page, and posting it
 * back to a route to be exchanged for a cookie. None of that is needed here: there is
 * one operator and one form, so the password is checked server-side against the
 * Identity Toolkit REST endpoint and exchanged for a session cookie in the same
 * action. The password never reaches the browser's JavaScript, and no client SDK ships.
 *
 * Session cookies last up to two weeks and are verified on every request, so nothing
 * has to refresh them. That is what let the proxy drop its token-refresh half.
 */

const SIGN_IN_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

/** Two weeks, the maximum Firebase allows for a session cookie. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export const ADMIN_SESSION_COOKIE = 'qlty_admin';

export const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY ?? '';

/**
 * Whether the admin can work at all.
 *
 * The admin is the only thing that needs Firebase Auth, and it is set up after the
 * customer side already works. Until the key is filled in, the login page says so
 * plainly instead of throwing, and nothing on the customer side is affected.
 */
export function isAuthConfigured(): boolean {
  return WEB_API_KEY.length > 0;
}

export type SignInFailure =
  | 'bad-credentials'
  | 'not-configured'
  | 'disabled'
  | 'too-many-attempts'
  | 'unknown';

export type SignInResult = { ok: true; idToken: string } | { ok: false; reason: SignInFailure };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  if (!isAuthConfigured()) return { ok: false, reason: 'not-configured' };

  const response = await fetch(`${SIGN_IN_URL}?key=${WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const body = (await response.json()) as {
    idToken?: string;
    error?: { message?: string };
  };

  if (response.ok && body.idToken) return { ok: true, idToken: body.idToken };

  // Always logged in full. There is one operator and one account, so a failure here is
  // a setup problem to be diagnosed rather than an attack to be starved of
  // information, and the generic message the caller shows is otherwise impossible to
  // debug.
  const code = body.error?.message ?? 'UNKNOWN';
  console.error('[admin/login] sign in failed:', code);

  if (code.startsWith('TOO_MANY_ATTEMPTS')) return { ok: false, reason: 'too-many-attempts' };
  if (code === 'USER_DISABLED') return { ok: false, reason: 'disabled' };
  if (
    code === 'EMAIL_NOT_FOUND' ||
    code === 'INVALID_PASSWORD' ||
    code === 'INVALID_LOGIN_CREDENTIALS'
  ) {
    return { ok: false, reason: 'bad-credentials' };
  }

  return { ok: false, reason: 'unknown' };
}

/** Exchanges a fresh ID token for the long-lived httpOnly cookie the admin runs on. */
export async function createSessionCookie(idToken: string): Promise<string> {
  return getAuth(firebaseApp()).createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

/**
 * Verifies the cookie the browser presented.
 *
 * `true` for the second argument checks the account has not been disabled or revoked
 * since the cookie was issued, which costs a lookup and is the right trade on a surface
 * that can activate invitations and read customer phone numbers. A cookie is something
 * the browser hands over; it gets verified rather than believed.
 */
export async function verifySessionCookie(
  cookie: string,
): Promise<{ id: string; email: string | null } | null> {
  if (!cookie) return null;

  try {
    const claims = await getAuth(firebaseApp()).verifySessionCookie(cookie, true);
    return { id: claims.uid, email: claims.email ?? null };
  } catch {
    // An expired or revoked cookie is a normal thing to be handed, not an error worth
    // logging on every request from a logged-out browser.
    return null;
  }
}
