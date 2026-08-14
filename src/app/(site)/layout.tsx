import type { ReactNode } from 'react';
import { SyncDocumentLang } from '@/components/SyncDocumentLang';
import { uiFontVariables } from '@/lib/fonts';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { getUiLang } from '@/lib/session';

/**
 * Wraps the customer facing surfaces: landing, builder, payment, waiting screen.
 *
 * The builder fonts are attached here rather than in the root layout so that the
 * public invitation, which lives outside this group and uses its own theme faces,
 * never downloads them.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const lang = await getUiLang();

  return (
    <div
      lang={htmlLangFor(lang)}
      dir={dirFor(lang)}
      className={`${uiFontVariables} min-h-dvh bg-cream text-ink`}
    >
      <SyncDocumentLang lang={lang} />
      {children}
    </div>
  );
}
