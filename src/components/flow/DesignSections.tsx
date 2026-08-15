'use client';

import { ArrowLeft, Eye } from 'lucide-react';
import { SectionShell } from './SectionShell';
import { MusicSelector } from './MusicSelector';
import { PhotoUpload } from './PhotoUpload';
import { MiniInvitation } from '@/components/invitation/MiniInvitation';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { scriptSuggestions } from '@/lib/flow/values';
import { getTheme, THEMES, themeName, themeStyle, type ThemeDefinition } from '@/themes/registry';
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
  onNext,
}: {
  t: Dictionary;
  value: Lang;
  name1: string;
  name2: string;
  onChange: (next: Lang) => void;
  onConvert: (names: { name1: string; name2: string }) => void;
  /** Dismisses the offer, keeping the names exactly as they were typed. */
  onKeepNames: () => void;
  onNext: () => void;
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
    <SectionShell
      title={t.flow.langTitle}
      hint={t.theme.invitationLangHint}
      onNext={onNext}
      nextLabel={t.flow.next}
    >
      <ToggleGroup
        type="single"
        value={value}
        // Held at the current value when single mode hands back an empty string, so an
        // answer can be changed but never un made. See the occasion question.
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

/**
 * A theme reduced to the two things that identify it at 60 pixels: its colours and the
 * shape of a card.
 *
 * Not a rendering of the invitation. At this size real text is a grey smudge and four of
 * them are four grey smudges, which tells a customer nothing and costs four more font
 * loads. Two bars for the names with the accent between them is the actual structure of
 * the card, and the ground, the ink and the accent come straight from the registry, so
 * midnight arrives dark with gold on it and floral arrives blush without either being
 * written down twice.
 */
function ThemeSwatch({ theme, lang }: { theme: ThemeDefinition; lang: Lang }) {
  return (
    <span
      style={themeStyle(theme, lang)}
      aria-hidden="true"
      className="flex h-9 w-full flex-col items-center justify-center gap-[3px] rounded-md border border-inv-line bg-inv-bg"
    >
      <span className="h-[3px] w-7 rounded-full bg-inv-ink/75" />
      <span className="h-[3px] w-2 rounded-full bg-inv-accent" />
      <span className="h-[3px] w-7 rounded-full bg-inv-ink/75" />
    </span>
  );
}

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
  onNext,
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
  /** Opens the full screen preview on the design currently showing. */
  onTry: () => void;
  onNext: () => void;
}) {
  return (
    <SectionShell title={t.flow.themeTitle} onNext={onNext} nextLabel={t.flow.next}>
      {/*
        One card, not four.
        This question used to be a column of four thumbnails, which meant the design
        being decided on was never bigger than a third of the screen and comparing two of
        them was a scroll rather than a glance. The names are a row of buttons now and
        the card below them is the answer: tapping a name re-typesets it in place, in the
        customer's own names and date, at a size where the typography is actually
        legible. Choosing a design is a typographic decision, and it cannot be made from
        a thumbnail.
      */}
      <ToggleGroup
        type="single"
        value={value}
        // Held at the current value when single mode hands back an empty string, so the
        // card below can never be left with no design to draw.
        onValueChange={(next) => onChange(next || value)}
        variant="outline"
        className="grid w-full grid-cols-4 gap-1.5"
        aria-label={t.flow.themeTitle}
      >
        {THEMES.map((theme) => (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            className="tap-target h-auto flex-col gap-1 rounded-xl p-1.5 data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
          >
            <ThemeSwatch theme={theme} lang={invitationLang} />
            <span className="text-[0.625rem] leading-none">{themeName(theme, uiLang)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mt-3 overflow-hidden rounded-xl border-2 border-primary">
        <MiniInvitation
          themeId={value}
          lang={invitationLang}
          name1={name1}
          name2={name2}
          eventDate={eventDate}
          eventType={eventType}
          size="lg"
        />
      </div>

      {/* The miniature is the shape and the typography. This is the whole thing, with
          its cover, its opening and its music, which is the only way to judge the two
          dark themes fairly. */}
      <Button
        type="button"
        variant="outline"
        onClick={onTry}
        className="mt-2 w-full rounded-full"
      >
        <Eye aria-hidden="true" />
        {t.theme.themeView}
      </Button>
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
