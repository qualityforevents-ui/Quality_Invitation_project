'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export type SaveResult = {
  ok: boolean;
  created?: boolean;
  requestId?: string;
  slug?: string;
  status?: string;
  ready?: boolean;
};

const ENDPOINT = '/api/invitation';

function post(body: string, keepalive = false): Promise<Response> {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive,
  });
}

/**
 * Debounced autosave for the builder.
 *
 * The whole patch is sent rather than a diff. It is a handful of short strings, and
 * there is exactly one person editing exactly one invitation on one device, so the
 * complexity a diff would buy has nothing to buy it with.
 *
 * The caller is responsible for leaving invalid optional fields out of the patch. A
 * half typed Google Maps link fails validation on the server, and if it were included
 * it would take every other field on the form down with it.
 *
 * Anything still waiting on the debounce is flushed rather than dropped. Without that,
 * a change made in the last fraction of a second before the customer taps through to
 * the next step is silently lost: the component unmounts, the pending timer is cleared,
 * and the request is never made. That is barely noticeable on a text field, because the
 * next keystroke saves it anyway, and it quietly destroys a photo upload, which happens
 * once and is immediately followed by tapping onward.
 */
export function useAutosave(
  patch: Record<string, unknown>,
  options: { enabled?: boolean; delay?: number; onSaved?: (result: SaveResult) => void } = {},
): { status: SaveStatus; flush: () => Promise<void> } {
  const { enabled = true, delay = 700, onSaved } = options;

  const [status, setStatus] = useState<SaveStatus>('idle');

  // Held in refs so that changing them does not itself schedule a save.
  const lastSent = useRef<string>('');
  /** Set when a change is waiting on the debounce, cleared once it lands. */
  const outstanding = useRef<string | null>(null);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const serialised = JSON.stringify(patch);

  const send = useCallback(async (body: string) => {
    setStatus('saving');
    try {
      const response = await post(body);
      if (!response.ok) throw new Error(`Save failed with ${response.status}`);

      const result = (await response.json()) as SaveResult;

      lastSent.current = body;
      outstanding.current = null;
      setStatus('saved');
      onSavedRef.current?.(result);
    } catch (error) {
      console.error('[autosave]', error);
      // Deliberately leaves lastSent alone, so the next change retries this content
      // rather than treating it as already stored.
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // The first render carries the values the server already has. Saving them straight
    // back would be a pointless write on every page load.
    if (lastSent.current === '') {
      lastSent.current = serialised;
      return;
    }

    if (serialised === lastSent.current) return;

    outstanding.current = serialised;
    setStatus('pending');

    const timer = window.setTimeout(() => void send(serialised), delay);
    return () => window.clearTimeout(timer);
  }, [serialised, enabled, delay, send]);

  /**
   * Last chance for anything still on the debounce. keepalive lets the request outlive
   * the component, which is the whole point: by the time this runs the customer is
   * already on their way somewhere else.
   *
   * Unmount alone used to be enough, because moving between builder steps unmounted the
   * form. The flow is one page now and nothing unmounts until the tab is gone, so the
   * unmount handler stopped covering the case it was written for. `pagehide` and a
   * `visibilitychange` to hidden are what actually fire when somebody switches to
   * Google Maps to copy a venue link, or to their banking app to make the transfer, and
   * on iOS that tab is often discarded rather than resumed. Without these, the last
   * thing typed before leaving is lost, which is precisely the moment it matters most.
   *
   * `pagehide` rather than `beforeunload`: Safari on iOS frequently never fires
   * `beforeunload` at all, and registering one disqualifies the page from the back
   * forward cache.
   */
  useEffect(() => {
    const saveOutstanding = () => {
      if (!outstanding.current) return;
      void post(outstanding.current, true).catch(() => {});
      // Cleared so a hide, a return, and a second hide with nothing typed in between
      // does not send the same body twice.
      outstanding.current = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveOutstanding();
    };

    window.addEventListener('pagehide', saveOutstanding);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', saveOutstanding);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      saveOutstanding();
    };
  }, []);

  /** Awaitable flush, for a caller that wants the save confirmed before moving on. */
  const flush = useCallback(async () => {
    if (outstanding.current) await send(outstanding.current);
  }, [send]);

  return { status, flush };
}
