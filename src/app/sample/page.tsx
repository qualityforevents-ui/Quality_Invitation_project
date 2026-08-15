import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BackButton } from '@/components/builder/BuildNav';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import { buttonClass } from '@/components/ui/Button';
import { getDictionary } from '@/i18n/ui';
import { buildSampleView } from '@/lib/sample';
import { getUiLang } from '@/lib/session';
import { isValidThemeId } from '@/themes/registry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'نموذج دعوة',
  robots: { index: false, follow: false },
};

/**
 * Follows whichever language the visitor set on the landing page.
 *
 * `?theme=` shows any of the four. It is how the themes are compared during
 * development, and it means the operator can send somebody a link to a specific style
 * without building a throwaway invitation to do it.
 *
 * The card used to be all there was on this screen, which made it a trap. Somebody
 * curious enough to open the sample is the most persuaded this product will ever have
 * them, and at that exact moment the page offered no way to start one and no way back:
 * the only links were the venue's map and a footer pointing off to the marketing site.
 * The bar along the bottom is that missing step.
 */
export default async function SamplePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const lang = await getUiLang();
  const t = getDictionary(lang);
  const { theme } = await searchParams;

  const themeId = theme && isValidThemeId(theme) ? theme : undefined;

  return (
    <>
      {/* Lifts the invitation's mute toggle clear of the bar along the bottom. */}
      <div style={{ '--inv-toggle-offset': '6.5rem' } as CSSProperties}>
        <InvitationShell view={buildSampleView(lang, themeId)} />
      </div>

      <div className="fixed top-4 start-4 z-50">
        <BackButton href="/" label={t.landing.sampleBack} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {/* Says plainly that this is a specimen, so nobody reads Karim and Salma as a
              real couple whose wedding they have somehow been invited to. */}
          <p className="mb-2 text-center text-xs leading-relaxed text-ink-soft">
            {t.landing.sampleNote}
          </p>
          <Link href="/#packages" className={buttonClass('primary', 'w-full')}>
            {t.landing.sampleCta}
          </Link>
        </div>
      </div>
    </>
  );
}
