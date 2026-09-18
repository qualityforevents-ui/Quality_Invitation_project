import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * The home's chrome: the wordmark, the two services, the language.
 *
 * Deliberately not a shared site header. The builder has its own, carrying a progress
 * rail and a save indicator that would be meaningless here, and the booth page needs
 * neither. One header component serving three surfaces would be a component with three
 * modes, which is how chrome stops being chrome.
 */
export function HomeHeader({ lang, t }: { lang: Lang; t: Dictionary }) {
  return (
    <header className="flex h-16 items-center gap-4">
      <BrandLogo className="h-10 shrink-0" />

      <nav className="ms-auto flex items-center gap-4 text-sm">
        <Link href="/invitations" className="press text-ink-soft transition hover:text-ink">
          {t.home.navInvitations}
        </Link>
        <Link href="/photobooth" className="press text-ink-soft transition hover:text-ink">
          {t.home.navBooth}
        </Link>
      </nav>

      <LanguageToggle lang={lang} label={t.common.switchTo} className="h-9 shrink-0 px-3 text-xs" />
    </header>
  );
}
