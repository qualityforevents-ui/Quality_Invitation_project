'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SaveIndicator, TextAreaField, TextField } from './Fields';
import { CopyField } from '@/components/ui/CopyField';
import { buttonClass } from '@/components/ui/Button';
import { useAutosave } from '@/lib/useAutosave';
import { cn } from '@/lib/cn';
import { normaliseEgyptianPhone } from '@/lib/validation';
import { buildPaymentLink, buildPaymentMessage } from '@/lib/whatsapp';
import { INSTAPAY_ADDRESS, INSTAPAY_NAME } from '@/lib/constants';
import { getPackage, PACKAGES } from '@/lib/packages';
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
  useEffect(() => {
    const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(navigator.userAgent);
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsDesktop(!isMobileAgent && !isCoarsePointer);
  }, []);

  return isDesktop;
}

export function PaymentStep({
  uiLang,
  t,
  requestId,
  name1,
  name2,
  statusPath,
  initialPhone,
  initialPackage,
  initialCustomRequest,
}: {
  uiLang: Lang;
  t: Dictionary;
  requestId: string;
  name1: string;
  name2: string;
  statusPath: string;
  initialPhone: string;
  initialPackage: Package;
  initialCustomRequest: string;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const [phone, setPhone] = useState(initialPhone);
  const [packageId, setPackageId] = useState<Package>(initialPackage);
  const [customRequest, setCustomRequest] = useState(initialCustomRequest);
  const [messageCopied, setMessageCopied] = useState(false);

  const tier = getPackage(packageId);

  const phoneError =
    phone.trim().length > 0 && normaliseEgyptianPhone(phone) === null ? t.payment.phoneError : undefined;

  const patch = useMemo(
    () => ({
      ...(phoneError ? {} : { customerPhone: phone }),
      package: packageId,
      customRequest: tier.customDesign ? customRequest : '',
    }),
    [phone, phoneError, packageId, customRequest, tier.customDesign],
  );

  const { status: saveStatus, flush } = useAutosave(patch);

  const message = buildPaymentMessage({ lang: uiLang, requestId, name1, name2, packageId });
  const link = buildPaymentLink({ lang: uiLang, requestId, name1, name2, packageId });

  /**
   * The status moves before WhatsApp opens, as the spec requires. keepalive lets the
   * request finish even though this tab is navigating to the waiting screen at the
   * same moment, and the anchor's own navigation is left untouched so the browser
   * still treats opening WhatsApp as a user action rather than a popup.
   */
  function handleHandoff() {
    // The phone number is how the operator delivers the finished link, and it is
    // commonly typed in the seconds just before this button is tapped. Flushing first
    // stops it sitting on the debounce and being thrown away by the navigation.
    void flush();

    void fetch('/api/invitation/confirm', { method: 'POST', keepalive: true }).catch(() => {
      // The operator can still find this request by its id, so a failure here is not
      // worth blocking the customer's path to WhatsApp.
    });

    router.push(statusPath);
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
    <div className="flex flex-col gap-6 pb-32">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.payment.heading}</h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.payment.sub}</p>
        </div>
        <SaveIndicator
          status={saveStatus}
          savingLabel={t.common.saving}
          savedLabel={t.common.saved}
          errorLabel={t.errors.saveFailedShort}
        />
      </div>

      {/*
        The package is chosen on the landing page, but it is repeated here and left
        changeable. This is the last screen before money moves, and somebody who picked
        a tier ten minutes ago should be able to see what they picked and change their
        mind without going back to the start.
      */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">{t.payment.packageLabel}</h2>

        {PACKAGES.map((option) => {
          const selected = option.id === packageId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPackageId(option.id)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-start transition',
                selected ? 'border-gold bg-gold-wash' : 'border-line bg-white',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  selected ? 'border-gold bg-gold' : 'border-line',
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                    <path
                      d="M2.5 6.2L4.8 8.5L9.5 3.8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  {uiLang === 'AR' ? option.nameAr : option.nameEn}
                </span>
                <span className="block text-xs text-ink-faint">
                  {uiLang === 'AR' ? option.taglineAr : option.taglineEn}
                </span>
              </span>

              <span className="shrink-0 text-end">
                <span className="numeric text-lg font-bold text-gold-deep">{option.price}</span>
                <span className="ms-1 text-xs text-gold-deep">{t.common.egp}</span>
              </span>
            </button>
          );
        })}
      </section>

      <div className="flex items-baseline justify-center gap-2 rounded-2xl border border-gold/30 bg-gold-wash px-4 py-4">
        <span className="text-sm text-ink-soft">{t.payment.amountLabel}</span>
        <span className="numeric text-3xl font-bold text-gold-deep">{tier.price}</span>
        <span className="text-sm font-medium text-gold-deep">{t.common.egp}</span>
      </div>

      {/* Only the bespoke tier asks for a brief, and it is required reading for the
          operator, so it is stored on the row rather than left in a chat thread. */}
      {tier.customDesign ? (
        <TextAreaField
          label={t.payment.customRequestLabel}
          hint={t.payment.customRequestHint}
          value={customRequest}
          onChange={(event) => setCustomRequest(event.target.value)}
          maxLength={1200}
          counterSuffix={t.build.charactersLeft}
          rows={5}
        />
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">{t.payment.instapayTitle}</h2>
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
      </section>

      <section className="flex flex-col gap-2">
        <CopyField
          label={t.payment.requestIdLabel}
          value={requestId}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
          emphasis
        />
        <p className="text-xs leading-relaxed text-ink-faint">{t.payment.requestIdHint}</p>
      </section>

      <TextField
        label={t.payment.phoneLabel}
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        placeholder={t.payment.phonePlaceholder}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={phoneError}
      />

      {isDesktop ? (
        <section className="rounded-2xl border border-line bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-ink">{t.payment.desktopTitle}</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{t.payment.desktopNote}</p>

          <pre className="mt-3 rounded-xl border border-line bg-cream px-3 py-3 text-start text-xs leading-relaxed whitespace-pre-wrap text-ink">
            {message}
          </pre>

          <button
            type="button"
            onClick={copyMessage}
            className={buttonClass('secondary', 'mt-3 w-full')}
          >
            {messageCopied ? t.common.copied : t.payment.copyMessage}
          </button>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleHandoff}
            className="mt-3 block text-center text-xs text-ink-faint underline underline-offset-4"
          >
            {t.payment.openAnyway}
          </a>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <p className="mb-2 text-center text-xs text-ink-soft">{t.payment.attachReminder}</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleHandoff}
            className={buttonClass('primary', 'w-full text-base')}
          >
            {t.payment.whatsappCta}
          </a>
        </div>
      </div>
    </div>
  );
}
