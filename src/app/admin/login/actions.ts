'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionCookie,
  isAuthConfigured,
  signInWithPassword,
} from '@/lib/firebase/auth';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

export type LoginState = { error: string | null };

async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
}

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return { error: 'Firebase غير مضبوط. راجع SETUP.md خطوة 1.' };
  }

  pruneRateLimits();

  const { allowed, retryAfterSeconds } = checkRateLimit(
    `login:${await clientKey()}`,
    MAX_ATTEMPTS,
    WINDOW_MS,
  );

  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return { error: `محاولات كتير. استنى ${minutes} دقيقة وجرب تاني.` };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'اكتب الإيميل والباسورد.' };
  }

  const result = await signInWithPassword(email, password);

  if (!result.ok) {
    /*
     * Firebase's own throttling, which is separate from the rate limit above and
     * happens per account rather than per address. Worth naming: the password is right
     * and it still will not let you in, which is otherwise indistinguishable from a
     * wrong password and sends you looking at the password for a long time.
     */
    if (result.reason === 'too-many-attempts') {
      return { error: 'Firebase وقف الحساب مؤقتًا بعد محاولات كتير. استنى شوية وجرب تاني.' };
    }

    /*
     * The account exists but has been disabled in the Firebase console, which is a
     * different thing from a wrong password and has a different fix. Safe to name:
     * exactly one account can ever exist here, so there is no account to enumerate.
     */
    if (result.reason === 'disabled') {
      return { error: 'الحساب موقوف من Firebase. افتح Authentication، Users، وفعّله تاني.' };
    }

    // Anything else stays generic, and does not say which of the two was wrong.
    return { error: 'بيانات الدخول غلط.' };
  }

  const session = await createSessionCookie(result.idToken);
  const store = await cookies();

  store.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}
