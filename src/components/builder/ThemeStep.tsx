'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MusicSelector } from './MusicSelector';
import { PhotoUpload } from './PhotoUpload';
import { ThemeCard } from './ThemeCard';
import { SaveIndicator } from './Fields';
import type { PhotoCrop } from '@/lib/imagekit';
import { buttonClass } from '@/components/ui/Button';
import { useAutosave } from '@/lib/useAutosave';
import { cn } from '@/lib/cn';
import { nameFitsLanguage } from '@/lib/script';
import { getTheme, THEMES } from '@/themes/registry';
import type { Dictionary } from '@/i18n/ui';
import type { EventType, Lang } from '@/generated/prisma/enums';

export function ThemeStep({
  uiLang,
  t,
  name1,
  name2,
  eventDate,
  eventType,
  initialInvitationLang,
  initialThemeId,
  initialMusicTrackId,
  initialPhotoPath,
  initialPhotoCrop,
  photoEnabled,
}: {
  uiLang: Lang;
  t: Dictionary;
  name1: string;
  name2: string;
  eventDate: Date;
  eventType: EventType;
  initialInvitationLang: Lang;
  initialThemeId: string;
  initialMusicTrackId: string;
  initialPhotoPath: string | null;
  initialPhotoCrop: PhotoCrop | null;
  /** False until ImageKit keys are set, which keeps the step usable without them. */
  photoEnabled: boolean;
}) {
  const router = useRouter();

  const [invitationLang, setInvitationLang] = useState<Lang>(initialInvitationLang);
  const [themeId, setThemeId] = useState(initialThemeId);
  const [musicTrackId, setMusicTrackId] = useState(initialMusicTrackId);
  const [photoFileId, setPhotoFileId] = useState<string | null>(initialPhotoPath);
  // Seeded from the stored crop, not from null. Starting empty meant that merely
  // revisiting this step and changing the theme sent photoCrop: null and wiped the
  // customer's framing, leaving the photo showing whatever the default crop landed on.
  const [photoCrop, setPhotoCrop] = useState<PhotoCrop | null>(initialPhotoCrop);

  const patch = useMemo(
    () => ({ invitationLang, themeId, musicTrackId, photoFileId, photoCrop }),
    [invitationLang, themeId, musicTrackId, photoFileId, photoCrop],
  );

  const { status: saveStatus, flush } = useAutosave(patch);

  /**
   * Each theme carries a default track. Switching theme moves the music with it, but
   * only while the customer has not made a choice of their own: overriding a track
   * somebody deliberately picked would be the app arguing with them.
   */
  function selectTheme(nextThemeId: string) {
    const previousDefault = getTheme(themeId).defaultMusicTrackId;
    setThemeId(nextThemeId);
    if (musicTrackId === previousDefault) {
      setMusicTrackId(getTheme(nextThemeId).defaultMusicTrackId);
    }
  }

  /*
   * An Arabic card must show Arabic names, so switching the language to Arabic while the
   * names are in Latin blocks the way forward rather than merely warning. Recomputed as
   * the toggle changes, so the consequence appears the moment the choice is made rather
   * than two screens later.
   */
  const scriptMismatch =
    !nameFitsLanguage(name1, invitationLang) || !nameFitsLanguage(name2, invitationLang);

  const languageOptions: Array<{ value: Lang; label: string }> = [
    { value: 'AR', label: 'العربية' },
    { value: 'EN', label: 'English' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.theme.heading}</h1>
        <SaveIndicator
          status={saveStatus}
          savingLabel={t.common.saving}
          savedLabel={t.common.saved}
          errorLabel={t.errors.saveFailedShort}
        />
      </div>

      {/*
        Above the grid, deliberately. Changing it redraws every miniature below in the
        other language, and typography is a large part of what is being chosen here.
      */}
      <section>
        <h2 className="text-sm font-medium text-ink">{t.theme.invitationLang}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setInvitationLang(option.value)}
              aria-pressed={invitationLang === option.value}
              className={cn(
                'tap-target rounded-xl border px-3 py-3 text-sm font-medium transition',
                invitationLang === option.value
                  ? 'border-gold bg-gold-wash text-gold-deep'
                  : 'border-line bg-white text-ink-soft',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t.theme.invitationLangHint}</p>
      </section>

      {/*
        The names are shown in whatever script they were typed in, which the spec
        requires and which is right: a couple may genuinely want Latin names on an
        Arabic card. But it is more often a mismatch nobody noticed, and it is most
        visible here, where four miniatures are showing it.

        Deliberately a question and a link back, not an automatic conversion.
        Transliterating "mariam" could produce مريم or ماريام, and quietly printing the
        wrong spelling of somebody's name on their wedding invitation is not a risk
        worth taking on their behalf.
      */}
      {scriptMismatch ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3">
          <p className="text-xs leading-relaxed text-danger">{t.theme.scriptMismatch}</p>
          <button
            type="button"
            onClick={async () => {
              await flush();
              router.refresh();
              router.push('/build');
            }}
            className="mt-2 text-xs font-semibold text-danger underline underline-offset-4"
          >
            {t.theme.scriptMismatchCta}
          </button>
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">{t.theme.themeGrid}</h2>
        <div className="grid grid-cols-1 gap-3">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              lang={invitationLang}
              uiLang={uiLang}
              selected={theme.id === themeId}
              name1={name1}
              name2={name2}
              eventDate={eventDate}
              eventType={eventType}
              onSelect={() => selectTheme(theme.id)}
              viewLabel={t.theme.themeView}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium text-ink">{t.theme.music}</h2>
        <p className="mb-3 text-xs text-ink-faint">{t.theme.musicHint}</p>
        <MusicSelector
          selectedId={musicTrackId}
          lang={uiLang}
          t={t}
          onSelect={setMusicTrackId}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-ink">{t.theme.photo}</h2>

        {photoEnabled ? (
          <PhotoUpload
            t={t}
            initialPhotoPath={initialPhotoPath}
            onSaved={({ photoPath, crop }) => {
              setPhotoFileId(photoPath);
              setPhotoCrop(crop);
            }}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-white/60 px-4 py-5 text-center text-xs text-ink-faint">
            {t.theme.photoNotConfigured}
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {/*
            Save, then invalidate, then navigate. All three are needed.

            flush stores anything still on the debounce. refresh throws away the client
            router cache, without which Next serves whatever copy of the preview it
            already had: the save lands correctly and the customer is still shown the
            invitation as it was before they picked a photo.
          */}
          <button
            type="button"
            disabled={scriptMismatch}
            onClick={async () => {
              if (scriptMismatch) return;
              await flush();
              router.refresh();
              router.push('/build/preview');
            }}
            className={buttonClass('primary', 'w-full text-lg')}
          >
            {t.theme.toPreview}
          </button>

          {/* Repeated down here because the notice above may be scrolled off screen by
              the time somebody reaches for this button. */}
          {scriptMismatch ? (
            <p className="mt-2 text-center text-xs text-danger">{t.theme.scriptMismatch}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
