'use client';

import { useEffect } from 'react';
import { metaTrack } from '@/lib/meta/pixel';

/**
 * Reports that somebody looked at the booth page.
 *
 * `ViewContent` rather than a custom name, because it is one of Meta's standard events
 * and can therefore be optimised toward and given a value. A visitor who reaches this
 * page has chosen a service, which is the first real signal in the funnel and the one
 * worth building an audience from.
 *
 * Once per visit, guarded by sessionStorage rather than by a ref. A ref resets whenever
 * the component remounts, and this page remounts on every language toggle and on the
 * router refresh a booking triggers; each of those would fire a second ViewContent and
 * inflate the top of the funnel against a bottom that had not moved. sessionStorage
 * survives all of it and is forgotten when the tab closes, which is the definition of
 * a visit that this needs.
 */
export function BoothViewedBeacon({ packageId }: { packageId: string }) {
  useEffect(() => {
    const key = 'qlty:booth-viewed';

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Private mode, or storage blocked. Report it anyway: a duplicate view is a much
      // smaller problem than a funnel with nothing at the top of it.
    }

    metaTrack('ViewContent', {
      content_category: 'photobooth',
      content_name: packageId,
    });
  }, [packageId]);

  return null;
}
