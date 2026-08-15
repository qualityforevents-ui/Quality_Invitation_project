import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { StatusWatcher } from '@/components/status/StatusWatcher';
import { SupportButton } from '@/components/SupportButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyField } from '@/components/ui/CopyField';
import { getDictionary } from '@/i18n/ui';
import { getByEditToken } from '@/lib/invitations';
import { editUrl, publicInvitationUrl, whatsappLink } from '@/lib/constants';
import { buildSupportMessage } from '@/lib/whatsapp';
import { getUiLang } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ editToken: string }> };

/**
 * The waiting screen, and then the success screen, at the same URL.
 *
 * It kept its path through the rebuild that deleted the four builder routes around it.
 * That was deliberate: this is where every paying customer lands the moment they tap
 * through to WhatsApp, the address is inside messages the operator has already sent, and
 * five other places in the codebase point at it. Moving it would have bought nothing and
 * risked a 404 immediately after somebody sent money.
 */
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8 pb-16">
      <StatusWatcher editToken={editToken} currentStatus={invitation.status} />

      <header>
        <h1 className="text-2xl font-bold">{isActive ? t.success.heading : t.status.heading}</h1>

        {isRejected ? (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>{invitation.rejectReason || t.status.rejected}</AlertDescription>
          </Alert>
        ) : isActive ? null : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.status.body}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.status.expectation}
            </p>
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
          <section className="rounded-2xl border-2 border-primary bg-secondary px-4 py-4">
            <h2 className="text-base font-bold text-secondary-foreground">{t.success.shareTitle}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.success.shareHint}</p>

            <p dir="ltr" className="mt-3 truncate rounded-lg bg-card px-3 py-2 text-start text-sm">
              {publicUrl}
            </p>

            <Button asChild size="lg" className="mt-3 w-full rounded-full">
              <a href={whatsappLink(shareText)} target="_blank" rel="noopener noreferrer">
                {t.success.shareCta}
              </a>
            </Button>
          </section>

          <section className="rounded-xl border bg-card px-4 py-3">
            <h2 className="text-sm font-medium">{t.success.editTitle}</h2>
            <p dir="ltr" className="mt-2 truncate text-start text-xs text-muted-foreground">
              {editUrl(invitation.editToken)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-destructive">{t.success.editWarn}</p>
          </section>
        </>
      ) : (
        <section className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">{t.status.linkLabel}</h2>
            <Badge variant="secondary">{t.status.notActive}</Badge>
          </div>
          <p dir="ltr" className="mt-2 truncate text-start text-sm text-muted-foreground">
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
