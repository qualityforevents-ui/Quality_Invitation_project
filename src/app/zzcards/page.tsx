import type { Metadata } from 'next';
import { getInvitationCopy } from '@/i18n/invitation';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { invitationFontVariables } from '@/lib/fonts';
import { buildSampleView } from '@/lib/sample';
import { getThemeComponents } from '@/themes/components';
import { getTheme, isValidThemeId, themeStyle } from '@/themes/registry';
import type { Lang } from '@/generated/prisma/enums';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'مراجعة التصاميم',
  robots: { index: false, follow: false },
};

/**
 * The revealed card on its own, with no cover in front of it.
 *
 * Reviewing a design means looking at the card, and the card is normally reachable only
 * by tapping through the cover. That tap hands off to an AnimatePresence in `wait` mode,
 * which will not mount the card until the cover's exit animation has finished, and an
 * exit animation only finishes if the page is being painted. In a headless or
 * backgrounded browser requestAnimationFrame never fires, so the cover exits forever and
 * the card is unreachable — which is how twelve designs came to be shipped with nobody
 * having seen the part of them that carries the invitation.
 *
 * This route renders the Card component directly. It is the same component the guest
 * gets, in the same theme wrapper, so it cannot drift from the real thing: what it skips
 * is the cover, the music and the confetti, none of which are the card.
 *
 * `?theme=` picks the design and `?lang=` the language. Not linked from anywhere and
 * marked noindex, in the same spirit as /zzdiag beside it.
 */
export default async function CardReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; lang?: string }>;
}) {
  const { theme, lang } = await searchParams;

  const themeId = theme && isValidThemeId(theme) ? theme : 'classic';
  const invitationLang: Lang = lang === 'EN' ? 'EN' : 'AR';

  const view = buildSampleView(invitationLang, themeId);
  const definition = getTheme(themeId);
  const copy = getInvitationCopy(invitationLang);
  const { Card } = getThemeComponents(themeId);

  return (
    <div
      lang={htmlLangFor(invitationLang)}
      dir={dirFor(invitationLang)}
      style={themeStyle(definition, invitationLang)}
      className={`${invitationFontVariables} min-h-dvh bg-inv-bg text-inv-ink`}
    >
      <Card view={view} copy={copy} />
    </div>
  );
}
