'use client';

import { SupportButton } from '@/components/SupportButton';
import { metaTrack } from '@/lib/meta/pixel';
import type { ContentCategory } from '@/lib/meta/events';

/**
 * The floating WhatsApp bubble, reporting that it was used.
 *
 * A thin client wrapper rather than a change to SupportButton, which stays a server
 * component and stays renderable from anywhere. The two surfaces that must never carry
 * a support bubble at all, the guest invitation and the preview, therefore never pull
 * `metaTrack` into their bundle either.
 *
 * The click handler does not block the link and cannot cancel it. `metaTrack` mirrors
 * its event with `keepalive`, which is what lets the report survive the navigation to
 * WhatsApp that is happening in the same instant; wrapping this in a preventDefault and
 * a manual redirect would be slower, would break the middle click, and would make a
 * failed fetch into a failed navigation. A dropped Contact event is worth less than a
 * customer who tapped support and went nowhere.
 */
export function TrackedSupportButton({
  message,
  label,
  raised = false,
  page,
  contentCategory,
}: {
  message: string;
  label: string;
  raised?: boolean;
  /** Which screen the bubble was tapped on, for splitting support load by surface. */
  page: string;
  contentCategory: ContentCategory;
}) {
  return (
    <span
      onClick={() => {
        metaTrack('Contact', { content_category: contentCategory, page });
      }}
    >
      <SupportButton message={message} label={label} raised={raised} />
    </span>
  );
}
