'use client';

import { useEffect, useRef } from 'react';
import { metaTrack } from '@/lib/meta/pixel';

/**
 * Reports that somebody opened the sample invitation.
 *
 * `ViewContent` rather than a custom name, because it is one of Meta's standard events
 * and can therefore back a custom conversion and an optimisation goal. This is the
 * warmest audience on the site short of the builder itself: opening the sample is
 * somebody asking to be shown the product.
 *
 * A component rather than two lines in the page, because the page is a server component
 * and this has to run in the browser to pair with the pixel's copy of the event.
 */
export function SampleViewedBeacon({ themeId }: { themeId: string }) {
  // Strict mode mounts every effect twice in development. Without this the sample would
  // report two views per visit locally, which is exactly the kind of doubling that gets
  // discovered months later in production numbers nobody trusts any more.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    metaTrack('ViewContent', {
      content_name: 'sample_invitation',
      content_type: 'product',
      content_ids: [themeId],
    });
  }, [themeId]);

  return null;
}
