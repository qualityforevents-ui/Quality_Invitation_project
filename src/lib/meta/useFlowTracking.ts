'use client';

import { useCallback, useEffect, useRef } from 'react';
import { metaTrack, priced } from './pixel';
import {
  SECTION_ORDER,
  isSectionActive,
  progressPercent,
  sectionIndex,
  type SectionId,
} from '@/lib/flow/sections';
import { packagePrice } from '@/lib/packages';
import type { Lang, Package } from '@/lib/types';

/**
 * Reports the builder's progress to Meta, one event per question reached.
 *
 * All of it lives here rather than being sprinkled through InvitationFlow, for two
 * reasons. The flow component is already the largest thing in the app and adding
 * fifteen tracking calls to it would bury the product logic. More importantly, the
 * flow's state moves through a reducer, and a reducer must stay pure — firing a network
 * call from inside one breaks under React's double invocation in development and again
 * under concurrent rendering in production. Watching the resulting state from an effect
 * is the only correct place to do this.
 */

/** Which question, out of how many, in a flow whose length depends on the answers. */
function stepShape(id: SectionId, packageId: Package, invitationLang: Lang) {
  const applicable = SECTION_ORDER.filter((section) =>
    isSectionActive(section, packageId, invitationLang),
  );

  return {
    step_name: id,
    // One based, because this number is read by a human in Events Manager comparing it
    // against a flow whose first question is question one.
    step_index: applicable.indexOf(id) + 1,
    step_total: applicable.length,
    progress_percent: progressPercent(id, packageId, invitationLang),
  };
}

const STORAGE_PREFIX = 'qlty:meta:';

/**
 * Whether this is the first time the visit has reported a given thing.
 *
 * Backed by sessionStorage rather than by a ref, and that is not a detail — a ref was
 * the obvious choice and it is wrong here. The builder remounts during a normal
 * purchase: the first save creates the draft row, which calls `router.refresh()` so the
 * payment panel can learn the request id, and the tree comes back with every ref reset.
 * A ref-guarded `StartFlow` therefore fired twice for every customer who actually got
 * far enough to matter, and the doubling was invisible from the inside because both
 * copies were perfectly valid events. A reload mid-flow did the same thing.
 *
 * sessionStorage survives both, and expires when the tab closes, which is exactly the
 * meaning wanted: once per visit. A customer who comes back tomorrow is a new visit and
 * should count again.
 *
 * Private browsing can make this throw. Firing in that case is the right way to be
 * wrong — an occasional duplicate is a smaller error than silently reporting no
 * conversions at all for a whole class of visitor.
 */
function firstTimeThisSession(key: string): boolean {
  try {
    const full = `${STORAGE_PREFIX}${key}`;
    if (sessionStorage.getItem(full)) return false;
    sessionStorage.setItem(full, '1');
    return true;
  } catch {
    return true;
  }
}

export function useFlowTracking({
  started,
  furthest,
  packageId,
  invitationLang,
  hasDraft,
}: {
  started: boolean;
  furthest: SectionId | null;
  packageId: Package;
  invitationLang: Lang;
  /** True when the page opened onto a draft that already existed. */
  hasDraft: boolean;
}): void {
  /*
   * A second guard, inside the mount, in front of the sessionStorage one.
   *
   * React runs every effect twice on mount in development's strict mode, and both runs
   * happen before the browser gets a chance to persist anything in between. The ref
   * catches that pair; sessionStorage catches everything across mounts. Neither alone
   * is enough.
   */
  const firedHere = useRef(new Set<string>());

  const once = useCallback((key: string, fire: () => void) => {
    if (firedHere.current.has(key)) return;
    firedHere.current.add(key);
    if (!firstTimeThisSession(key)) return;
    fire();
  }, []);

  /* ------------------------------------------------- returning with a draft */

  useEffect(() => {
    if (!hasDraft) return;

    // Worth its own event. Somebody who came back to an unfinished invitation is the
    // most qualified audience this product has — they have already done the work — and
    // they are the group a "finish your invitation" retargeting campaign exists for.
    once('resumed', () => metaTrack('FlowResumed', { content_category: 'invitation' }));
  }, [hasDraft, once]);

  /* --------------------------------------------------------- start and steps */

  useEffect(() => {
    if (!started || !furthest) return;

    const shape = stepShape(furthest, packageId, invitationLang);

    once('start', () =>
      // The same total FlowStep reports, not SECTION_ORDER.length. The raw array counts
      // questions this customer will never be asked — the design brief on a tier they
      // have not chosen, the verse on a card they may set to English — and two events in
      // the same funnel disagreeing about how long the flow is makes the step numbers in
      // Events Manager unreadable.
      metaTrack('StartFlow', {
        content_category: 'invitation',
        step_total: shape.step_total,
      }),
    );

    once(`step:${furthest}`, () =>
      metaTrack('FlowStep', { content_category: 'invitation', ...shape }),
    );

    /*
     * Reaching the payment panel is the checkout, and it is the last thing that happens
     * on this site before the conversation moves to WhatsApp. It carries a value, so
     * Meta can report a cost per checkout against real money rather than a count.
     *
     * Not fired when somebody merely reopens the panel, because a customer who goes back
     * to fix a venue name and walks forward again has not started a second checkout.
     */
    if (furthest === 'payment') {
      once('checkout', () =>
        metaTrack(
          'InitiateCheckout',
          priced(packagePrice(packageId), 'invitation', {
            content_type: 'product',
            content_ids: [packageId],
            num_items: 1,
          }),
        ),
      );
    }
  }, [started, furthest, packageId, invitationLang, once]);

  /* ---------------------------------------------------------- the phone number */

  useEffect(() => {
    if (!furthest) return;

    /*
     * A lead in the ordinary sense: past the phone question means a valid Egyptian
     * number was given, so this is a person the operator can actually reach. Keyed off
     * position in the flow rather than off the field being non-empty, because the field
     * holds half-typed numbers for as long as somebody is typing one, and reporting a
     * lead on "010" would report one on nearly every visitor who got that far.
     */
    if (sectionIndex(furthest) <= sectionIndex('phone')) return;

    once('lead', () =>
      metaTrack(
        'Lead',
        priced(packagePrice(packageId), 'invitation', { content_ids: [packageId] }),
      ),
    );
  }, [furthest, packageId, once]);

  /* ------------------------------------------------------- choosing the tier */

  useEffect(() => {
    if (!furthest) return;

    // Only once the tier has actually been chosen. Every draft is born holding BASIC as
    // a default, so reporting the value before the question is answered would add a
    // basket to the account for everybody who opened the page.
    if (sectionIndex(furthest) < sectionIndex('package')) return;

    // Keyed by the tier, so changing your mind from Basic to Forever is reported as the
    // new basket it is, while re-rendering fifty times on the same tier is not.
    once(`cart:${packageId}`, () =>
      metaTrack(
        'AddToCart',
        priced(packagePrice(packageId), 'invitation', {
          content_type: 'product',
          content_ids: [packageId],
          content_name: packageId,
          num_items: 1,
        }),
      ),
    );
  }, [furthest, packageId, once]);
}
