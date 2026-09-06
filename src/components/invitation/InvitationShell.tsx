import { InvitationExperience } from './InvitationExperience';
import { invitationFontVariables } from '@/lib/fonts';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { getTheme, themeStyle } from '@/themes/registry';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * Everything about how an invitation looks, set once on a single wrapper.
 *
 * Direction, language and the theme's colours and font pair are all applied here, on
 * the server, so the card is correct on first paint rather than corrected after
 * hydration. It also means the invitation renders in its own language regardless of
 * the language the surrounding page is in, which is what makes previewing an Arabic
 * card from an English builder work.
 */
export function InvitationShell({
  view,
  contained = false,
}: {
  view: InvitationView;
  /**
   * True when the card is rendered inside a box rather than filling the screen, which
   * is how the builder's preview shows it.
   *
   * Only the height changes. `min-h-dvh` on a card sitting in a popup would make it as
   * tall as the phone regardless of the popup, leaving a band of theme coloured nothing
   * under the footer. The toggle and the confetti inside need no equivalent: both are
   * `fixed`, and a transformed ancestor, which the popup is, becomes the containing
   * block for fixed descendants, so they scope themselves to the popup on their own.
   */
  contained?: boolean;
}) {
  const theme = getTheme(view.themeId);

  return (
    <div
      lang={htmlLangFor(view.lang)}
      dir={dirFor(view.lang)}
      style={themeStyle(theme, view.lang)}
      className={`${invitationFontVariables} ${contained ? 'min-h-full' : 'min-h-dvh'} bg-inv-bg text-inv-ink`}
    >
      <InvitationExperience view={view} contained={contained} />
    </div>
  );
}
