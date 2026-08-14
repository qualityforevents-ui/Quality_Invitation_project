'use client';

import { useEffect } from 'react';

/**
 * Counts one view per browsing session.
 *
 * Deliberately a client side beacon rather than an increment during render. Writing to
 * the database while rendering would make the page dynamic, and the whole point of
 * these pages is that they are generated once and served from the cache without a
 * function ever waking up.
 *
 * Deduplicated through sessionStorage, so a guest who reopens the link four times
 * while deciding what to wear counts once. It is a rough number by design.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `qlty_seen_${slug}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Private browsing can refuse storage. Counting twice is better than throwing.
    }

    const body = JSON.stringify({ slug });

    // sendBeacon survives the page being closed straight after opening, which is a
    // real pattern here: guests glance at the card and swipe away.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/view', new Blob([body], { type: 'application/json' }));
      return;
    }

    void fetch('/api/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
