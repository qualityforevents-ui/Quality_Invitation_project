'use client';

import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from './SectionShell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { PACKAGES } from '@/lib/packages';
import { isGoogleMapsUrl } from '@/lib/validation';
import { formatEventTimeParts } from '@/lib/format';
import { BRIEF_MAX, MESSAGE_MAX, TIME_PATTERN } from '@/lib/flow/values';
import type { Dictionary } from '@/i18n/ui';
import type { EventType, Lang, Package } from '@/generated/prisma/enums';

/**
 * A form wrapper, so the soft keyboard's own blue Next key advances the flow.
 *
 * Most customers never reach for the button underneath: they finish the word and press
 * the key their thumb is already on. Every typed question is therefore a real form with
 * a submit handler rather than an input with a button beside it.
 */
function QuestionForm({ onSubmit, children }: { onSubmit: () => void; children: React.ReactNode }) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return <form onSubmit={handleSubmit}>{children}</form>;
}

/* ------------------------------------------------------------------ package */

export function PackageSection({
  t,
  lang,
  value,
  onChange,
}: {
  t: Dictionary;
  lang: Lang;
  value: Package;
  onChange: (next: Package) => void;
}) {
  const isArabic = lang === 'AR';

  return (
    <SectionShell title={t.flow.packageTitle} hint={t.landing.packagesSub}>
      <div role="radiogroup" aria-label={t.flow.packageTitle} className="flex flex-col gap-3">
        {PACKAGES.map((tier) => {
          const selected = tier.id === value;
          const highlighted = tier.id === 'UNLIMITED';

          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(tier.id)}
              className={cn(
                'press-soft relative rounded-xl border-2 px-4 py-4 text-start',
                selected ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-primary/40',
              )}
            >
              {highlighted ? (
                <Badge className="absolute -top-2.5 end-3 bg-primary text-primary-foreground">
                  {t.landing.packagesPopular}
                </Badge>
              ) : null}

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-bold">{isArabic ? tier.nameAr : tier.nameEn}</span>
                <span className="shrink-0">
                  <span className="numeric text-xl font-bold text-secondary-foreground">{tier.price}</span>
                  <span className="ms-1 text-xs font-medium text-secondary-foreground">{t.common.egp}</span>
                </span>
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {isArabic ? tier.taglineAr : tier.taglineEn}
              </p>

              <ul className="mt-3 flex flex-col gap-1.5">
                {(isArabic ? tier.featuresAr : tier.featuresEn).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs leading-snug">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- names */

export function NameSection({
  t,
  title,
  hint,
  placeholder,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  title: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const empty = value.trim().length === 0;

  return (
    <SectionShell
      title={title}
      hint={hint}
      onNext={() => {
        setTouched(true);
        if (!empty) onNext();
      }}
      nextLabel={t.flow.next}
      blockedReason={touched && empty ? t.errors.required : undefined}
    >
      <QuestionForm
        onSubmit={() => {
          setTouched(true);
          if (!empty) onNext();
        }}
      >
        <Input
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={60}
          autoComplete="off"
          enterKeyHint="next"
          aria-label={title}
          aria-invalid={touched && empty ? true : undefined}
          className="h-12"
        />
      </QuestionForm>
    </SectionShell>
  );
}

/* ----------------------------------------------------------------- occasion */

export function OccasionSection({
  t,
  value,
  onChange,
}: {
  t: Dictionary;
  value: EventType;
  onChange: (next: EventType) => void;
}) {
  const options: Array<{ value: EventType; label: string }> = [
    { value: 'ENGAGEMENT', label: t.build.eventTypeEngagement },
    { value: 'WEDDING', label: t.build.eventTypeWedding },
    { value: 'KATB_KETAB', label: t.build.eventTypeKatbKetab },
  ];

  return (
    <SectionShell title={t.flow.occasionTitle}>
      <ToggleGroup
        type="single"
        value={value}
        /*
         * A second tap on the chosen item deselects in single mode and hands back an
         * empty string. Read as a confirmation of the current answer rather than
         * discarded, which matters more than it looks: this question opens with an
         * option already highlighted, so somebody who wants that option taps it, and
         * treating that tap as nothing leaves them on a question with no way out of it.
         * Tapping any option, including the one already lit, answers and advances.
         */
        onValueChange={(next) => onChange((next || value) as EventType)}
        variant="outline"
        className="grid w-full grid-cols-3 gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="tap-target h-12 rounded-xl text-sm data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </SectionShell>
  );
}

/* --------------------------------------------------------------------- date */

export function DateSection({
  t,
  today,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  /** Today in Cairo, resolved on the server so both sides agree what day it is. */
  today: string;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const missing = value.length === 0;

  return (
    <SectionShell
      title={t.flow.dateTitle}
      onNext={() => {
        setTouched(true);
        if (!missing) onNext();
      }}
      nextLabel={t.flow.next}
      blockedReason={touched && missing ? t.errors.required : undefined}
    >
      <QuestionForm
        onSubmit={() => {
          setTouched(true);
          if (!missing) onNext();
        }}
      >
        {/*
          The native picker rather than a rendered calendar. A wedding date is months
          out, and the wheel an iPhone opens for this input jumps months in one gesture
          where a grid needs a tap per month. `dir="ltr"` is safe here and only here
          because the value is bare digits and separators with no Arabic word in it.
        */}
        <Input
          type="date"
          dir="ltr"
          min={today}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t.flow.dateTitle}
          aria-invalid={touched && missing ? true : undefined}
          className="h-12 text-center"
        />
      </QuestionForm>
    </SectionShell>
  );
}

/* --------------------------------------------------------------------- time */

/** The hours an Egyptian wedding or engagement actually starts at. */
const COMMON_TIMES = ['18:00', '19:00', '20:00', '21:00'];

export function TimeSection({
  t,
  lang,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  lang: Lang;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}) {
  const isCommon = COMMON_TIMES.includes(value);
  const [custom, setCustom] = useState(!isCommon && value.length > 0);

  function label(time: string): string {
    const { clock, period } = formatEventTimeParts(time, lang);
    return `${clock} ${period}`;
  }

  return (
    <SectionShell
      title={t.flow.timeTitle}
      // A tap on one of the four common hours is the answer and the advance together.
      // Only the fallback, where somebody types an unusual time, needs a button.
      onNext={custom ? onNext : undefined}
      nextLabel={custom ? t.flow.next : undefined}
      blockedReason={custom && !TIME_PATTERN.test(value) ? t.errors.required : undefined}
    >
      <div className="grid grid-cols-2 gap-2">
        {COMMON_TIMES.map((time) => {
          const selected = !custom && value === time;
          return (
            <Button
              key={time}
              type="button"
              variant="outline"
              onClick={() => {
                setCustom(false);
                onChange(time);
              }}
              aria-pressed={selected}
              className={cn(
                'tap-target h-12 rounded-xl text-base',
                selected && 'border-primary bg-secondary text-secondary-foreground',
              )}
            >
              <bdi>{label(time)}</bdi>
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => setCustom(true)}
        aria-pressed={custom}
        className={cn('mt-2 w-full rounded-xl', custom ? 'text-secondary-foreground' : 'text-muted-foreground')}
      >
        {t.flow.timeOther}
      </Button>

      {custom ? (
        <div className="rise mt-2">
          <Input
            type="time"
            dir="ltr"
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={t.flow.timeTitle}
            className="h-12 text-center"
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- venue */

export function VenueSection({
  t,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const empty = value.trim().length === 0;

  return (
    <SectionShell
      title={t.flow.venueTitle}
      onNext={() => {
        setTouched(true);
        if (!empty) onNext();
      }}
      nextLabel={t.flow.next}
      blockedReason={touched && empty ? t.errors.required : undefined}
    >
      <QuestionForm
        onSubmit={() => {
          setTouched(true);
          if (!empty) onNext();
        }}
      >
        <Input
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.build.venuePlaceholder}
          maxLength={120}
          enterKeyHint="next"
          aria-label={t.flow.venueTitle}
          aria-invalid={touched && empty ? true : undefined}
          className="h-12"
        />
      </QuestionForm>
    </SectionShell>
  );
}

/* ---------------------------------------------------------------- map link */

export function MapSection({
  t,
  value,
  onChange,
  onNext,
  onSkip,
}: {
  t: Dictionary;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const trimmed = value.trim();
  const invalid = trimmed.length > 0 && !isGoogleMapsUrl(trimmed);

  return (
    <SectionShell
      title={t.flow.mapTitle}
      hint={t.build.venueMapHint}
      onNext={() => {
        if (!invalid) onNext();
      }}
      nextLabel={t.flow.next}
      // Never silently dropped. A link that fails validation is left out of the patch,
      // so advancing with one still in the field would leave the customer believing
      // their venue is pinned when nothing was stored.
      blockedReason={invalid ? t.errors.mapUrl : undefined}
      onSkip={onSkip}
      skipLabel={t.flow.mapSkip}
    >
      <QuestionForm
        onSubmit={() => {
          if (!invalid) onNext();
        }}
      >
        <Input
          type="url"
          inputMode="url"
          dir="ltr"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://maps.app.goo.gl/..."
          enterKeyHint="next"
          aria-label={t.flow.mapTitle}
          aria-invalid={invalid ? true : undefined}
          className="h-12"
        />
      </QuestionForm>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ message */

export function MessageSection({
  t,
  value,
  onChange,
  onNext,
  onSkip,
}: {
  t: Dictionary;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <SectionShell
      title={t.flow.messageTitle}
      onNext={onNext}
      nextLabel={t.flow.next}
      onSkip={onSkip}
      skipLabel={t.flow.messageSkip}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-end">
          <span className="text-xs text-muted-foreground">
            <span className="numeric">{MESSAGE_MAX - value.length}</span> {t.build.charactersLeft}
          </span>
        </div>
        <Textarea
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.build.customMessagePlaceholder}
          maxLength={MESSAGE_MAX}
          rows={3}
          aria-label={t.flow.messageTitle}
          className="resize-none"
        />
      </div>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- brief */

export function BriefSection({
  t,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}) {
  return (
    <SectionShell
      title={t.flow.briefTitle}
      hint={t.payment.customRequestHint}
      onNext={onNext}
      nextLabel={t.flow.next}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-end">
          <span className="text-xs text-muted-foreground">
            <span className="numeric">{BRIEF_MAX - value.length}</span> {t.build.charactersLeft}
          </span>
        </div>
        <Textarea
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={BRIEF_MAX}
          rows={5}
          aria-label={t.flow.briefTitle}
          className="resize-none"
        />
      </div>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- phone */

export function PhoneSection({
  t,
  value,
  onChange,
  onNext,
  invalid,
}: {
  t: Dictionary;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
  invalid: boolean;
}) {
  const [touched, setTouched] = useState(false);

  return (
    <SectionShell
      title={t.flow.phoneTitle}
      hint={t.flow.phoneHint}
      onNext={() => {
        setTouched(true);
        if (!invalid) onNext();
      }}
      nextLabel={t.flow.next}
      blockedReason={touched && invalid ? t.payment.phoneError : undefined}
    >
      <QuestionForm
        onSubmit={() => {
          setTouched(true);
          if (!invalid) onNext();
        }}
      >
        <Label htmlFor="flow-phone" className="sr-only">
          {t.flow.phoneTitle}
        </Label>
        <Input
          id="flow-phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.payment.phonePlaceholder}
          enterKeyHint="done"
          aria-invalid={touched && invalid ? true : undefined}
          className="h-12 text-center"
        />
      </QuestionForm>
    </SectionShell>
  );
}
