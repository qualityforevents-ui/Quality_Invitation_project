import Link from 'next/link';
import type { Invitation } from '@/generated/prisma/client';
import type { Dictionary } from '@/i18n/ui';

/**
 * What a customer sees when they come back to a request they have already sent.
 *
 * The builder form renders the same whatever state the invitation is in, so somebody
 * who had paid, closed the tab and returned a day later met an ordinary editable form
 * with no sign their request existed at all. The reasonable conclusion from that screen
 * is that the whole thing failed, and the reasonable next action is to pay again.
 *
 * Drafts get nothing. A draft is exactly what this form is for, and announcing it would
 * be telling somebody about the thing they are already looking at.
 */
export function PendingBanner({ invitation, t }: { invitation: Invitation; t: Dictionary }) {
  if (invitation.status === 'AWAITING_CONFIRMATION') {
    return (
      <div className="mb-5 rounded-xl border border-gold/40 bg-gold-wash px-4 py-3">
        <p className="text-xs leading-relaxed text-ink">{t.status.pendingBanner}</p>
        <Link
          href={`/build/status/${invitation.editToken}`}
          className="press mt-1.5 inline-flex text-xs font-semibold text-gold-deep underline underline-offset-4"
        >
          {t.status.pendingCta}
        </Link>
      </div>
    );
  }

  if (invitation.status === 'ACTIVE') {
    return (
      <div className="mb-5 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-ink">{t.status.activeBanner}</p>
        <Link
          href={`/${invitation.slug}`}
          className="press mt-1.5 inline-flex text-xs font-semibold text-success underline underline-offset-4"
        >
          {t.status.activeCta}
        </Link>
      </div>
    );
  }

  return null;
}
