import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';

/**
 * Two jobs. This file is the Next 16 "proxy" convention, which replaced "middleware".
 *
 * One, admin.qlty.events and qlty.events are one deployment. Requests arriving on the
 * admin subdomain are rewritten onto the /admin route tree, so the operator surface
 * has its own hostname without a second project to deploy and keep in step.
 *
 * Two, Supabase access tokens expire. Refreshing them here means every admin server
 * component reads a current session rather than being handed an expired one and
 * bouncing the operator to the login screen mid task.
 *
 * This is not the authorisation check. That lives in requireOperator, next to the
 * pages and actions it protects.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const hostname = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];
  const isAdminHost = hostname.startsWith('admin.');

  // On the admin subdomain, "/" means the admin home rather than the landing page.
  if (isAdminHost && !url.pathname.startsWith('/admin')) {
    url.pathname = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
  }

  const isRewrite = url.pathname !== request.nextUrl.pathname;
  const buildResponse = () =>
    isRewrite ? NextResponse.rewrite(url, { request }) : NextResponse.next({ request });

  let response = buildResponse();

  const isAdminRoute = url.pathname.startsWith('/admin');
  const canRefresh = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

  if (!isAdminRoute || !canRefresh) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // Rebuilt so the refreshed cookies ride along, and rebuilt the same shape so a
        // subdomain rewrite is not quietly dropped when tokens rotate.
        response = buildResponse();
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next's own assets and static files. The invitation pages are
     * served from the cache and there is no reason to wake a function for them.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|music/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|mp3|woff2?)$).*)',
  ],
};
