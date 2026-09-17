import { NextResponse, type NextRequest } from 'next/server';

/**
 * Two jobs. This file is the Next 16 "proxy" convention, which replaced "middleware".
 *
 * admin.qlty.events and qlty.events are one deployment. Requests arriving on the admin
 * subdomain are rewritten onto the /admin route tree, so the operator surface has its
 * own hostname without a second project to deploy and keep in step.
 *
 * The second job is the one thing next.config's redirects cannot express: the builder
 * moved from "/" to "/invitations", but "/" is now the brand home and has to keep
 * serving it. Only the requests that were unmistakably meant for the builder can be
 * forwarded, and "?package=" is what makes them unmistakable. Every package link in
 * an ad or a WhatsApp thread carries one, and nothing else asks the root for a tier.
 *
 * It used to have one more: Supabase access tokens expired quickly, so every admin
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

  /*
   * An old package link, arriving at a root that no longer builds invitations.
   *
   * Temporary rather than permanent, and that is the whole point of the choice: a 308
   * is cached by the browser more or less forever, and these URLs are printed in ads
   * whose landing page may well change again. A 307 costs one extra request and can be
   * taken back.
   *
   * The query is carried over whole rather than rebuilt from the package alone. The
   * utm tags and Meta's fbclid ride in the same string, and dropping them here would
   * cost the attribution on exactly the visits that came from paid traffic.
   */
  if (!isAdminHost && url.pathname === '/' && url.searchParams.has('package')) {
    url.pathname = '/invitations';
    return NextResponse.redirect(url, { status: 307 });
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
