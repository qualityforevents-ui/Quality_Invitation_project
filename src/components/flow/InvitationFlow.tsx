'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlowHeader } from './FlowHeader';
import { AnsweredRow } from './AnsweredRow';
import { PendingBanner } from './PendingBanner';
import { PaymentPanel } from './PaymentPanel';
import { PreviewDialog } from './PreviewDialog';
import { StartOverButton } from './StartOverButton';
import {
  BriefSection,
  DateSection,
  MapSection,
  MessageSection,
  NameSection,
  OccasionSection,
  PackageSection,
  PhoneSection,
  TimeSection,
  VenueSection,
  VerseSection,
} from './QuestionSections';
import {
  LanguageSection,
  MusicSection,
  PhotoSection,
  PreviewSection,
  ThemeSection,
} from './DesignSections';
import { Button } from '@/components/ui/button';
import { useAutosave } from '@/lib/useAutosave';
import { COOKIE_MAX_AGE_SECONDS, FLOW_STEP_COOKIE } from '@/lib/constants';
import { formatEventDate, formatEventTimeParts, fromDateInputValue } from '@/lib/format';
import { packageName } from '@/lib/packages';
import { getTheme, themeName } from '@/themes/registry';
import { getTrack, trackName } from '@/lib/music';
import { getVerse, verseLabel } from '@/lib/verses';
import { normaliseEgyptianPhone } from '@/lib/validation';
import {
  FIRST_SECTION,
  isSectionActive,
  nextSection,
  progressPercent,
  type SectionId,
} from '@/lib/flow/sections';
import { clampFurthest, isAnswered, toPatch, type FlowValues } from '@/lib/flow/values';
import { viewFromValues } from '@/lib/flow/preview-view';
import type { Dictionary } from '@/i18n/ui';
import type { Invitation } from '@/lib/types';
import type { EventType, Lang } from '@/lib/types';

type FlowState = {
  values: FlowValues;
  /** The last section revealed. Null means the flow has not started. */
  furthest: SectionId | null;
  /** The section currently expanded. Usually `furthest`, or an earlier row reopened. */
  active: SectionId | null;
};

type Action =
  | { type: 'start' }
  | { type: 'set'; patch: Partial<FlowValues> }
  | { type: 'advance'; from: SectionId }
  | { type: 'reopen'; section: SectionId }
  | { type: 'setAndAdvance'; from: SectionId; patch: Partial<FlowValues> };

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case 'start':
      return state.furthest
        ? state
        : { ...state, furthest: FIRST_SECTION, active: FIRST_SECTION };

    case 'set':
      return { ...state, values: { ...state.values, ...action.patch } };

    case 'reopen':
      return { ...state, active: action.section };

    case 'setAndAdvance':
    case 'advance': {
      const values =
        action.type === 'setAndAdvance' ? { ...state.values, ...action.patch } : state.values;

      /*
       * A question can stop existing under you. The brief is only asked on the bespoke
       * tier, and the tier is now the question immediately before it, so choosing
       * bespoke, then reopening the tier and choosing basic, leaves the flow pointing at
       * a section that no longer applies and nothing renders. Anything pointing at a
       * dropped question is walked forward to the next one that survives.
       */
      const keep = (id: SectionId | null): SectionId | null =>
        !id || isSectionActive(id, values.package, values.invitationLang) ? id : nextSection(id, values.package, values.invitationLang);

      const furthest = keep(state.furthest);

      /*
       * Correcting an earlier answer never rewinds the flow. Somebody fixing a
       * misspelled bride's name at question two keeps the design they chose at question
       * ten, and lands back where they were rather than being walked forward through
       * everything again.
       */
      if (furthest && action.from !== furthest) {
        return { ...state, values, furthest, active: furthest };
      }

      const next = nextSection(action.from, values.package, values.invitationLang);
      return { ...state, values, furthest: next ?? furthest, active: next ?? furthest };
    }

    default:
      return state;
  }
}

