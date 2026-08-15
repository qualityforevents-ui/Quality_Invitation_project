import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusWatcher } from '@/components/builder/StatusWatcher';
import { SupportButton } from '@/components/SupportButton';
import { CopyField } from '@/components/ui/CopyField';
import { buttonClass } from '@/components/ui/Button';
import { getDictionary } from '@/i18n/ui';
import { getByEditToken } from '@/lib/invitations';
import { editUrl, publicInvitationUrl, whatsappLink } from '@/lib/constants';
import { buildSupportMessage } from '@/lib/whatsapp';
import { getUiLang } from '@/lib/session';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ editToken: string }> };

export default async function StatusPage({ params }: Params) {
  const { editToken } = await params;

  const lang = await getUiLang();
  const t = getDictionary(lang);

  const invitation = await getByEditToken(editToken);
  if (!invitation) notFound();

  const publicUrl = publicInvitationUrl(invitation.slug);
  const isActive = invitation.status === 'ACTIVE';
  const isRejected = invitation.status === 'REJECTED';

  const shareText = `${t.success.shareMessage}\n${publicUrl}`;

  return (
    <main className="flex flex-1 flex-col gap-6 pb-16">
      <StatusWatcher editToken={editToken} currentStatus={invitation.status} />

      <header>
        <h1 className="text-2xl font-bold">{isActive ? t.success.heading : t.status.heading}</h1>

        {isRejected ? (
          <p className="mt-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-relaxed text-danger">
            {invitation.rejectReason || t.status.rejected}
          </p>
        ) : isActive ? null : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.status.body}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t.status.expectation}</p>
          </>
        )}
      </header>

      <CopyField
        label={t.status.requestIdLabel}
        value={invitation.requestId}
        copyLabel={t.common.copy}
        copiedLabel={t.common.copied}
        emphasis
      />

      {isActive ? (
        <>
          {/*
            Two links, and the difference between them has to be obvious at a glance.
            A customer who shares the edit link by mistake has handed every guest the
            ability to rewrite their invitation.
          */}
          <section className="rounded-2xl border-2 border-gold bg-gold-wash px-4 py-4">
            <h2 className="text-base font-bold text-gold-deep">{t.success.shareTitle}</h2>
            <p className="mt-1 text-xs text-ink-soft">{t.success.shareHint}</p>

            <p dir="ltr" className="mt-3 truncate rounded-lg bg-white px-3 py-2 text-start text-sm text-ink">
              {publicUrl}
            </p>

            <a
              href={whatsappLink(shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('primary', 'mt-3 w-full')}
            >
              {t.success.shareCta}
            </a>
          </section>

          <section className="rounded-xl border border-line bg-white px-4 py-3">
            <h2 className="text-sm font-medium text-ink">{t.success.editTitle}</h2>
            <p dir="ltr" className="mt-2 truncate text-start text-xs text-ink-faint">
              {editUrl(invitation.editToken)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-danger">{t.success.editWarn}</p>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-line bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-ink">{t.status.linkLabel}</h2>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                'bg-cream-deep text-ink-soft',
              )}
            >
              {t.status.notActive}
            </span>
          </div>
          <p dir="ltr" className="mt-2 truncate text-start text-sm text-ink-faint">
            {publicUrl}
          </p>
        </section>
      )}

      {/* Carries the request id into the prefilled message. This is the screen where
          somebody who has already paid comes looking for a human. */}
      <SupportButton
        message={buildSupportMessage(lang, invitation.requestId)}
        label={t.status.trouble}
      />
    </main>
  );
}
