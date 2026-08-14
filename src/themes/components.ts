import type { ComponentType } from 'react';
import { ClassicCover } from './classic/ClassicCover';
import { ClassicInvitation } from './classic/ClassicInvitation';
import { FloralCover } from './floral/FloralCover';
import { FloralInvitation } from './floral/FloralInvitation';
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
 */
export const THEME_COMPONENTS: Record<string, { Cover: CoverComponent; Card: CardComponent }> = {
  classic: { Cover: ClassicCover, Card: ClassicInvitation },
  modern: { Cover: ModernCover, Card: ModernInvitation },
  floral: { Cover: FloralCover, Card: FloralInvitation },
  midnight: { Cover: MidnightCover, Card: MidnightInvitation },
};

export function getThemeComponents(themeId: string) {
  return THEME_COMPONENTS[themeId] ?? THEME_COMPONENTS.classic;
}
