'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SaveIndicator, SegmentedField, TextAreaField, TextField } from './Fields';
import { buttonClass } from '@/components/ui/Button';
import { useAutosave } from '@/lib/useAutosave';
import { isGoogleMapsUrl } from '@/lib/validation';
import type { Dictionary } from '@/i18n/ui';
import type { EventType, Lang, Package } from '@/generated/prisma/enums';

export type BuilderValues = {
  eventType: EventType;
  name1: string;
  name2: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueMapUrl: string;
  customMessage: string;
};

const MESSAGE_MAX = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/*
 * Today is passed in from the server rather than computed here.
 *
 * Calling new Date() during render asks the server and the browser the same question in
 * two different time zones. Vercel runs in UTC and the customer is in Cairo, so between
 * roughly 21:00 and midnight local the two disagree about what day it is, the min
 * attribute renders differently on each side, and React reports a hydration mismatch on
 * every page load for those three hours. A mismatch can cost the whole tree its event
 * handlers, which looks exactly like a page where nothing responds to a tap.
 */

export function BuildForm({
  initial,
  lang,
  t,
  today,
  packageId,
}: {
  initial: BuilderValues;
  lang: Lang;
  t: Dictionary;
  /** Today in Cairo, "YYYY-MM-DD", resolved on the server so both sides agree. */
  today: string;
  /** Chosen on the landing page. Stored with the first save so it is never lost. */
  packageId: Package;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<BuilderValues>(initial);
  // Required field errors stay hidden until the customer tries to move on. Flagging
  // an empty form the moment it loads is just scolding somebody for not having typed
  // anything yet.
  const [attemptedContinue, setAttemptedContinue] = useState(false);

  function set<K extends keyof BuilderValues>(key: K, value: BuilderValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const mapUrlError =
    values.venueMapUrl.trim().length > 0 && !isGoogleMapsUrl(values.venueMapUrl)
      ? t.errors.mapUrl
      : undefined;

  const missing = {
    name1: values.name1.trim().length === 0,
    name2: values.name2.trim().length === 0,
    venueName: values.venueName.trim().length === 0,
    eventDate: !DATE_PATTERN.test(values.eventDate),
    eventTime: !TIME_PATTERN.test(values.eventTime),
  };

  const isComplete = !Object.values(missing).some(Boolean);

  /**
   * Anything that would fail server validation is left out rather than sent and
   * rejected. A rejected patch saves none of its fields, so one half typed map link
   * would otherwise stop the customer's name from being stored.
   */
  const patch = useMemo(() => {
    const next: Record<string, unknown> = {
      uiLang: lang,
      package: packageId,
      eventType: values.eventType,
      name1: values.name1,
      name2: values.name2,
      venueName: values.venueName,
      customMessage: values.customMessage,
    };

    if (DATE_PATTERN.test(values.eventDate)) next.eventDate = values.eventDate;
    if (TIME_PATTERN.test(values.eventTime)) next.eventTime = values.eventTime;
    if (!mapUrlError) next.venueMapUrl = values.venueMapUrl;

    return next;
  }, [values, lang, mapUrlError, packageId]);

  const { status: saveStatus, flush } = useAutosave(patch);

  /**
   * Names the fields that are missing, in the order they appear on the form.
   *
   * "This field is required" under an input the customer cannot see is not an error
   * message, it is silence. On a phone the required fields are at the top and the
   * button is pinned to the bottom, so by the time somebody taps it the problem is well
   * off screen.
   */
  const missingLabels = [
    missing.name1 ? t.build.name1 : null,
    missing.name2 ? t.build.name2 : null,
    missing.eventDate ? t.build.eventDate : null,
    missing.eventTime ? t.build.eventTime : null,
    missing.venueName ? t.build.venueName : null,
  ].filter(Boolean) as string[];

  async function handleContinue() {
    setAttemptedContinue(true);

    if (!isComplete) {
      // Take them to the problem rather than leaving them to hunt for it.
      const firstInvalid = formRef.current?.querySelector('[aria-invalid="true"]');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Anything typed in the last fraction of a second is still on the debounce, and the
    // cached copy of the next step still shows the old names in its theme miniatures.
    await flush();
    router.refresh();
    router.push('/build/theme');
  }

  const showMissing = attemptedContinue;

  return (
    <div ref={formRef} className="flex flex-col gap-6 pb-32">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.build.heading}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t.build.sub}</p>
        </div>
        <SaveIndicator
          status={saveStatus}
          savingLabel={t.common.saving}
          savedLabel={t.common.saved}
          errorLabel={t.errors.saveFailedShort}
        />
      </div>

      <SegmentedField
        label={t.build.eventType}
        value={values.eventType}
        onChange={(value) => set('eventType', value)}
        options={[
          { value: 'ENGAGEMENT', label: t.build.eventTypeEngagement },
          { value: 'WEDDING', label: t.build.eventTypeWedding },
          { value: 'KATB_KETAB', label: t.build.eventTypeKatbKetab },
        ]}
      />

      <div className="flex flex-col gap-4">
        <TextField
          label={t.build.name1}
          placeholder={t.build.name1Placeholder}
          value={values.name1}
          onChange={(event) => set('name1', event.target.value)}
          error={showMissing && missing.name1 ? t.errors.required : undefined}
          autoComplete="off"
          maxLength={60}
        />
        <TextField
          label={t.build.name2}
          placeholder={t.build.name2Placeholder}
          value={values.name2}
          onChange={(event) => set('name2', event.target.value)}
          error={showMissing && missing.name2 ? t.errors.required : undefined}
          hint={t.build.namesHint}
          autoComplete="off"
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t.build.eventDate}
          type="date"
          min={today}
          value={values.eventDate}
          onChange={(event) => set('eventDate', event.target.value)}
          error={showMissing && missing.eventDate ? t.errors.required : undefined}
        />
        <TextField
          label={t.build.eventTime}
          type="time"
          value={values.eventTime}
          onChange={(event) => set('eventTime', event.target.value)}
          error={showMissing && missing.eventTime ? t.errors.required : undefined}
        />
      </div>

      <TextField
        label={t.build.venueName}
        placeholder={t.build.venuePlaceholder}
        value={values.venueName}
        onChange={(event) => set('venueName', event.target.value)}
        error={showMissing && missing.venueName ? t.errors.required : undefined}
        maxLength={120}
      />

      <TextField
        label={t.build.venueMapUrl}
        optionalLabel={t.common.optional}
        type="url"
        inputMode="url"
        dir="ltr"
        placeholder="https://maps.app.goo.gl/..."
        value={values.venueMapUrl}
        onChange={(event) => set('venueMapUrl', event.target.value)}
        hint={t.build.venueMapHint}
        error={mapUrlError}
      />

      <TextAreaField
        label={t.build.customMessage}
        optionalLabel={t.common.optional}
        placeholder={t.build.customMessagePlaceholder}
        value={values.customMessage}
        onChange={(event) => set('customMessage', event.target.value)}
        maxLength={MESSAGE_MAX}
        counterSuffix={t.build.charactersLeft}
      />

      {/* Floating so the way forward is always under the thumb, never scrolled past. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleContinue}
            className={buttonClass('primary', 'w-full text-lg')}
          >
            {t.build.toTheme}
          </button>
          {showMissing && missingLabels.length > 0 ? (
            <p className="mt-2 text-center text-xs leading-relaxed text-danger">
              {t.errors.missingFields}: {missingLabels.join('، ')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
