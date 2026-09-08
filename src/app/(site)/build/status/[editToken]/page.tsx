import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { CancelRequestButton } from '@/components/status/CancelRequestButton';
import { StatusWatcher } from '@/components/status/StatusWatcher';
import { SupportButton } from '@/components/SupportButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

            {/*
              Copyable, not merely readable. Sharing over WhatsApp is one tap below,
              but plenty of people are pasting this into Facebook, a story, or a message
              to somebody who is not in their WhatsApp contacts, and selecting a
              truncated URL by hand on a phone is close to impossible.
            */}
            <div className="mt-3">
              <CopyField
                label={t.status.linkLabel}
                value={publicUrl}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
              />
            </div>

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
        <div>
          {/*
            Copyable even before it works. This is the address the invitation will have,
            it does not change on activation, and somebody who wants to keep it
            somewhere safe while they wait should not have to retype it off a screen.
            The line underneath says plainly that it is not live yet.
          */}
          <CopyField
            label={t.status.linkLabel}
            value={publicUrl}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
          />
          <p className="mt-2 px-1 text-xs text-muted-foreground">{t.status.notActive}</p>
        </div>
      )}

      {/*
        Only while the request is waiting on us, or has come back rejected. An ACTIVE
        invitation has been paid for and its link may already be with the guests, so
        taking it down is a conversation rather than a button.
      */}
      {invitation.status === 'AWAITING_CONFIRMATION' || isRejected ? (
        <CancelRequestButton editToken={invitation.editToken} t={t} />
      ) : null}

      {/* Carries the request id into the prefilled message. This is the screen where
          somebody who has already paid comes looking for a human. */}
      <SupportButton
        message={buildSupportMessage(lang, invitation.requestId)}
        label={t.status.trouble}
      />
    </main>
  );
}
