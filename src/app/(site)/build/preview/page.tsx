import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/builder/BuildNav';
import { PreviewBar, TryingThemeBar } from '@/components/builder/PreviewBar';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import { getDictionary } from '@/i18n/ui';
import { loadDraft } from '@/lib/draft';
import { toInvitationView } from '@/lib/invitation-view';
import { getUiLang } from '@/lib/session';
import { isReadyForPreview } from '@/lib/validation';
import { isValidThemeId } from '@/themes/registry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The full invitation, not a thumbnail and not a mockup.
 *
 * The customer sees the whole thing, including the open animation and the music,
 * before being asked for anything. This is the screen the paywall sits behind rather
 * than in front of.
 *
 * It sits outside the builder's step layout, so there is no header, no max width
 * column and nothing framing it. What is on screen is what a guest gets.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const { invitation } = await loadDraft();

  if (!invitation) redirect('/build');
  if (!isReadyForPreview(invitation)) redirect('/build');

  /*
   * `?theme=` renders a different design without storing it.
   *
   * This is the try before you choose path from the theme cards: the customer sees
   * their own names and date in a design they have not committed to, and nothing is
   * written, so backing out leaves their actual choice untouched.
   */
  const { theme: requestedTheme } = await searchParams;
  const trying = requestedTheme && isValidThemeId(requestedTheme) ? requestedTheme : null;

  const view = toInvitationView(invitation);
  const previewView = trying ? { ...view, themeId: trying } : view;

  return (
    <>
      {/* Lifts the invitation's mute toggle above the bar sitting along the bottom. */}
      <div style={{ '--inv-toggle-offset': '5.5rem' } as CSSProperties}>
        <InvitationShell view={previewView} />
      </div>

      {/*
        The way back, in the corner, matching every other step.

        This screen is meant to show exactly what a guest receives, so the control is
        deliberately quiet: it floats over the card rather than pushing it down, and it
        is translucent so the design underneath stays the thing being looked at. The
        bottom bar already carries the decisions; this is only the escape.
      */}
      <div className="fixed top-4 start-4 z-50">
        <BackButton href="/build/theme" label={t.common.back} />
      </div>

      {/* Trying a design out is a different situation from previewing the finished
          invitation, so it gets its own bar: one way back, and no way to pay for
          something the customer has not actually selected. */}
      {trying ? (
        <TryingThemeBar note={t.theme.themePreviewNote} backLabel={t.theme.themePreviewBack} />
      ) : (
        <PreviewBar backLabel={t.preview.backToEdit} continueLabel={t.preview.getLink} />
      )}
    </>
  );
}
