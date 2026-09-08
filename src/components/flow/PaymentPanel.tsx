'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getPackage } from '@/lib/packages';
import { buildPaymentLink } from '@/lib/whatsapp';
import type { Dictionary } from '@/i18n/ui';
import type { Lang, Package } from '@/lib/types';

/**
 * wa.me on a desktop browser opens WhatsApp Web, and if the visitor is not already
 * logged in there it shows a QR code rather than a chat. So desktop gets one line
 * telling somebody to finish this on their phone.
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  // Runs after mount so the server and client render the same markup to begin with.
  // Deciding during render reintroduces a hydration mismatch.
  useEffect(() => {
    const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(navigator.userAgent);
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsDesktop(!isMobileAgent && !isCoarsePointer);
  }, []);

  return isDesktop;
}

/**
 * The end of the flow: the amount, and one button that hands the request to a human.
 *
 * It used to carry the payment itself — an InstaPay button, a Vodafone Cash button, the
 * address copied to the clipboard, and an instruction to come back with a screenshot.
 * That is three apps and four steps for a customer to get wrong, and every way it went
 * wrong produced the same message: money sent somewhere, and nobody sure where.
 *
 * Payment is a conversation now. The button opens WhatsApp with the request id, the
 * couple, the tier and the amount already written, and the rest is settled by a person
 * who can answer a question. Nothing on this screen competes with that one sentence.
 */
export function PaymentPanel({
  t,
  uiLang,
  requestId,
  name1,
  name2,
  packageId,
  statusPath,
  onHandoff,
}: {
  t: Dictionary;
  uiLang: Lang;
  /** Null until the draft row exists, which needs a name and a reachable database. */
  requestId: string | null;
  name1: string;
  name2: string;
  packageId: Package;
  statusPath: string | null;
  /** Flushes the autosave and marks the row before WhatsApp opens. */
  onHandoff: () => void;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const tier = getPackage(packageId);
  const link = buildPaymentLink({ lang: uiLang, requestId: requestId ?? '', name1, name2, packageId });

  /**
   * Copies the recipient, then lets the anchor open the app.
   *
   * The copy is fired from inside the tap rather than awaited before navigating: the
   * clipboard write only has to *start* within the gesture to be permitted, and holding
   * the navigation for a promise would cost the gesture the browser needs to hand an
   * app link over.
   */
  /**
   * The status moves before WhatsApp opens. keepalive lets that request finish even
   * though this tab is navigating to the waiting screen at the same moment, and the
   * anchor's own navigation is left untouched so the browser still treats opening
   * WhatsApp as a user action rather than a popup it should block.
   */
  function handleHandoff() {
    onHandoff();
    if (statusPath) router.push(statusPath);
  }

  return (
    <section className="rise rounded-2xl border bg-card px-5 py-5 shadow-[0_10px_30px_-24px_rgba(35,32,27,0.55)]">
      <h2 className="text-xl font-bold">{t.flow.payTitle}</h2>

      <div className="mt-4 flex items-baseline justify-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-4">
        <span className="text-sm text-muted-foreground">{t.payment.amountLabel}</span>
        <span className="numeric text-3xl font-bold text-secondary-foreground">{tier.price}</span>
        <span className="text-sm font-medium text-secondary-foreground">{t.common.egp}</span>
      </div>

      {isDesktop ? (
        <p className="mt-4 rounded-xl border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {t.payment.desktopNote}
        </p>
      ) : null}

      <p className="mt-6 text-sm font-medium">{t.payment.afterPayLabel}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {t.payment.attachReminder}
      </p>

      {/*
        No request id means the row was never written, which means the save is failing.
        The handoff is withheld rather than dressed up, because the request id is the
        only thing tying a transfer to an invitation: a customer who sends money on a
        message carrying no id has paid into a void the operator cannot trace.
      */}
      {requestId ? (
        <Button asChild size="lg" className="mt-3 w-full rounded-full bg-whatsapp text-base text-white hover:bg-whatsapp-deep">
          <a href={link} target="_blank" rel="noopener noreferrer" onClick={handleHandoff}>
            {t.payment.whatsappCta}
          </a>
        </Button>
      ) : (
        <Alert variant="destructive" className="mt-3">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>{t.payment.notSaved}</AlertDescription>
        </Alert>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t.payment.afterBody}</p>
    </section>
  );
}
