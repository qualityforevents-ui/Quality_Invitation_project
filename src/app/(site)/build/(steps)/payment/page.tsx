import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaymentStep } from '@/components/builder/PaymentStep';
import { SupportButton } from '@/components/SupportButton';
import { getDictionary } from '@/i18n/ui';
import { loadDraft } from '@/lib/draft';
import { getUiLang } from '@/lib/session';
import { isReadyForPreview } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PaymentPage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const { invitation } = await loadDraft();

  if (!invitation || !isReadyForPreview(invitation)) redirect('/build');

  return (
    <main className="flex-1">
      <PaymentStep
        uiLang={lang}
        t={t}
        requestId={invitation.requestId}
        name1={invitation.name1}
        name2={invitation.name2}
        statusPath={`/build/status/${invitation.editToken}`}
        initialPhone={invitation.customerPhone ?? ''}
        initialPackage={invitation.package}
        initialCustomRequest={invitation.customRequest ?? ''}
      />

      {/*
        Kept on the money screen deliberately. Somebody confused about an InstaPay
        transfer needs a person, and they need one without leaving this page to find a
        link at the bottom of another.
      */}
      <SupportButton message={t.landing.supportMessage} label={t.landing.support} raised />
    </main>
  );
}
