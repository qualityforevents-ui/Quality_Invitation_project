import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ThemeStep } from '@/components/builder/ThemeStep';
import { SupportButton } from '@/components/SupportButton';
import { getDictionary } from '@/i18n/ui';
import { loadDraft } from '@/lib/draft';
import { isImageKitConfigured, parseCrop } from '@/lib/imagekit';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ThemePage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  const { invitation } = await loadDraft();

  // Nothing to draw a miniature from, so send them back rather than showing a grid of
  // themes previewing an empty invitation.
  if (!invitation) redirect('/build');

  return (
    <main className="flex-1">
      <ThemeStep
        uiLang={lang}
        t={t}
        name1={invitation.name1}
        name2={invitation.name2}
        eventDate={invitation.eventDate}
        eventType={invitation.eventType}
        initialInvitationLang={invitation.invitationLang}
        initialThemeId={invitation.themeId}
        initialMusicTrackId={invitation.musicTrackId}
        initialPhotoPath={invitation.photoFileId}
        initialPhotoCrop={parseCrop(invitation.photoCrop)}
        photoEnabled={isImageKitConfigured()}
      />

      <SupportButton message={t.landing.supportMessage} label={t.landing.support} raised />
    </main>
  );
}
