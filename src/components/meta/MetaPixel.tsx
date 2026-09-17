'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { META_PIXEL_ID, isPixelConfigured, metaTrack } from '@/lib/meta/pixel';

/**
 * Loads the Meta pixel and keeps PageView honest across client side navigation.
 *
 * Meta's own snippet fires one PageView when it loads and never again. That is correct
 * for a site of separate documents and wrong for this one: the builder, the waiting
 * screen and the landing page are all the same document, so without this component a
 * customer who works through the entire flow and pays registers exactly one page view,
 * on whichever page they happened to land on.
 *
 * `usePathname` rather than `useSearchParams`, deliberately. Reading search params in a
 * component this high up opts the whole subtree into a Suspense boundary or, worse,
 * silently forces client side rendering of every page below it. The query string is
 * read off `window.location` inside the effect instead, where it costs nothing.
 */
export function MetaPixel() {
  const pathname = usePathname();

  /*
   * The first PageView belongs to the snippet, not to this effect.
   *
   * The snippet below ends with `fbq('track', 'PageView')`, which fires as soon as it
   * loads. If the effect also fired on mount, the first page of every session would be
   * counted twice — and not deduplicated, because the snippet's copy has no event id to
   * pair with.
   *
   * The guard is "has the path changed since the last one reported", with the ref seeded
   * during render rather than inside the effect. A `mounted` flag set on the first run
   * looks equivalent and is not: React invokes every effect twice on mount in strict
   * mode, so the first run sets the flag and the second run sees it already set and
   * fires — a duplicate PageView on the very first page, which is exactly what this was
   * written to prevent. Comparing paths is immune to being run any number of times.
   */
  const lastReported = useRef(pathname);

  useEffect(() => {
    if (!isPixelConfigured()) return;
    if (lastReported.current === pathname) return;

    lastReported.current = pathname;
    metaTrack('PageView', { page_path: pathname });
  }, [pathname]);

  // Nothing is injected at all when no pixel id is set, which is the state of every
  // local checkout. A pixel pointed at an empty id is a script tag that 404s on every
  // page load and quietly reports nothing.
  if (!isPixelConfigured()) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      // afterInteractive, not beforeInteractive. The pixel is not needed to render
      // anything and blocking the first paint of a page a customer reached from an ad
      // costs more conversions than a few hundred milliseconds of reporting delay
      // could ever recover.
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
        `.trim(),
      }}
    />
  );
}
