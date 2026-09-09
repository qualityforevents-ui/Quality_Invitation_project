'use client';

import { ArrowLeft, Eye } from 'lucide-react';
import { SectionShell } from './SectionShell';
import { MusicSelector } from './MusicSelector';
import { PhotoUpload } from './PhotoUpload';
import { ThemePicker } from './ThemePicker';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { scriptSuggestions } from '@/lib/flow/values';
import { getTheme, LISTED_THEMES } from '@/themes/registry';
import type { InvitationView } from '@/lib/invitation-view';
import type { PhotoCrop } from '@/lib/photo-url';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

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

export function ThemeSection({
  t,
  uiLang,
  view,
  value,
  onChange,
  onTry,
  onNext,
}: {
  t: Dictionary;
  uiLang: Lang;
  /** The flow's live values, rendered by each design in turn. */
  view: InvitationView;
  value: string;
  onChange: (themeId: string) => void;
  /** Opens the full screen preview on the design currently showing. */
  onTry: () => void;
  onNext: () => void;
}) {
  /*
   * The designs on sale, plus the one already chosen if it is not among them.
   *
   * A retired theme stays renderable so that invitations sold under it keep working,
   * which means a draft started before a design was retired can arrive here holding an
   * id that is no longer offered. Dropping it from the list would leave the strip with
   * nothing selected and the customer looking at a design that is not in it, so the
   * retired design is appended rather than hidden. It leaves the list the moment they
   * choose something else.
   */
  const listed = LISTED_THEMES;
  const current = getTheme(value);
  const choices = listed.some((theme) => theme.id === current.id) ? listed : [...listed, current];

  return (
    <SectionShell
      title={t.flow.themeTitle}
      hint={t.theme.themeSwipe}
      onNext={onNext}
      nextLabel={t.flow.next}
    >
      {/*
        The designs, shown as themselves.

        This question was a grid of nine swatches — three grey dashes on a coloured
        ground — over a single generic card that wore no theme's ornament, so the two
        things on screen were a colour chip and a design that does not exist anywhere in
        the product. Between them they cost half the screen to say almost nothing, and
        what they did say was not true.

        What is here now is the real cover of every design, at the size the decision is
        actually made at, in the customer's own names, date and language: the same
        component their guests' phones will mount, scaled down whole. Swiping is both the
        looking and the choosing, so the two-step of picking a chip and then reading the
        card below it is gone, and the strip costs one card of height instead of ten.
      */}
      <ThemePicker
        t={t}
        uiLang={uiLang}
        view={view}
        choices={choices}
        value={value}
        onChange={onChange}
        onOpen={onTry}
      />

      {/* The tile is the cover, still and silent. This is the card: the opening
          animation, the confetti, the music and everything under the fold, which is the
          only way to judge the darker designs fairly. */}
      <Button
        type="button"
        variant="outline"
        onClick={onTry}
        className="mt-3 w-full rounded-full"
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
  initialCrop,
  hasPhoto,
  onSaved,
  onNext,
  onSkip,
}: {
  t: Dictionary;
  /** False until the ImageKit keys are set, which keeps the question usable without them. */
  enabled: boolean;
  initialPhotoPath: string | null;
  initialCrop: PhotoCrop | null;
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
        <PhotoUpload
          t={t}
          initialPhotoPath={initialPhotoPath}
          initialCrop={initialCrop}
          onSaved={onSaved}
        />
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
