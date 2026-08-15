import type { Metadata } from 'next';
import { BuildForm } from '@/components/builder/BuildForm';
import { PendingBanner } from '@/components/builder/PendingBanner';
import { SupportButton } from '@/components/SupportButton';
import { getDictionary } from '@/i18n/ui';
import { loadDraft, toBuilderValues } from '@/lib/draft';
import { todayInCairo } from '@/lib/format';
import { DEFAULT_PACKAGE, isValidPackage } from '@/lib/packages';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const { invitation, unavailable } = await loadDraft();

  /*
   * The package chosen on the landing page arrives as a query parameter and is handed
   * to the form, which stores it with the next autosave.
   *
   * An explicit choice wins over whatever the draft already held. Arriving here through
   * a package card is somebody deciding, just now, which tier they want, and it would be
   * strange to ignore that because they happened to start a draft last week. Landing on
   * /build with no parameter leaves an existing draft alone.
   */
  const { package: requested } = await searchParams;
  const chosenPackage =
    requested && isValidPackage(requested)
      ? requested
      : (invitation?.package ?? DEFAULT_PACKAGE);

  return (
    <main className="flex-1">
      {unavailable && process.env.NODE_ENV !== 'production' ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-xs text-danger">
          The database is not reachable, so nothing here will save. Work through SETUP.md steps 1
          to 3, then reload.
        </p>
      ) : null}

      {invitation ? <PendingBanner invitation={invitation} t={t} /> : null}

      <BuildForm
        initial={toBuilderValues(invitation)}
        lang={lang}
        t={t}
        today={todayInCairo()}
        packageId={chosenPackage}
      />

      {/* Raised, because this step carries a fixed bar along the bottom. */}
      <SupportButton message={t.landing.supportMessage} label={t.landing.support} raised />
    </main>
  );
}
