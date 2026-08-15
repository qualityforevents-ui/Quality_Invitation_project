'use client';

import { ArrowLeft, Check, Eye } from 'lucide-react';
import { SectionShell } from './SectionShell';
import { MusicSelector } from './MusicSelector';
import { PhotoUpload } from './PhotoUpload';
import { MiniInvitation } from '@/components/invitation/MiniInvitation';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/cn';
import { scriptSuggestions } from '@/lib/flow/values';
import { getTheme, THEMES, themeName } from '@/themes/registry';
import type { PhotoCrop } from '@/lib/photo-url';
import type { Dictionary } from '@/i18n/ui';
import type { EventType, Lang } from '@/generated/prisma/enums';

/* ----------------------------------------------------------------- language */

export function LanguageSection({
  t,
  value,
  name1,
  name2,
  onChange,
  onConvert,
  onKeepNames,
}: {
  t: Dictionary;
  value: Lang;
  name1: string;
  name2: string;
  onChange: (next: Lang) => void;
  onConvert: (names: { name1: string; name2: string }) => void;
  /** Dismisses the offer and moves on with the names exactly as they were typed. */
  onKeepNames: () => void;
}) {
  /*
   * Offered, never imposed, and in both directions. An Arabic card with Latin names
   * offers Arabic spellings; an English card with Arabic names offers Latin ones, which
   * is also the road back for somebody who converted and then changed language.
   *
   * The customer accepting is what makes conversion safe: the same name is spelled
   * differently by different families, and only its owner knows which is theirs, so the
   * machine proposes and the person decides.
   */
  const suggestions = scriptSuggestions(value, name1, name2);

  return (
    <SectionShell title={t.flow.langTitle} hint={t.theme.invitationLangHint}>
      <ToggleGroup
        type="single"
        value={value}
        // Tapping the language already highlighted confirms it rather than clearing
        // it. See the same note on the occasion question.
        onValueChange={(next) => onChange((next || value) as Lang)}
        variant="outline"
        className="grid w-full grid-cols-2 gap-2"
      >
        <ToggleGroupItem
          value="AR"
          className="tap-target h-12 rounded-xl text-base data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
        >
          العربية
        </ToggleGroupItem>
        <ToggleGroupItem
          value="EN"
          className="tap-target h-12 rounded-xl text-base data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
        >
          English
        </ToggleGroupItem>
      </ToggleGroup>

      {suggestions.length > 0 ? (
        <div className="rise mt-4 rounded-xl border border-primary/40 bg-secondary px-4 py-3">
          <p className="text-xs leading-relaxed">
            {value === 'AR' ? t.theme.convertOffer : t.theme.convertOfferLatin}
          </p>

          {/*
            One button for the pair, carrying both spellings on its face. Seeing the
            exact result before tapping is what makes the conversion the customer's
            decision rather than the machine's.
          */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = { name1, name2 };
              for (const entry of suggestions) next[entry.key] = entry.next;
              onConvert(next);
            }}
            className="mt-2.5 h-auto w-full flex-col gap-0.5 rounded-xl bg-card py-2.5"
          >
            {suggestions.map((entry) => (
              <span key={entry.key} className="flex items-baseline justify-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  <bdi>{entry.current}</bdi>
                </span>
                <span className="text-primary" aria-hidden="true">
                  {'←'}
                </span>
                <span className="text-sm font-semibold text-secondary-foreground">
                  <bdi>{entry.next}</bdi>
                </span>
              </span>
            ))}
          </Button>

          <Button
            type="button"
            variant="link"
            onClick={onKeepNames}
            className="mt-1 h-auto p-0 text-xs text-muted-foreground"
          >
            {t.theme.scriptMismatchCta}
          </Button>
        </div>
      ) : null}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- theme */

export function ThemeSection({
  t,
  uiLang,
  invitationLang,
  name1,
  name2,
  eventDate,
  eventType,
  value,
  onChange,
  onTry,
}: {
  t: Dictionary;
  uiLang: Lang;
  invitationLang: Lang;
  name1: string;
  name2: string;
  eventDate: Date;
  eventType: EventType;
  value: string;
  onChange: (themeId: string) => void;
  /** Opens the full screen preview on a design that has not been chosen. */
  onTry: (themeId: string) => void;
}) {
  return (
    <SectionShell title={t.flow.themeTitle}>
      <div role="radiogroup" aria-label={t.flow.themeTitle} className="flex flex-col gap-3">
        {THEMES.map((theme) => {
          const selected = theme.id === value;

          return (
            <div
              key={theme.id}
              className={cn(
                'overflow-hidden rounded-xl border-2 transition',
                selected ? 'border-primary' : 'border-border',
              )}
            >
              {/*
                The miniature selects the design, and the eye beside its name opens it
                full screen. Kept as siblings rather than nesting one inside the other:
                a control inside a control is invalid markup and browsers disagree about
                which of the two a tap belongs to.
              */}
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={themeName(theme, uiLang)}
                onClick={() => onChange(theme.id)}
                className="press-soft block w-full text-start"
              >
                <MiniInvitation
                  themeId={theme.id}
                  lang={invitationLang}
                  name1={name1}
                  name2={name2}
                  eventDate={eventDate}
                  eventType={eventType}
                />
              </button>

              <div className="flex items-center gap-2 bg-card px-3 py-2">
                <span className="text-sm font-medium">{themeName(theme, uiLang)}</span>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onTry(theme.id)}
                  aria-label={t.theme.themeView}
                  title={t.theme.themeView}
                  className="ms-auto rounded-full"
                >
                  <Eye aria-hidden="true" />
                </Button>

                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border',
                    selected ? 'border-primary bg-primary' : 'border-border',
                  )}
                  aria-hidden="true"
                >
                  {selected ? <Check className="size-3 text-primary-foreground" /> : null}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- music */

export function MusicSection({
  t,
  uiLang,
  value,
  onChange,
  onNext,
}: {
  t: Dictionary;
  uiLang: Lang;
  value: string;
  onChange: (trackId: string) => void;
  onNext: () => void;
}) {
  return (
    <SectionShell
      title={t.flow.musicTitle}
      hint={t.theme.musicHint}
      // Advancing on select would cut off a track the customer is in the middle of
      // listening to, which is the one thing this question is for.
      onNext={onNext}
      nextLabel={t.flow.next}
    >
      <MusicSelector selectedId={value} lang={uiLang} t={t} onSelect={onChange} />
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- photo */

export function PhotoSection({
  t,
  enabled,
  initialPhotoPath,
  hasPhoto,
  onSaved,
  onNext,
  onSkip,
}: {
  t: Dictionary;
  /** False until the ImageKit keys are set, which keeps the question usable without them. */
  enabled: boolean;
  initialPhotoPath: string | null;
  hasPhoto: boolean;
  onSaved: (value: { photoPath: string | null; crop: PhotoCrop | null }) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <SectionShell
      title={t.flow.photoTitle}
      onNext={hasPhoto ? onNext : undefined}
      nextLabel={hasPhoto ? t.flow.next : undefined}
      onSkip={hasPhoto ? undefined : onSkip}
      skipLabel={hasPhoto ? undefined : t.flow.photoSkip}
    >
      {enabled ? (
        <PhotoUpload t={t} initialPhotoPath={initialPhotoPath} onSaved={onSaved} />
      ) : (
        <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-5 text-center text-xs text-muted-foreground">
          {t.theme.photoNotConfigured}
        </p>
      )}
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ preview */

export function PreviewSection({
  t,
  onOpen,
  onNext,
  seen,
}: {
  t: Dictionary;
  onOpen: () => void;
  onNext: () => void;
  seen: boolean;
}) {
  return (
    <SectionShell
      title={t.flow.previewTitle}
      hint={t.flow.previewBody}
      onNext={seen ? onNext : undefined}
      nextLabel={seen ? t.flow.previewNext : undefined}
    >
      <Button
        type="button"
        size="lg"
        variant={seen ? 'outline' : 'default'}
        onClick={onOpen}
        className="w-full rounded-full text-base"
      >
        <ArrowLeft className="rotate-180 rtl:rotate-0" aria-hidden="true" />
        {t.flow.previewOpen}
      </Button>
    </SectionShell>
  );
}
