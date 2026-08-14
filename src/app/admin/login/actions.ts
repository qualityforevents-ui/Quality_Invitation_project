'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
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
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase غير مضبوط. راجع SETUP.md خطوة 1.' };
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Always logged in full. There is one operator and one account, so a failure here
    // is a setup problem to be diagnosed rather than an attack to be starved of
    // information, and the generic message below is otherwise impossible to debug.
    console.error('[admin/login] sign in failed:', error.code, error.message);

    /*
     * An unconfirmed address is by far the most common cause, because Supabase's Add
     * User dialog leaves "Auto Confirm User" unticked by default: the account exists,
     * the password is right, and sign in still fails. Reporting that as bad credentials
     * sends you looking at the password for a long time. It is safe to name, because
     * public signup is disabled and exactly one account can ever exist, so there is no
     * account to enumerate.
     */
    const unconfirmed =
      error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message);

    if (unconfirmed) {
      return {
        error:
          'الحساب موجود بس الإيميل لسه مش مأكد. افتح Supabase، Authentication، Users، واعمل تأكيد للإيميل.',
      };
    }

    /*
     * The Email provider itself is switched off, which is a different setting from the
     * signup toggle sitting next to it. Turning off the provider disables sign in for
     * the operator too, and the symptom is indistinguishable from a wrong password
     * unless it is named. Worth its own message because the fix is one checkbox in a
     * panel people usually visit to disable something else.
     */
    if (error.code === 'email_provider_disabled' || /logins are disabled/i.test(error.message)) {
      return {
        error:
          'الدخول بالإيميل مقفول من Supabase. افتح Authentication، Sign In / Providers، Email، وشغّل Enable Email provider، وسيب Allow new users to sign up مقفول.',
      };
    }

    // Anything else stays generic, and does not say which of the two was wrong.
    return { error: 'بيانات الدخول غلط.' };
  }

  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
