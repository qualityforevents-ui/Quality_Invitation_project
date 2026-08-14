import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
