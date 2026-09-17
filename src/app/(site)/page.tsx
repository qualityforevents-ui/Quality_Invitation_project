import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ContinueDraft } from '@/components/site/ContinueDraft';
import { SupportButton } from '@/components/SupportButton';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/i18n/ui';
import { loadDraft } from '@/lib/draft';
import { isEditable } from '@/lib/invitations';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * The root, which used to be the invitation builder and is now the way in to both
 * things QLTY sells.
 *
 * This is the holding version of it. The designed home, with its service cards, its
 * booth photography and its price tag, is the next piece of work; what is here is the
 * part that could not wait for it, because the builder moved out of the root today and
 * every link that still points at the root has to land somewhere honest tonight.
 *
 * It stays dynamic for one reason, and it is the same reason the builder does: the
 * editToken cookie is httpOnly, so only the server can tell whether the person asking
 * for this page already has an invitation half built.
 */
export default async function HomePage() {
  const lang = await getUiLang();
  const t = getDictionary(lang);

  /*
   * A draft the customer can no longer change is not something to offer to continue.
   * An expired or rejected invitation resolves from the cookie exactly like a live one,
   * and sending somebody to the builder to edit it would show them a form that refuses
   * every save. A database outage lands here as "no draft", which is the right way to
   * be wrong: the bar is missing for a minute rather than promising a draft it cannot
   * open.
   */
  const { invitation } = await loadDraft();
  const draft = invitation && isEditable(invitation) ? invitation : null;
  const names = draft ? [draft.name1, draft.name2].filter(Boolean).join(' • ') || null : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-16">
      <header className="flex h-14 items-center gap-3">
        <BrandLogo className="h-10" />
        <div className="ms-auto">
          <LanguageToggle lang={lang} label={t.common.switchTo} className="h-9 px-3 text-xs" />
        </div>
      </header>

      <p className="mt-10 text-2xl font-bold text-balance">{t.home.tagline}</p>

      {draft ? (
        <div className="mt-6">
          <ContinueDraft lang={lang} t={t} names={names} />
        </div>
      ) : null}

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-lg font-bold">{t.home.invitationsTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {t.home.invitationsBody}
        </p>

        <Button asChild className="mt-4 w-full">
          <Link href="/invitations">{t.home.invitationsCta}</Link>
        </Button>
      </section>

      <SupportButton message={t.home.supportMessage} label={t.landing.support} />
    </main>
  );
}
