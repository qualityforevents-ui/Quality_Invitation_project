'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { copyText } from '@/lib/clipboard';
import { getPackage } from '@/lib/packages';
import {
  INSTAPAY_ADDRESS,
  INSTAPAY_APP_LINK,
  VODAFONE_CASH_LINK,
  VODAFONE_CASH_NUMBER,
} from '@/lib/constants';
import { buildPaymentLink } from '@/lib/whatsapp';
import type { Dictionary } from '@/i18n/ui';
import type { Lang, Package } from '@/generated/prisma/enums';

/**
 * wa.me on a desktop browser opens WhatsApp Web, and if the visitor is not already
 * logged in there it shows a QR code. The pay buttons are worse off still: an app link
 * has nothing to open. Both are the same instruction, so desktop gets one line telling
 * somebody to finish this on their phone.
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
 * The end of the flow: the amount, two ways to pay it, and one way to tell us.
 *
 * Deliberately three buttons and almost no reading. Everything that used to be here, the
 * tier list, the copyable address, the recipient name, the request id, the whole message
 * printed out for checking, was the customer doing by hand what the buttons now do:
 * carrying values between this page and two other apps. The tier is question one and can
 * be changed from its own row; the address rides in the clipboard; the request id rides
 * in the WhatsApp message and is shown on the screen this hands off to.
 *
 * What is left is the shape of the task. Pay with one of these. Then send us the
 * screenshot on that. Nothing else on screen competes with those two sentences.
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
  function handlePay(value: string) {
    void copyText(value).then((ok) => {
      if (ok) toast.success(t.payment.addressCopied);
    });
  }

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

      {/* One. Pay. */}
      <p className="mt-5 text-sm font-medium">{t.payment.methodsLabel}</p>

      <div className="mt-2 flex flex-col gap-2">
        <Button asChild size="lg" className="w-full rounded-full text-base">
          <a href={INSTAPAY_APP_LINK} onClick={() => handlePay(INSTAPAY_ADDRESS)}>
            {t.payment.payInstapay}
          </a>
        </Button>
        {/* The destination in one quiet line under the button it belongs to. The app
            link is the fast path, not the only one: if it opens on its own home screen,
            this is what the customer needs and it must not be a screen away. */}
        <p dir="ltr" className="text-center text-xs text-muted-foreground">
          <bdi>{INSTAPAY_ADDRESS}</bdi>
        </p>

        {VODAFONE_CASH_NUMBER ? (
          <>
            <Button asChild size="lg" variant="outline" className="mt-2 w-full rounded-full text-base">
              <a href={VODAFONE_CASH_LINK} onClick={() => handlePay(VODAFONE_CASH_NUMBER)}>
                {t.payment.payVodafone}
              </a>
            </Button>
            <p dir="ltr" className="text-center text-xs text-muted-foreground">
              <bdi>{VODAFONE_CASH_NUMBER}</bdi>
            </p>
          </>
        ) : null}
      </div>

      {/* Two. Tell us. */}
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
