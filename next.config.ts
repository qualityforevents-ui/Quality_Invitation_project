import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /*
   * firebase-admin must be required from node_modules, not bundled.
   *
   * It pulls in jwks-rsa, which `require()`s `jose`, and jose is ESM only. Bundled, the
   * result is ERR_REQUIRE_ESM at runtime and every admin page returns a 500. This does
   * not reproduce with `next start` locally — only on the deployed build — so it is the
   * kind of thing that is found in production or not at all.
   */
  serverExternalPackages: ['firebase-admin'],

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'ik.imagekit.io' }],
  },

  /*
   * The Open Graph renderer reads its font files from disk at runtime. Nothing imports
   * them, so the build has no way to know they are needed and would leave them behind.
   */
  outputFileTracingIncludes: {
    '/[slug]/opengraph-image': ['./src/assets/fonts/**'],
    '/sample/opengraph-image': ['./src/assets/fonts/**'],
  },
  /**
   * The four builder steps became one page at "/".
   *
   * Redirected rather than deleted, because those paths are in WhatsApp threads, in
   * bookmarks and possibly in an ad, and a 404 is a lost customer. Next carries the
   * query string over on its own, so /build?package=UNLIMITED still arrives with the
   * tier the visitor picked and the flow still honours it.
   *
   * Listed one by one rather than as /build/:path*, which would swallow
   * /build/status/:editToken. That route survives untouched: it is where every paying
   * customer lands, it is printed in the message the operator sends on activation, and
   * moving it would break five call sites for no gain.
   */
  async redirects() {
    return ['/build', '/build/theme', '/build/preview', '/build/payment'].map((source) => ({
      source,
      destination: '/',
      permanent: false,
    }));
  },

  async headers() {
    // The edit link and the admin surface must never be indexed. A customer who
    // shares their edit link publicly is already a problem, a search engine
    // republishing it is a worse one.
    const noindex = {
      key: 'X-Robots-Tag',
      value: 'noindex, nofollow, noarchive, nosnippet',
    };
    return [
      { source: '/edit/:path*', headers: [noindex] },
      { source: '/admin/:path*', headers: [noindex] },
      { source: '/build/:path*', headers: [noindex] },
    ];
  },
};

export default nextConfig;
