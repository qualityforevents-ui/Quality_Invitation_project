import type { ComponentType } from 'react';
import { ClassicCover } from './classic/ClassicCover';
import { ClassicInvitation } from './classic/ClassicInvitation';
import { FloralCover } from './floral/FloralCover';
import { FloralInvitation } from './floral/FloralInvitation';
import { GhouroubCover } from './ghouroub/GhouroubCover';
import { GhouroubInvitation } from './ghouroub/GhouroubInvitation';
import { MakhmalCover } from './makhmal/MakhmalCover';
import { MakhmalInvitation } from './makhmal/MakhmalInvitation';
import { MidnightCover } from './midnight/MidnightCover';
import { MidnightInvitation } from './midnight/MidnightInvitation';
import { ModernCover } from './modern/ModernCover';
import { ModernInvitation } from './modern/ModernInvitation';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

export type CoverComponent = ComponentType<{
  view: InvitationView;
  copy: InvitationCopy;
  onOpen: () => void;
}>;

export type CardComponent = ComponentType<{
  view: InvitationView;
  copy: InvitationCopy;
}>;

/**
 * Maps a theme id to the pair of components that draw it.
 *
 * A theme is a folder beside these and one entry here. The ids must match the ones in
 * registry.ts, which is where the colours, font pair and default track live.
 *
 * The last four are retired: they are no longer offered in the picker, and they are
 * still here because invitations sold under them are still being opened. Deleting a
 * theme would break a link somebody has already sent to three hundred guests, so a
 * theme leaves the shop but never leaves the build.
 */
export const THEME_COMPONENTS: Record<string, { Cover: CoverComponent; Card: CardComponent }> = {
  makhmal: { Cover: MakhmalCover, Card: MakhmalInvitation },
  ghouroub: { Cover: GhouroubCover, Card: GhouroubInvitation },

  classic: { Cover: ClassicCover, Card: ClassicInvitation },
  modern: { Cover: ModernCover, Card: ModernInvitation },
  floral: { Cover: FloralCover, Card: FloralInvitation },
  midnight: { Cover: MidnightCover, Card: MidnightInvitation },
};

/**
 * Falls back to the default theme's components rather than to classic by name.
 *
 * The two have to agree: getTheme in the registry resolves an unknown id to
 * DEFAULT_THEME, so resolving the components to a different theme would render one
 * theme's markup in another theme's colours.
 */
export function getThemeComponents(themeId: string) {
  return THEME_COMPONENTS[themeId] ?? THEME_COMPONENTS.makhmal;
}
