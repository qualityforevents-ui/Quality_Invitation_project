import type { Metadata } from 'next';
import { InvitationShell } from '@/components/invitation/InvitationShell';
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
 */
export default async function SamplePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const lang = await getUiLang();
  const { theme } = await searchParams;

  const themeId = theme && isValidThemeId(theme) ? theme : undefined;

  return <InvitationShell view={buildSampleView(lang, themeId)} />;
}
