import type { ReactNode } from 'react';
import { DirectionProvider } from '@/components/DirectionProvider';
import { SyncDocumentLang } from '@/components/SyncDocumentLang';
import { Toaster } from '@/components/ui/sonner';
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
  const dir = dirFor(lang);

  return (
    <div lang={htmlLangFor(lang)} dir={dir} className={`${uiFontVariables} min-h-dvh bg-background text-foreground`}>
      <SyncDocumentLang lang={lang} />
      {/* Radix reads direction from context rather than from the dir attribute beside
          it, so the same value has to be handed over explicitly. See the component. */}
      <DirectionProvider dir={dir}>{children}</DirectionProvider>
      {/*
        Top centre, not sonner's default bottom right. Bottom right is where the
        WhatsApp support bubble lives, and it is pinned to the physical right precisely
        so it does not move between languages, so a toast there covers it in both.
      */}
      <Toaster position="top-center" />
    </div>
  );
}
