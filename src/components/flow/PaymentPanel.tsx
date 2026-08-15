'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CopyField } from '@/components/ui/CopyField';
import { cn } from '@/lib/cn';
import { getPackage, PACKAGES } from '@/lib/packages';
import { INSTAPAY_ADDRESS, INSTAPAY_NAME } from '@/lib/constants';
import { buildPaymentLink, buildPaymentMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/i18n/ui';
import type { Lang, Package } from '@/generated/prisma/enums';

/**
 * wa.me on a desktop browser opens WhatsApp Web, and if the visitor is not already
 * logged in there it shows a QR code. Meeting that in the middle of paying reads as
 * the payment having gone wrong, so desktop gets the message as copyable text and a
 * clear instruction to use a phone instead.
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
 * The end of the flow, and the one place that is deliberately not a single question.
 *
 * An InstaPay address, a recipient name, an amount and a request id all have to be on
 * screen at the same instant, because the customer is about to leave for their banking
 * app and come back. Asking for them one at a time would be following the pattern off a
 * cliff.
 */
export function PaymentPanel({
  t,
  uiLang,
  requestId,
  name1,
  name2,
  packageId,
  statusPath,
  onPackageChange,
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
  onPackageChange: (next: Package) => void;
  /** Flushes the autosave and marks the row before WhatsApp opens. */
  onHandoff: () => void;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [messageCopied, setMessageCopied] = useState(false);

  const tier = getPackage(packageId);

  const message = buildPaymentMessage({ lang: uiLang, requestId: requestId ?? '', name1, name2, packageId });
  const link = buildPaymentLink({ lang: uiLang, requestId: requestId ?? '', name1, name2, packageId });

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

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setMessageCopied(true);
      window.setTimeout(() => setMessageCopied(false), 2000);
    } catch {
      setMessageCopied(false);
    }
  }

  return (
    <section className="rise scroll-mt-24 rounded-2xl border bg-card px-5 py-5 shadow-[0_10px_30px_-24px_rgba(35,32,27,0.55)]">
      <h2 className="text-xl font-bold">{t.flow.payTitle}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.payment.sub}</p>

      {/*
        The tier was chosen at the top of the flow, and it is repeated here and left
        changeable. This is the last screen before money moves, and somebody who picked
        a tier ten minutes ago should be able to see what they picked and change their
        mind without going back to the start.
      */}
      <div className="mt-5 flex flex-col gap-2" role="radiogroup" aria-label={t.payment.packageLabel}>
        <h3 className="text-sm font-medium">{t.payment.packageLabel}</h3>

        {PACKAGES.map((option) => {
          const selected = option.id === packageId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPackageChange(option.id)}
              className={cn(
                'press flex items-center gap-3 rounded-xl border px-4 py-3 text-start',
                selected ? 'border-primary bg-secondary' : 'border-border bg-card',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  selected ? 'border-primary bg-primary' : 'border-border',
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="size-3 text-primary-foreground" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {uiLang === 'AR' ? option.nameAr : option.nameEn}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {uiLang === 'AR' ? option.taglineAr : option.taglineEn}
                </span>
              </span>

              <span className="shrink-0 text-end">
                <span className="numeric text-lg font-bold text-secondary-foreground">{option.price}</span>
                <span className="ms-1 text-xs text-secondary-foreground">{t.common.egp}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-4">
        <span className="text-sm text-muted-foreground">{t.payment.amountLabel}</span>
        <span className="numeric text-3xl font-bold text-secondary-foreground">{tier.price}</span>
        <span className="text-sm font-medium text-secondary-foreground">{t.common.egp}</span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.payment.instapayTitle}</h3>
        <CopyField
          label={t.payment.instapayAddress}
          value={INSTAPAY_ADDRESS}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
        />
        <CopyField
          label={t.payment.instapayName}
          value={INSTAPAY_NAME}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
        />
      </div>

      {requestId ? (
        <div className="mt-4 flex flex-col gap-2">
          <CopyField
            label={t.payment.requestIdLabel}
            value={requestId}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            emphasis
          />
          <p className="text-xs leading-relaxed text-muted-foreground">{t.payment.requestIdHint}</p>
        </div>
      ) : null}

      {isDesktop ? (
        <div className="mt-5 rounded-2xl border bg-muted/40 px-4 py-4">
          <h3 className="text-sm font-semibold">{t.payment.desktopTitle}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.payment.desktopNote}</p>

          <pre className="mt-3 rounded-xl border bg-card px-3 py-3 text-start text-xs leading-relaxed whitespace-pre-wrap">
            {message}
          </pre>

          <Button type="button" variant="outline" onClick={copyMessage} className="mt-3 w-full rounded-full">
            {messageCopied ? t.common.copied : t.payment.copyMessage}
          </Button>

          <Button asChild variant="link" className="mt-2 w-full text-xs text-muted-foreground">
            <a href={link} target="_blank" rel="noopener noreferrer" onClick={handleHandoff}>
              {t.payment.openAnyway}
            </a>
          </Button>
        </div>
      ) : null}

      {/*
        What happens after the money leaves, said before it leaves.
        This screen asks somebody to transfer real money to an account they have never
        heard of and then message a stranger on WhatsApp. Reassurance is worth nothing
        once the risk has already been taken.
      */}
      <div className="mt-5 rounded-2xl border bg-muted/40 px-5 py-4">
        <h3 className="text-sm font-medium">{t.payment.afterTitle}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.payment.afterBody}</p>
      </div>

      {/*
        No request id means the row was never written, which means the save is failing.
        The handoff is withheld rather than dressed up, because the request id is the
        only thing tying a transfer to an invitation: a customer who sends money on a
        message carrying no id has paid into a void the operator cannot trace, and that
        is not a failure anybody can recover from afterwards. Everything above stays on
        screen and readable; only the button that leads to money is held back.
      */}
      {requestId ? (
        <>
          <p className="mt-5 text-center text-xs text-muted-foreground">{t.payment.attachReminder}</p>

          <Button asChild size="lg" className="mt-2 w-full rounded-full text-base">
            <a href={link} target="_blank" rel="noopener noreferrer" onClick={handleHandoff}>
              {t.payment.whatsappCta}
            </a>
          </Button>
        </>
      ) : (
        <Alert variant="destructive" className="mt-5">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>{t.payment.notSaved}</AlertDescription>
        </Alert>
      )}
    </section>
  );
}
