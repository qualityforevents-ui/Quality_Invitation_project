import { NextResponse, type NextRequest } from 'next/server';

/**
 * One job now. This file is the Next 16 "proxy" convention, which replaced "middleware".
 *
 * admin.qlty.events and qlty.events are one deployment. Requests arriving on the admin
 * subdomain are rewritten onto the /admin route tree, so the operator surface has its
 * own hostname without a second project to deploy and keep in step.
 *
 * It used to have a second job: Supabase access tokens expired quickly, so every admin
 * request refreshed the session here and rebuilt the response so the rotated cookies
 * rode along without dropping the subdomain rewrite. Firebase session cookies are
 * verified rather than refreshed and last two weeks, so all of that is gone.
 *
 * This is not the authorisation check. That lives in requireOperator, next to the
 * pages and actions it protects.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const hostname = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];
  const isAdminHost = hostname.startsWith('admin.');

  // On the admin subdomain, "/" means the admin home rather than the landing page.
  if (isAdminHost && !url.pathname.startsWith('/admin')) {
    url.pathname = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
    return NextResponse.rewrite(url, { request });
  }

  return NextResponse.next({ request });
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
