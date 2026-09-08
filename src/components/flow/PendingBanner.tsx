import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Invitation } from '@/lib/types';
import type { Dictionary } from '@/i18n/ui';

/**
 * What a customer sees when they come back to a request they have already sent.
 *
 * The flow renders the same whatever state the invitation is in, so somebody who had
 * paid, closed the tab and returned a day later met an ordinary editable form with no
 * sign their request existed at all. The reasonable conclusion from that screen is that
 * the whole thing failed, and the reasonable next action is to pay again.
 *
 * Drafts get nothing. A draft is exactly what this page is for, and announcing it would
 * be telling somebody about the thing they are already looking at.
 */
export function PendingBanner({
  invitation,
  t,
}: {
  invitation: Pick<Invitation, 'editToken' | 'slug' | 'status'>;
  t: Dictionary;
}) {
  if (invitation.status === 'AWAITING_CONFIRMATION') {
    return (
      <Alert className="mt-4 border-primary/40 bg-secondary">
        <Clock aria-hidden="true" />
        <AlertDescription className="text-foreground">
          <span className="leading-relaxed">{t.status.pendingBanner}</span>
          <Link
            href={`/build/status/${invitation.editToken}`}
            className="press font-semibold text-secondary-foreground underline underline-offset-4"
          >
            {t.status.pendingCta}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (invitation.status === 'ACTIVE') {
    return (
      <Alert className="mt-4 border-success/30 bg-success/5">
        <CheckCircle2 aria-hidden="true" className="text-success" />
        <AlertDescription className="text-foreground">
          <span className="leading-relaxed">{t.status.activeBanner}</span>
          <Link
            href={`/${invitation.slug}`}
            className="press font-semibold text-success underline underline-offset-4"
          >
            {t.status.activeCta}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
