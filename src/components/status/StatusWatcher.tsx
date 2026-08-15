'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const POLL_MS = 20000;

/**
 * Flips the waiting screen over to the success screen on its own once the operator
 * activates the invitation.
 *
 * Somebody who has just paid tends to sit on this page. Making them reload to find out
 * whether anything happened is a small cruelty, and every reload is a full render on
 * the server, so a light poll is cheaper as well as kinder. It stops once there is
 * nothing left to wait for.
 */
export function StatusWatcher({
  editToken,
  currentStatus,
}: {
  editToken: string;
  currentStatus: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (currentStatus === 'ACTIVE' || currentStatus === 'EXPIRED') return;

    const timer = window.setInterval(async () => {
      // Nothing polls while the page is in a background tab.
      if (document.visibilityState !== 'visible') return;

      try {
        const response = await fetch(`/api/status/${editToken}`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as { ok: boolean; status?: string };
        if (data.ok && data.status && data.status !== currentStatus) {
          router.refresh();
        }
      } catch {
        // Offline, or the tab is being closed. The next tick tries again.
      }
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, [editToken, currentStatus, router]);

  return null;
}
