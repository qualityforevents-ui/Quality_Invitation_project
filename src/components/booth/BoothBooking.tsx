'use client';

import { useId, useState, useTransition } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { metaTrack } from '@/lib/meta/pixel';
import { TrackedSupportButton } from '@/components/site/TrackedSupportButton';
import { buildBoothEnquiryMessage } from '@/lib/whatsapp';
import { BOOTH_AREAS, BOOTH_PACKAGES, getBoothPackage } from '@/lib/photobooth/config';
import {
  handoffToWhatsApp,
  requestBooking,
  type RequestBookingResult,
} from '@/app/(site)/photobooth/actions';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * Picking a date, filling in the booking, and handing off to WhatsApp.
 *
 * One client component holding the whole sequence, rather than three that pass state
 * between them, because the three are not independent: the form cannot open until a
 * date is chosen, the price cannot be shown until a package is, and the summary is the
 * form's answer. Splitting them would mean lifting all of this state into a parent
 * anyway and gaining two more files.
 *
 * It reveals itself in the same order the builder does, and for the same reason. A
 * booking form with ten fields visible at once, on a phone, is a form people close.
 */

type Stage = 'picking' | 'filling' | 'done';

export function BoothBooking({
  lang,
  t,
  initialPackage,
}: {
  lang: Lang;
  t: Dictionary;
  /** From `?package=` so an ad can land somebody on a tier already chosen. */
  initialPackage: string;
}) {
  const formId = useId();

  const [date, setDate] = useState<string | null>(null);
  const [packageId, setPackageId] = useState(initialPackage);
  const [hours, setHours] = useState(() => getBoothPackage(initialPackage).hours);
  const [stage, setStage] = useState<Stage>('picking');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [booking, setBooking] = useState<Extract<RequestBookingResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();

  const tier = getBoothPackage(packageId);
  const extraHours = Math.max(0, hours - tier.hours);
  const runningTotal = tier.price + extraHours * tier.extraHourPrice;

  function chooseDate(value: string) {
    setDate(value);
    setAlternatives([]);
    setProblem(null);
    if (stage === 'picking') setStage('filling');
  }

  function submit(formData: FormData) {
    setProblem(null);
    setFieldErrors({});
    setAlternatives([]);

    startTransition(async () => {
      const result = await requestBooking(formData);

      if (result.ok) {
        /*
         * The browser's half of the Lead. The server copy is sent by the mirror route,
         * which reads the booth cookie this request has just set and attaches the
         * hashed phone number, so Meta can match the person rather than only the
         * browser. Both copies carry the same event id and collapse into one.
         */
        metaTrack('Lead', {
          content_category: 'photobooth',
          content_name: tier.id,
          value: result.price,
          currency: 'EGP',
        });

        setBooking(result);
        setStage('done');
        return;
      }

      switch (result.error) {
        case 'invalid':
          setFieldErrors(result.fields);
          // A field level error needs no banner: the message is beside the field. A
          // schema failure with no field, which is the honeypot, gets the generic one.
          if (Object.keys(result.fields).length === 0) setProblem(t.photobooth.errorServer);
          break;
        case 'taken':
          setProblem(t.photobooth.errorTaken);
          setAlternatives(result.alternatives);
          setDate(null);
          break;
        case 'rate':
          setProblem(t.photobooth.errorRate);
          break;
        default:
          setProblem(t.photobooth.errorServer);
      }
    });
  }

  /**
   * The moment the date actually stops being for sale.
   *
   * The navigation waits for the server, which is unusual and is the right way round
   * here. The alternative is to let the link go and hold the unit in the background,
   * and then two people who both tapped for the last booth both land in WhatsApp
   * believing they have it. Better to make one of them wait half a second and tell the
   * other one the truth while they are still on the page.
   *
   * `window.location.href` rather than `window.open`, because a popup opened after an
   * await is blocked by every mobile browser. A top level navigation is not.
   */
  function confirmOnWhatsApp() {
    if (!booking) return;

    startTransition(async () => {
      metaTrack('BoothWhatsAppHandoff', {
        content_category: 'photobooth',
        content_name: tier.id,
        value: booking.price,
        currency: 'EGP',
      });

      const result = await handoffToWhatsApp(booking.id);

      if (result.ok) {
        window.location.href = result.whatsappUrl;
        return;
      }

      if (result.error === 'taken') {
        setProblem(t.photobooth.errorTaken);
        setAlternatives(result.alternatives);
        setBooking(null);
        setDate(null);
        setStage('picking');
        return;
      }

      setProblem(t.photobooth.errorServer);
    });
  }

  const supportMessage = buildBoothEnquiryMessage(lang, {
    eventDate: date,
    packageName: lang === 'AR' ? tier.nameAr : tier.nameEn,
  });

  const support = (
    <TrackedSupportButton
      message={supportMessage}
      label={t.landing.support}
      page="photobooth"
      contentCategory="photobooth"
    />
  );

  /*
   * The summary screen gets no floating bubble.
   *
   * Its primary action is already a full width green WhatsApp button, and a second
   * green WhatsApp circle in the corner is not a second option, it is a trap: tapping
   * it sends a general enquiry instead of the booking confirmation, and the date the
   * customer thinks they have just taken is still on sale. Support is one screen back,
   * and the message they are about to send opens a conversation anyway.
   */
  if (stage === 'done' && booking) {
    return (
      <>
        <Summary
          t={t}
          booking={booking}
          date={date ?? ''}
          packageName={lang === 'AR' ? tier.nameAr : tier.nameEn}
          pending={pending}
          problem={problem}
          onConfirm={confirmOnWhatsApp}
        />
      </>
    );
  }

  return (
    <div>
      {support}

      <h2 className="text-xl font-bold">{t.photobooth.calendarTitle}</h2>
      <p className="mt-1.5 text-sm text-ink-soft">{t.photobooth.calendarSub}</p>

      <div className="mt-4">
        <AvailabilityCalendar lang={lang} t={t} selected={date} onSelect={chooseDate} />
      </div>

      {problem ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{problem}</span>
          </p>

          {alternatives.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-medium">{t.photobooth.errorTakenSuggest}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {alternatives.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseDate(option)}
                    className="numeric press rounded-full border border-gold/50 bg-white px-3 py-1.5 text-xs font-medium text-gold-deep"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/*
        The form exists only once a date does. Not merely hidden: an empty booking form
        under an empty calendar is the page asking for ten answers before it has given
        the visitor the one thing they came for, which is whether their night is free.
      */}
      {stage !== 'picking' && date ? (
        <form
          id={formId}
          action={submit}
          className="mt-8 rounded-xl border border-line bg-white/60 p-5"
        >
          <h3 className="text-lg font-bold">{t.photobooth.formTitle}</h3>
          <p className="mt-1 text-sm text-ink-soft">{t.photobooth.formSub}</p>

          <input type="hidden" name="eventDate" value={date} />
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="packageId" value={packageId} />

          {/*
            The honeypot. Hidden from the layout and from assistive technology, and
            never focusable, so no human can fill it in by accident; a form filling bot
            fills everything it finds. autoComplete off keeps a password manager from
            helpfully completing it and locking a real customer out of their own booking.
          */}
          <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
            <label htmlFor={`${formId}-website`}>Website</label>
            <input
              id={`${formId}-website`}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <Field label={t.photobooth.fieldDate} error={fieldErrors.eventDate}>
              <p className="numeric rounded-md border border-line bg-cream-deep px-3 py-2 text-sm font-medium">
                {date}
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t.photobooth.fieldStart} error={fieldErrors.startTime}>
                <Input type="time" name="startTime" defaultValue="20:00" required />
              </Field>

              <Field label={t.photobooth.fieldHours} error={fieldErrors.hours}>
                <NativeSelect
                  name="hours"
                  value={String(hours)}
                  onChange={(value) => setHours(Number(value))}
                >
                  {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <Field label={t.photobooth.fieldPackage}>
              <NativeSelect
                name="packageDisplay"
                value={packageId}
                onChange={(value) => {
                  setPackageId(value);
                  setHours(getBoothPackage(value).hours);
                }}
              >
                {BOOTH_PACKAGES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {lang === 'AR' ? option.nameAr : option.nameEn} · {option.price}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field
              label={t.photobooth.fieldVenue}
              hint={t.photobooth.fieldVenueHint}
              error={fieldErrors.venue}
            >
              <Input name="venue" required maxLength={160} />
            </Field>

            <Field label={t.photobooth.fieldArea} error={fieldErrors.area}>
              <NativeSelect name="area" defaultValue={BOOTH_AREAS[0].id}>
                {BOOTH_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {lang === 'AR' ? area.nameAr : area.nameEn}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label={t.photobooth.fieldEventType} error={fieldErrors.eventType}>
              <NativeSelect name="eventType" defaultValue="WEDDING">
                <option value="WEDDING">{t.photobooth.eventTypeWedding}</option>
                <option value="ENGAGEMENT">{t.photobooth.eventTypeEngagement}</option>
                <option value="KATB_KETAB">{t.photobooth.eventTypeKatb}</option>
                <option value="BIRTHDAY">{t.photobooth.eventTypeBirthday}</option>
                <option value="CORPORATE">{t.photobooth.eventTypeCorporate}</option>
                <option value="OTHER">{t.photobooth.eventTypeOther}</option>
              </NativeSelect>
            </Field>

            <Field label={t.photobooth.fieldName} error={fieldErrors.customerName}>
              <Input name="customerName" required maxLength={80} autoComplete="name" />
            </Field>

            <Field
              label={t.photobooth.fieldPhone}
              hint={t.photobooth.fieldPhoneHint}
              error={fieldErrors.customerPhone}
            >
              {/*
                inputMode numeric rather than type="tel" alone, so an Egyptian phone
                gets the number pad and not the full keyboard. dir ltr because a phone
                number typed into an RTL field has its digits reordered on screen.
              */}
              <Input
                name="customerPhone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                required
                autoComplete="tel"
                placeholder="01xxxxxxxxx"
              />
            </Field>

            <Field
              label={t.photobooth.fieldNotes}
              hint={t.photobooth.fieldNotesHint}
              error={fieldErrors.notes}
            >
              <Textarea name="notes" rows={3} maxLength={600} />
            </Field>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-ink-soft">{t.photobooth.summaryTotal}</span>
            <span>
              <span className="numeric text-xl font-bold">{runningTotal}</span>{' '}
              <span className="text-sm text-ink-soft">{t.home.currency}</span>
            </span>
          </div>

          <Button type="submit" size="lg" disabled={pending} className="mt-4 w-full rounded-full">
            {pending ? t.photobooth.submitting : t.photobooth.submit}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="ms-2 text-xs text-ink-faint">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

/**
 * A plain select, styled to match the rest of the inputs.
 *
 * Native rather than the Radix Select used elsewhere in this codebase, and that is a
 * considered exception rather than an oversight. This form is submitted to a server
 * action as FormData, and a Radix select is a button and a portal with a hidden input
 * bolted on, which is one more thing between the customer's answer and the request. On
 * a phone the native control is also the better one: it opens the platform's own wheel,
 * it is reachable with the keyboard, and it needs no JavaScript to have a value.
 */
function NativeSelect({
  name,
  value,
  defaultValue,
  onChange,
  children,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      className={cn(
        'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm',
      )}
    >
      {children}
    </select>
  );
}

function Summary({
  t,
  booking,
  date,
  packageName,
  pending,
  problem,
  onConfirm,
}: {
  t: Dictionary;
  booking: Extract<RequestBookingResult, { ok: true }>;
  date: string;
  packageName: string;
  pending: boolean;
  problem: string | null;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-xl border border-gold/40 bg-gold-wash p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold-deep">
        <CircleCheck className="size-5" aria-hidden="true" />
        {t.photobooth.summaryTitle}
      </p>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <Row label={t.photobooth.summaryBooking} value={booking.bookingId} numeric />
        <Row label={t.photobooth.summaryDate} value={date} numeric />
        <Row label={t.photobooth.summaryPackage} value={packageName} />
        <Row
          label={t.photobooth.summaryTotal}
          value={`${booking.price}`}
          suffix={t.home.currency}
          numeric
        />
        <Row
          label={t.photobooth.summaryDeposit}
          value={`${booking.deposit}`}
          suffix={t.home.currency}
          numeric
          emphasis
        />
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-ink-soft">{t.photobooth.summaryNote}</p>

      {problem ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {problem}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        disabled={pending}
        onClick={onConfirm}
        className="mt-4 w-full rounded-full bg-whatsapp text-base text-white hover:bg-whatsapp-deep"
      >
        {pending ? t.photobooth.submitting : t.photobooth.summaryCta}
      </Button>

      <p className="mt-2 text-center text-xs text-ink-faint">{t.photobooth.summaryHoldNote}</p>
    </div>
  );
}

function Row({
  label,
  value,
  suffix,
  numeric = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  numeric?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={cn('text-end', emphasis && 'font-bold text-gold-deep')}>
        {/* `numeric` forces LTR to stop the bidi algorithm reordering digits inside
            Arabic, so it may only ever wrap bare digits, never digits plus a word. */}
        <span className={numeric ? 'numeric font-medium' : 'font-medium'}>{value}</span>
        {suffix ? <span className="ms-1 text-xs text-ink-soft">{suffix}</span> : null}
      </dd>
    </div>
  );
}