export function InvitationFlow({
  lang,
  t,
  initialValues,
  initialFurthest,
  today,
  photoEnabled,
  invitation,
  databaseUnavailable,
}: {
  lang: Lang;
  t: Dictionary;
  initialValues: FlowValues;
  /** Where this device left off, already clamped against what is actually stored. */
  initialFurthest: SectionId | null;
  /** Today in Cairo, resolved on the server so both sides agree what day it is. */
  today: string;
  photoEnabled: boolean;
  /** The draft row, when there is one. Carries the request id and the status path. */
  invitation: Pick<Invitation, 'requestId' | 'editToken' | 'status' | 'slug'> | null;
  databaseUnavailable: boolean;
}) {
  const router = useRouter();

  const [state, dispatch] = useReducer(reducer, {
    values: initialValues,
    furthest: initialFurthest,
    active: initialFurthest,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSeen, setPreviewSeen] = useState(false);
  /** Dismissed offers stay dismissed, so toggling language back and forth is quiet. */
  const [keptNames, setKeptNames] = useState(false);

  const { values, furthest, active } = state;

  const isDraft = !invitation || invitation.status === 'DRAFT';

  const patch = useMemo(() => toPatch(values, lang), [values, lang]);

  const { status: saveStatus, flush } = useAutosave(patch, {
    // Nothing is saved until the customer has actually started. Otherwise landing on the
    // page and reading it would be a write.
    enabled: furthest !== null,
    onSaved: (result) => {
      // The edit token is httpOnly and never reaches the browser, so the request id and
      // the status path can only arrive by asking the server again. One refresh, on the
      // save that creates the row, is what makes the payment panel able to address it.
      if (result.created) router.refresh();
    },
  });

  /* ------------------------------------------------------- remembering place */

  useEffect(() => {
    if (!furthest) return;
    document.cookie = `${FLOW_STEP_COOKIE}=${furthest}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  }, [furthest]);

  /* --------------------------------------------------------------- scrolling */

  const activeRef = useRef<HTMLDivElement>(null);
  const previousActive = useRef<SectionId | null>(initialFurthest);

  useEffect(() => {
    if (!active || active === previousActive.current) return;
    previousActive.current = active;

    const node = activeRef.current;
    if (!node) return;

    /*
     * Two frames, not zero. The tap that advanced the flow usually blurred a text field
     * first, and calling scrollIntoView while the iOS keyboard is still dismissing makes
     * the browser fight the scroll and land somewhere arbitrary. Waiting for the layout
     * that follows the keyboard is the difference between arriving at the question and
     * arriving three hundred pixels past it.
     *
     * Smoothness comes from html { scroll-behavior: smooth } in globals.css, which the
     * existing prefers-reduced-motion block already switches to auto, so reduced motion
     * is honoured without asking for it here.
     */
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => node.scrollIntoView({ block: 'start' }));
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);

  /* ----------------------------------------------------------------- helpers */

  const set = useCallback((next: Partial<FlowValues>) => dispatch({ type: 'set', patch: next }), []);

  const advance = useCallback(
    (from: SectionId) => dispatch({ type: 'advance', from }),
    [],
  );

  const setAndAdvance = useCallback(
    (from: SectionId, next: Partial<FlowValues>) =>
      dispatch({ type: 'setAndAdvance', from, patch: next }),
    [],
  );

  const eventDateObject = useMemo(
    () => fromDateInputValue(values.eventDate) ?? new Date(),
    [values.eventDate],
  );

  const phoneInvalid = normaliseEgyptianPhone(values.customerPhone) === null;

  /** What each answered question collapses to. */
  function summaryOf(id: SectionId): { label: string; value: string; muted?: boolean } | null {
    switch (id) {
      case 'package':
        return { label: t.flow.packageSummary, value: packageName(values.package, lang) };
      case 'name1':
        return { label: t.flow.name1Summary, value: values.name1 };
      case 'name2':
        return { label: t.flow.name2Summary, value: values.name2 };
      case 'occasion':
        return {
          label: t.flow.occasionSummary,
          value: {
            ENGAGEMENT: t.build.eventTypeEngagement,
            WEDDING: t.build.eventTypeWedding,
            KATB_KETAB: t.build.eventTypeKatbKetab,
          }[values.eventType],
        };
      case 'eventDate':
        return { label: t.flow.dateSummary, value: formatEventDate(eventDateObject, lang) };
      case 'eventTime': {
        const { clock, period } = formatEventTimeParts(values.eventTime || '20:00', lang);
        return { label: t.flow.timeSummary, value: `${clock} ${period}` };
      }
      case 'venue':
        return { label: t.flow.venueSummary, value: values.venueName };
      case 'map':
        return values.venueMapUrl.trim()
          ? { label: t.flow.mapSummary, value: values.venueMapUrl }
          : { label: t.flow.mapSummary, value: t.flow.mapNone, muted: true };
      case 'message':
        return values.customMessage.trim()
          ? { label: t.flow.messageSummary, value: values.customMessage }
          : { label: t.flow.messageSummary, value: t.flow.messageNone, muted: true };
      case 'language':
        return {
          label: t.flow.langSummary,
          value: values.invitationLang === 'AR' ? 'العربية' : 'English',
        };
      case 'verse': {
        const verse = getVerse(values.verseId);
        return verse
          ? { label: t.flow.verseSummary, value: verseLabel(verse, lang) }
          : { label: t.flow.verseSummary, value: t.flow.verseNone, muted: true };
      }
      case 'theme':
        return { label: t.flow.themeSummary, value: themeName(getTheme(values.themeId), lang) };
      case 'music':
        return { label: t.flow.musicSummary, value: trackName(getTrack(values.musicTrackId), lang) };
      case 'photo':
        return values.photoFileId
          ? { label: t.flow.photoSummary, value: t.flow.photoAdded }
          : { label: t.flow.photoSummary, value: t.flow.photoNone, muted: true };
      case 'preview':
        return { label: t.flow.previewSummary, value: t.flow.previewSeen };
      case 'brief':
        return { label: t.flow.briefSummary, value: values.customRequest };
      case 'phone':
        return { label: t.flow.phoneSummary, value: values.customerPhone };
      default:
        return null;
    }
  }

  function renderSection(id: SectionId) {
    switch (id) {
      case 'package':
        return (
          <PackageSection
            t={t}
            lang={lang}
            value={values.package}
            onChange={(next) => set({ package: next })}
            onNext={() => advance('package')}
          />
        );
      case 'name1':
        return (
          <NameSection
            t={t}
            title={t.flow.name1Title}
            hint={t.flow.name1Hint}
            placeholder={t.build.name1Placeholder}
            value={values.name1}
            onChange={(next) => set({ name1: next })}
            onNext={() => advance('name1')}
          />
        );
      case 'name2':
        return (
          <NameSection
            t={t}
            title={t.flow.name2Title}
            hint={t.flow.name2Hint}
            placeholder={t.build.name2Placeholder}
            value={values.name2}
            onChange={(next) => set({ name2: next })}
            onNext={() => advance('name2')}
          />
        );
      case 'occasion':
        return (
          <OccasionSection
            t={t}
            value={values.eventType}
            onChange={(next: EventType) => set({ eventType: next })}
            onNext={() => advance('occasion')}
          />
        );
      case 'eventDate':
        return (
          <DateSection
            t={t}
            lang={lang}
            today={today}
            value={values.eventDate}
            onChange={(next) => set({ eventDate: next })}
            onNext={() => advance('eventDate')}
          />
        );
      case 'eventTime':
        return (
          <TimeSection
            t={t}
            lang={lang}
            value={values.eventTime}
            onChange={(next) => set({ eventTime: next })}
            onNext={() => advance('eventTime')}
          />
        );
      case 'venue':
        return (
          <VenueSection
            t={t}
            value={values.venueName}
            onChange={(next) => set({ venueName: next })}
            onNext={() => advance('venue')}
          />
        );
      case 'map':
        return (
          <MapSection
            t={t}
            value={values.venueMapUrl}
            onChange={(next) => set({ venueMapUrl: next })}
            onNext={() => advance('map')}
            onSkip={() => setAndAdvance('map', { venueMapUrl: '' })}
          />
        );
      case 'message':
        return (
          <MessageSection
            t={t}
            lang={values.invitationLang}
            value={values.customMessage}
            onChange={(next) => set({ customMessage: next })}
            onNext={() => advance('message')}
            onSkip={() => setAndAdvance('message', { customMessage: '' })}
          />
        );
      case 'language':
        return (
          <LanguageSection
            t={t}
            value={values.invitationLang}
            name1={values.name1}
            name2={values.name2}
            onChange={(next) => {
              set({ invitationLang: next });
              setKeptNames(false);
            }}
            onConvert={(names) => set(names)}
            onKeepNames={() => setKeptNames(true)}
            onNext={() => advance('language')}
          />
        );
      case 'verse':
        return (
          <VerseSection
            t={t}
            uiLang={lang}
            value={values.verseId}
            onChange={(verseId) => set({ verseId })}
            onNext={() => advance('verse')}
          />
        );
      case 'theme':
        return (
          <ThemeSection
            t={t}
            uiLang={lang}
            /* The same view the full preview is built from, so the strip and the
               popup can never disagree about what the card says. */
            view={viewFromValues(values)}
            value={values.themeId}
            onChange={(themeId) => {
              // Switching design carries the music with it, but only while the customer
              // has not chosen a track of their own. Overriding a deliberate choice
              // would be the app arguing with them.
              const previousDefault = getTheme(values.themeId).defaultMusicTrackId;
              const musicTrackId =
                values.musicTrackId === previousDefault
                  ? getTheme(themeId).defaultMusicTrackId
                  : values.musicTrackId;

              set({ themeId, musicTrackId });
            }}
            onTry={() => setPreviewOpen(true)}
            onNext={() => advance('theme')}
          />
        );
      case 'music':
        return (
          <MusicSection
            t={t}
            uiLang={lang}
            value={values.musicTrackId}
            onChange={(musicTrackId) => set({ musicTrackId })}
            onNext={() => advance('music')}
          />
        );
      case 'photo':
        return (
          <PhotoSection
            t={t}
            enabled={photoEnabled}
            /*
              The live values, not the ones the page was loaded with.
              This read initialValues, which is the draft as it was when the page was
              opened. A photo uploaded during this session is not in there, so reopening
              the question remounted the uploader knowing nothing about it: no thumbnail,
              "choose a photo" instead of "change it", and no way to remove it.
            */
            initialPhotoPath={values.photoFileId}
            initialCrop={values.photoCrop}
            hasPhoto={values.photoFileId !== null}
            onSaved={({ photoPath, crop }) => {
              set({ photoFileId: photoPath, photoCrop: crop });
              // An upload happens once and is immediately followed by moving on, which
              // is the exact case the debounce loses. Flushed rather than left waiting.
              void flush();
            }}
            onNext={() => advance('photo')}
            onSkip={() => setAndAdvance('photo', { photoFileId: null, photoCrop: null })}
          />
        );
      case 'preview':
        return (
          <PreviewSection
            t={t}
            seen={previewSeen}
            onOpen={() => {
              setPreviewOpen(true);
              setPreviewSeen(true);
            }}
            onNext={() => advance('preview')}
          />
        );
      case 'brief':
        return (
          <BriefSection
            t={t}
            value={values.customRequest}
            onChange={(next) => set({ customRequest: next })}
            onNext={() => advance('brief')}
          />
        );
      case 'phone':
        return (
          <PhoneSection
            t={t}
            value={values.customerPhone}
            onChange={(next) => set({ customerPhone: next })}
            onNext={() => advance('phone')}
            invalid={phoneInvalid}
          />
        );
      case 'payment':
        return isDraft ? (
          <PaymentPanel
            t={t}
            uiLang={lang}
            requestId={invitation?.requestId ?? null}
            name1={values.name1}
            name2={values.name2}
            packageId={values.package}
            statusPath={invitation ? `/build/status/${invitation.editToken}` : null}
            onHandoff={() => {
              void flush();
              void fetch('/api/invitation/confirm', { method: 'POST', keepalive: true }).catch(
                () => {
                  // The operator can still find this request by its id, so a failure
                  // here is not worth blocking the customer's path to WhatsApp.
                },
              );
            }}
          />
        ) : null;
      default:
        return null;
    }
  }

  /* -------------------------------------------------------------- the render */

  const revealed = useMemo(() => {
    if (!furthest) return [] as SectionId[];

    const list: SectionId[] = [];
    let cursor: SectionId | null = FIRST_SECTION;

    while (cursor) {
      list.push(cursor);
      if (cursor === furthest) break;
      cursor = nextSection(cursor, values.package, values.invitationLang);
    }

    return list;
    // The walk skips questions that no longer apply, so it has to be redone when the
    // answer that decides applicability changes. The invitation language is one of
    // those now: switching an Arabic card to English retires the verse question, and
    // without this dependency the retired question stayed on screen as an answered row.
  }, [furthest, values.package, values.invitationLang]);

  const percent = progressPercent(furthest, values.package, values.invitationLang);
  const started = furthest !== null;

  return (
    <>
      <FlowHeader lang={lang} t={t} percent={percent} saveStatus={saveStatus} started={started} />

      {databaseUnavailable && process.env.NODE_ENV !== 'production' ? (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          The database is not reachable, so nothing here will save. Work through SETUP.md steps 1
          to 3, then reload.
        </p>
      ) : null}

      {invitation ? <PendingBanner invitation={invitation} t={t} /> : null}

      {!started ? (
        <Hero t={t} onStart={() => dispatch({ type: 'start' })} hasDraft={Boolean(invitation)} />
      ) : null}

      {started ? (
        <div className="flex flex-col gap-2 pt-2 pb-16">
          {revealed.map((id) => {
            const isActive = id === active;
            const summary = summaryOf(id);

            if (isActive) {
              return (
                /*
                 * The scroll margin belongs here, on the element scrollIntoView is
                 * actually called on, and not on the card inside it. It spent a while on
                 * the inner section, where scroll-margin means nothing, so every reveal
                 * parked the question flush against the top of the window with its
                 * heading behind the sticky header. Sized to clear that header, 56px of
                 * bar plus the 4px progress rail, with room to breathe under it.
                 */
                <div key={id} ref={activeRef} className="scroll-mt-20">
                  {renderSection(id)}
                </div>
              );
            }

            // A revealed but unanswered section that is not the active one has nothing
            // worth collapsing, so it is simply not drawn.
            if (!summary || !isAnswered(id, values)) return null;

            return (
              <AnsweredRow
                key={id}
                label={summary.label}
                value={summary.value}
                muted={summary.muted}
                editLabel={t.flow.edit}
                onEdit={() => dispatch({ type: 'reopen', section: id })}
              />
            );
          })}

          {/* Somebody whose request is already sent or already live is editing, not
              buying. They get the way back to their own status screen instead of a
              second demand for money. */}
          {/*
            Only while it is still a draft, and only once there is one.
            Past DRAFT the invitation has been sent to the operator or paid for, and
            "start over" there would strand somebody from an invitation they may already
            have money in. Before a draft exists there is nothing to reset, and clearing
            a cookie that was never set would leave the flow looking unchanged.
          */}
          {isDraft && invitation ? <StartOverButton t={t} /> : null}

          {!isDraft && invitation ? (
            <Button asChild size="lg" className="mt-4 w-full rounded-full text-base">
              <Link href={`/build/status/${invitation.editToken}`}>
                {invitation.status === 'ACTIVE' ? t.status.activeCta : t.status.pendingCta}
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* One preview, always showing the design that is actually selected. The old
          "try this one without choosing it" mode is gone with the thumbnail grid:
          selecting is free and reversible now, and the card on the design question is
          already live, so there is nothing left for a separate trying state to do. */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        view={viewFromValues(values)}
        t={t}
      />
    </>
  );
}

/**
 * The only marketing on the page, and it disappears the moment the flow starts.
 *
 * Keeping a headline and a price above an in progress form would be selling to somebody
 * who has already bought the argument.
 */
function Hero({
  t,
  onStart,
  hasDraft,
}: {
  t: Dictionary;
  onStart: () => void;
  hasDraft: boolean;
}) {
  return (
    <section className="pt-8 pb-3">
      <div className="flex items-center justify-center gap-3 text-primary" aria-hidden="true">
        <span className="h-px w-16 bg-gradient-to-l from-primary/60 to-transparent" />
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2.5 16.4 9.8 23.9 12.2 16.4 14.6 14 21.9 11.6 14.6 4.1 12.2 11.6 9.8Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="24.5" r="1.4" fill="currentColor" />
        </svg>
        <span className="h-px w-16 bg-gradient-to-r from-primary/60 to-transparent" />
      </div>

      <h1 className="mt-6 text-[2rem] leading-[1.25] font-bold text-balance">{t.landing.title}</h1>

      <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground text-pretty">
        {t.landing.subtitle}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Button type="button" size="lg" onClick={onStart} className="w-full rounded-full text-lg">
          {hasDraft ? t.flow.resume : t.landing.cta}
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full rounded-full">
          <Link href="/sample">{t.landing.sample}</Link>
        </Button>
      </div>

      {hasDraft ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">{t.flow.resumeHint}</p>
      ) : null}
    </section>
  );
}
