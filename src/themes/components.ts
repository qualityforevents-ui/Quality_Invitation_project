import type { ComponentType } from 'react';
import { ClassicCover } from './classic/ClassicCover';
import { ClassicInvitation } from './classic/ClassicInvitation';
import { FloralCover } from './floral/FloralCover';
import { FloralInvitation } from './floral/FloralInvitation';
import { GhouroubCover } from './ghouroub/GhouroubCover';
import { GhouroubInvitation } from './ghouroub/GhouroubInvitation';
import { HadiqaCover } from './hadiqa/HadiqaCover';
import { HadiqaInvitation } from './hadiqa/HadiqaInvitation';
import { IwanCover } from './iwan/IwanCover';
import { IwanInvitation } from './iwan/IwanInvitation';
import { KhayamiyaCover } from './khayamiya/KhayamiyaCover';
import { KhayamiyaInvitation } from './khayamiya/KhayamiyaInvitation';
import { LawhCover } from './lawh/LawhCover';
import { LawhInvitation } from './lawh/LawhInvitation';
import { MakhmalCover } from './makhmal/MakhmalCover';
import { MakhmalInvitation } from './makhmal/MakhmalInvitation';
import { MashrabiyaCover } from './mashrabiya/MashrabiyaCover';
import { MashrabiyaInvitation } from './mashrabiya/MashrabiyaInvitation';
import { MidnightCover } from './midnight/MidnightCover';
import { MidnightInvitation } from './midnight/MidnightInvitation';
import { ModernCover } from './modern/ModernCover';
import { ModernInvitation } from './modern/ModernInvitation';
import { NetigaCover } from './netiga/NetigaCover';
import { NetigaInvitation } from './netiga/NetigaInvitation';
import { QandeelCover } from './qandeel/QandeelCover';
import { QandeelInvitation } from './qandeel/QandeelInvitation';
import { RizmaCover } from './rizma/RizmaCover';
import { RizmaInvitation } from './rizma/RizmaInvitation';
import { SijillCover } from './sijill/SijillCover';
import { SijillInvitation } from './sijill/SijillInvitation';
import { ZarfCover } from './zarf/ZarfCover';
import { ZarfInvitation } from './zarf/ZarfInvitation';
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
 * All twelve v2 themes are registered. The last four are retired: they are no longer
 * offered in the picker, and they are still here because invitations sold under them are
 * still being opened.
 */
export const THEME_COMPONENTS: Record<string, { Cover: CoverComponent; Card: CardComponent }> = {
  mashrabiya: { Cover: MashrabiyaCover, Card: MashrabiyaInvitation },
  iwan: { Cover: IwanCover, Card: IwanInvitation },
  qandeel: { Cover: QandeelCover, Card: QandeelInvitation },
  makhmal: { Cover: MakhmalCover, Card: MakhmalInvitation },
  khayamiya: { Cover: KhayamiyaCover, Card: KhayamiyaInvitation },
  ghouroub: { Cover: GhouroubCover, Card: GhouroubInvitation },
  netiga: { Cover: NetigaCover, Card: NetigaInvitation },
  sijill: { Cover: SijillCover, Card: SijillInvitation },
  zarf: { Cover: ZarfCover, Card: ZarfInvitation },
  hadiqa: { Cover: HadiqaCover, Card: HadiqaInvitation },
  rizma: { Cover: RizmaCover, Card: RizmaInvitation },
  lawh: { Cover: LawhCover, Card: LawhInvitation },

  // Retired, kept renderable
  classic: { Cover: ClassicCover, Card: ClassicInvitation },
  modern: { Cover: ModernCover, Card: ModernInvitation },
  floral: { Cover: FloralCover, Card: FloralInvitation },
  midnight: { Cover: MidnightCover, Card: MidnightInvitation },
};

/**
 * Falls back to the default theme's components rather than to classic by name.
 */
export function getThemeComponents(themeId: string) {
  return THEME_COMPONENTS[themeId] ?? THEME_COMPONENTS.hadiqa;
}
