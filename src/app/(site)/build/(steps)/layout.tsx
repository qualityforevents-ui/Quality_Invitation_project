import type { ReactNode } from 'react';
import { BuildNav } from '@/components/builder/BuildNav';
import { LanguageToggle } from '@/components/LanguageToggle';
import { getDictionary } from '@/i18n/ui';
import { getUiLang } from '@/lib/session';

export default async function BuildLayout({ children }: { children: ReactNode }) {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      {/*
        The header knows which step it is on, which a server layout cannot, so it is a
        client component and the language toggle is passed through it as a child rather
        than rendered separately beside it.
      */}
      <BuildNav
        backLabel={t.common.back}
        stepWord={t.common.step}
        ofWord={t.common.of}
        labels={{
          data: t.common.stepData,
          design: t.common.stepDesign,
          preview: t.common.stepPreview,
          payment: t.common.stepPayment,
        }}
      >
        <LanguageToggle lang={lang} label={t.common.switchTo} />
      </BuildNav>

      {children}
    </div>
  );
}
