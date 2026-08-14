import { cookies, headers } from 'next/headers';
import { COOKIE_MAX_AGE_SECONDS, EDIT_TOKEN_COOKIE, UI_LANG_COOKIE } from './constants';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Whether this request actually arrived over HTTPS.
 *
 * Deliberately not `NODE_ENV === 'production'`. A cookie marked Secure is silently
 * discarded by the browser when the page was served over plain HTTP, and a production
 * build served to a phone over the local network is exactly that case: the cookie is
 * thrown away, every keystroke creates a fresh draft because none of them carry a
 * token, and pressing continue lands on an empty form. It looks like the form is
 * resetting itself, and it is nearly impossible to diagnose from the outside because
 * desktop works fine. Browsers exempt localhost from the Secure rule, so testing on
 * the same machine never reproduces it.
 *
 * Vercel always sets x-forwarded-proto, so real deployments still get Secure cookies.
 */
async function isSecureRequest(): Promise<boolean> {
  const proto = (await headers()).get('x-forwarded-proto');
  return proto ? proto.split(',')[0].trim() === 'https' : false;
}

/**
 * There are no customer accounts in this product. A cookie holding the editToken is
 * the entire mechanism by which someone comes back tomorrow and finds their draft
 * where they left it.
 *
 * It is httpOnly, so only the server reads it. Client code never needs the token:
 * every request that acts on an invitation is authorised from this cookie server side.
 */
export async function getEditToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(EDIT_TOKEN_COOKIE)?.value ?? null;
}

/** Only callable from a route handler or a server action. */
export async function setEditToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(EDIT_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearEditToken(): Promise<void> {
  const store = await cookies();
  store.delete(EDIT_TOKEN_COOKIE);
}

/**
 * The builder language. Readable by the client, because an inline script uses it to
 * set the document direction before first paint.
 */
export async function getUiLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(UI_LANG_COOKIE)?.value === 'EN' ? 'EN' : 'AR';
}

export async function setUiLang(lang: Lang): Promise<void> {
  const store = await cookies();
  store.set(UI_LANG_COOKIE, lang, {
    httpOnly: false,
    secure: await isSecureRequest(),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}
