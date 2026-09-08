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
import { formatEventDate, formatEventTimeParts, fromDateInputValue } from '@/lib/format';
import { BRIEF_MAX, MESSAGE_MAX, TIME_PATTERN } from '@/lib/flow/values';
import { invitationFontVariables } from '@/lib/fonts';
import { NO_VERSE_ID, VERSES, verseLabel } from '@/lib/verses';
import { sampleQuotes } from '@/lib/quotes';
import type { Dictionary } from '@/i18n/ui';
import type { EventType, Lang, Package } from '@/lib/types';

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
  onNext,
}: {
  t: Dictionary;
  lang: Lang;
  value: Package;
  onChange: (next: Package) => void;
  onNext: () => void;
}) {
  const isArabic = lang === 'AR';

  return (
    <SectionShell
      title={t.flow.packageTitle}
      hint={t.landing.packagesSub}
      onNext={onNext}
      nextLabel={t.flow.next}
    >
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
                /*
                 * Selection adds emphasis rather than tinting the card.
                 *
                 * It used to fill the chosen tier with the gold wash, which read as the
                 * card dimming: on the white panel these sit on, the wash is the darkest
                 * of the three surfaces, so choosing a plan made it look recessed while
                 * the two you had not chosen stayed bright. It also cost the thing that
                 * matters most on this card, the price, which fell from 5.1:1 on white to
                 * 4.38:1 on the wash and stopped clearing AA. So the fill stays white, the
                 * border and the lift carry the state, and the tick carries it again for
                 * anyone who does not separate gold from grey.
                 */
                'press-soft relative rounded-xl border-2 bg-card px-4 py-4 text-start transition',
                selected
                  ? 'border-primary shadow-[0_8px_24px_-12px_rgba(138,106,50,0.6)]'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/40',
              )}
            >
              {highlighted ? (
                /* Gold deep rather than gold: white on the lighter gold is 3.16:1, and
                   this is 12px bold text, which needs 4.5:1. This clears it at 5:1. */
                <Badge className="absolute -top-2.5 end-3 bg-gold-deep text-white">
                  {t.landing.packagesPopular}
                </Badge>
              ) : null}

              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-base font-bold">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition',
                      selected ? 'border-primary bg-primary' : 'border-border',
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <Check className="size-3 text-primary-foreground" /> : null}
                  </span>
                  {isArabic ? tier.nameAr : tier.nameEn}
                </span>
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
  onNext,
}: {
  t: Dictionary;
  value: EventType;
  onChange: (next: EventType) => void;
  onNext: () => void;
}) {
  const options: Array<{ value: EventType; label: string }> = [
    { value: 'ENGAGEMENT', label: t.build.eventTypeEngagement },
    { value: 'WEDDING', label: t.build.eventTypeWedding },
    { value: 'KATB_KETAB', label: t.build.eventTypeKatbKetab },
  ];

  return (
    <SectionShell title={t.flow.occasionTitle} onNext={onNext} nextLabel={t.flow.next}>
      <ToggleGroup
        type="single"
        value={value}
        // Single mode hands back an empty string when the chosen item is tapped again.
        // Held at the current value rather than cleared, so an answer can be changed but
        // never un made: there is no such thing as no occasion.
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

/* -------------------------------------------------------------------- verse */

/**
 * Which verse opens the card, or none.
 *
 * Every option shows the verse in full, in Amiri Quran, right to left, at a size it can
 * actually be read at. A list of surah references would be a list nobody can choose
 * from: people know this text by its words, not by its numbering, and picking the verse
 * that opens your own wedding invitation from the label "Ar-Rum 21" is not a choice, it
 * is a guess. The face is the one the card will use, for the reason it is used there —
 * U+FDFD and tashkeel are carried by almost nothing else — so what is chosen here is
 * what will be seen.
 *
 * This question is asked on Arabic cards only, which the flow decides, not this
 * component: the English card has neither Bismillah nor verse in any of its designs.
 */
export function VerseSection({
  t,
  uiLang,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  /** The builder's language. The verses themselves are Arabic either way. */
  uiLang: Lang;
  value: string;
  onChange: (verseId: string) => void;
  onNext: () => void;
}) {
  return (
    <SectionShell
      title={t.flow.verseTitle}
      hint={t.flow.verseHint}
      onNext={onNext}
      nextLabel={t.flow.next}
    >
      <div
        role="radiogroup"
        aria-label={t.flow.verseSummary}
        className={cn(invitationFontVariables, 'flex flex-col gap-2')}
      >
        {VERSES.map((verse) => {
          const selected = verse.id === value;

          return (
            <VerseOption
              key={verse.id}
              selected={selected}
              label={verseLabel(verse, uiLang)}
              onSelect={() => onChange(verse.id)}
            >
              {/*
                Held at rtl and lang="ar" whatever the builder is set to. An Egyptian
                customer building in English is still choosing Arabic scripture, and
                letting the surrounding interface direction reach this text would
                reorder it.
              */}
              <span
                lang="ar"
                dir="rtl"
                className="mt-1 block text-[1.0625rem] leading-[2] text-foreground"
                style={{ fontFamily: 'var(--font-amiri-quran), Georgia, serif' }}
              >
                {verse.text}
              </span>
            </VerseOption>
          );
        })}

        <VerseOption
          selected={value === NO_VERSE_ID}
          label={t.flow.verseNone}
          onSelect={() => onChange(NO_VERSE_ID)}
        >
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {t.flow.verseNoneHint}
          </span>
        </VerseOption>
      </div>
    </SectionShell>
  );
}

function VerseOption({
  selected,
  label,
  onSelect,
  children,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'press tap-target flex w-full gap-3 rounded-xl border px-3 py-3 text-start transition',
        selected ? 'border-primary bg-secondary' : 'border-border bg-card',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-primary bg-primary' : 'border-border',
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3 text-primary-foreground" /> : null}
      </span>

      <span className="flex-1">
        <span className="block text-xs tracking-wide text-muted-foreground">{label}</span>
        {children}
      </span>
    </button>
  );
}

/* --------------------------------------------------------------------- date */

export function DateSection({
  t,
  lang,
  today,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  /** The builder's language, which the native picker does not speak. */
  lang: Lang;
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
      // The field starts genuinely empty now, and an empty native date input on iOS
      // draws a blank box with no placeholder at all — nothing says it is tappable or
      // what it wants.
      hint={t.flow.dateHint}
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

        {/*
          The date again, in the language the card is being built in.

          A native date input renders in the PHONE's locale, not the page's, and nothing
          the page can set changes that — no lang attribute, no CSS. So an Egyptian
          customer with an English handset picks their wedding day and the form answers
          "18 Dec 2026" in the middle of an Arabic form. This line is the confirmation
          they can actually read, in the same wording the answered row and the card use,
          so the value they see here is the value they will see on the invitation.
        */}
        {!missing ? (
          <p className="mt-2 text-center text-sm font-medium text-foreground">
            {formatEventDate(fromDateInputValue(value) ?? new Date(), lang)}
          </p>
        ) : null}
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
  const [touched, setTouched] = useState(false);

  function label(time: string): string {
    const { clock, period } = formatEventTimeParts(time, lang);
    return `${clock} ${period}`;
  }

  const missing = !TIME_PATTERN.test(value);

  return (
    <SectionShell
      title={t.flow.timeTitle}
      /*
       * Guarded, not merely warned about. Next used to advance whatever the field held
       * and only print the reason underneath, which let somebody walk straight past this
       * question, and `createDraft` writes 20:00 into every row it creates. The result
       * was a wedding invitation carrying eight in the evening that nobody had chosen and
       * that nothing downstream could tell apart from a real answer.
       */
      onNext={() => {
        setTouched(true);
        if (!missing) onNext();
      }}
      nextLabel={t.flow.next}
      blockedReason={touched && missing ? t.errors.required : undefined}
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

          {/* Same reason as the date: the native picker says "9:00 PM" whatever the
              page language is. This says it the way the four buttons above say it. */}
          {!missing ? (
            <p className="mt-2 text-center text-sm font-medium text-foreground">
              <bdi>{label(value)}</bdi>
            </p>
          ) : null}
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
          placeholder={t.flow.mapPlaceholder}
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

/**
 * The one line of writing the couple choose.
 *
 * This used to be a bare textarea, and separately every card carried a fixed line of
 * classical verse that nobody picked. Two pieces of writing, only one of them theirs.
 * They are the same question now: tap a line you like, or write your own.
 *
 * The samples are shown in full and in the card's own language, for the same reason the
 * verses are — nobody chooses words from a label. Picking one and then typing is
 * allowed and means what it looks like: the typed version wins, and the sample it came
 * from stops being highlighted.
 */
export function MessageSection({
  t,
  lang,
  value,
  onChange,
  onNext,
  onSkip,
}: {
  t: Dictionary;
  /** The invitation's language, not the builder's: these words go on the card. */
  lang: Lang;
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const samples = sampleQuotes(lang);
  const [writingOwn, setWritingOwn] = useState(value.length > 0 && !samples.includes(value));

  return (
    <SectionShell
      title={t.flow.messageTitle}
      hint={t.flow.messageHint}
      onNext={onNext}
      nextLabel={t.flow.next}
      onSkip={onSkip}
      skipLabel={t.flow.messageSkip}
    >
      <div role="radiogroup" aria-label={t.flow.messageTitle} className="flex flex-col gap-2">
        {samples.map((sample) => {
          const selected = !writingOwn && value === sample;

          return (
            <button
              key={sample}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setWritingOwn(false);
                onChange(sample);
              }}
              className={cn(
                'press tap-target flex w-full gap-3 rounded-xl border px-3 py-3 text-start transition',
                selected ? 'border-primary bg-secondary' : 'border-border bg-card',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                  selected ? 'border-primary bg-primary' : 'border-border',
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="size-3 text-primary-foreground" /> : null}
              </span>

              {/*
                Held at the invitation's direction, not the builder's. Somebody building
                an Arabic card from an English interface is choosing Arabic words, and
                letting the surrounding direction reach them reorders the line.
              */}
              <span
                lang={lang === 'AR' ? 'ar' : 'en'}
                dir={lang === 'AR' ? 'rtl' : 'ltr'}
                className="flex-1 text-sm leading-relaxed text-foreground"
              >
                {sample}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          role="radio"
          aria-checked={writingOwn}
          onClick={() => {
            setWritingOwn(true);
            if (samples.includes(value)) onChange('');
          }}
          className={cn(
            'press tap-target flex w-full gap-3 rounded-xl border px-3 py-3 text-start transition',
            writingOwn ? 'border-primary bg-secondary' : 'border-border bg-card',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
              writingOwn ? 'border-primary bg-primary' : 'border-border',
            )}
            aria-hidden="true"
          >
            {writingOwn ? <Check className="size-3 text-primary-foreground" /> : null}
          </span>
          <span className="flex-1 text-sm font-medium text-foreground">{t.flow.messageOwn}</span>
        </button>

        {writingOwn ? (
          <div className="rise flex flex-col gap-1.5">
            <div className="flex items-baseline justify-end">
              <span className="text-xs text-muted-foreground">
                <span className="numeric">{MESSAGE_MAX - value.length}</span>{' '}
                {t.build.charactersLeft}
              </span>
            </div>
            <Textarea
              autoFocus
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={t.flow.messageOwnPlaceholder}
              maxLength={MESSAGE_MAX}
              rows={3}
              lang={lang === 'AR' ? 'ar' : 'en'}
              dir={lang === 'AR' ? 'rtl' : 'ltr'}
              aria-label={t.flow.messageTitle}
              className="resize-none"
            />
          </div>
        ) : null}
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
