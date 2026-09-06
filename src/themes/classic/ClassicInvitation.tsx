'use client';

import { Countdown } from '@/components/invitation/Countdown';
import { Divider, OrnateFrame, PaperTexture } from '@/components/invitation/Ornaments';
import { Monogram } from '@/components/invitation/Monogram';
import { PhotoFrame } from '@/components/invitation/PhotoFrame';
import { Reveal } from '@/components/invitation/Reveal';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import { SITE_URL } from '@/lib/constants';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * The classic theme, revealed.
 *
 * Two things shape the structure. The card carries no photo, so the names, the verse
 * and the ornaments are given the room instead: this is a layout in its own right, not
 * the photo version with a hole in it. And the practical facts of the event, the date,
 * the hour and the place, are gathered into one bordered panel rather than strung out
 * as three separate sections with an identical flourish between each. That grouping is
 * what keeps a long card from reading as an undifferentiated scroll, and it leaves the
 * ornamental dividers to mark the few genuine changes of subject.
 */
export function ClassicInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const time = formatEventTimeParts(view.eventTime, view.lang);
  const date = formatEventDateParts(view.eventDate, view.lang);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg">
      <PaperTexture />
      <OrnateFrame className="fixed inset-3 sm:inset-4" />

      <div className="@container relative mx-auto w-full max-w-md px-8 pt-16 pb-24 text-center">
        {/* 1. Names, with the monogram sitting between them rather than an ampersand. */}
        <Reveal immediate>
          {copy.familiesPrefix ? (
            <p className="mb-5 font-inv-body text-[0.8125rem] tracking-[0.14em] text-inv-muted">
              {copy.familiesPrefix}
            </p>
          ) : null}

          <h1 className="flex flex-col items-center font-inv-display text-inv-ink">
            <span className="block text-[2.375rem] leading-[1.45] text-balance">{view.name1}</span>
            <Monogram name1={view.name1} name2={view.name2} className="my-2" />
            <span className="block text-[2.375rem] leading-[1.45] text-balance">{view.name2}</span>
          </h1>
        </Reveal>

        <Divider className="my-9" />

        {/* 2. Bismillah and the verse. Arabic card only, by design. */}
        {copy.bismillah && copy.verse ? (
          <>
            <Reveal immediate delay={0.15}>
              {/*
                U+FDFD is a single ligature roughly eleven times wider than its font
                size, so a size that suits ordinary text runs it straight off both
                edges of a phone. Sized against the column rather than the viewport,
                because the column stops growing at max-w-md while a desktop viewport
                does not.
              */}
              <p
                className="font-inv-verse text-[length:min(2rem,8cqw)] leading-none text-inv-accent"
                aria-label="بسم الله الرحمن الرحيم"
              >
                {copy.bismillah}
              </p>

              <p className="mt-7 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
                {copy.verse}
              </p>

              {copy.verseSource ? (
                <p className="mt-3 font-inv-body text-xs tracking-wide text-inv-muted">
                  {copy.verseSource}
                </p>
              ) : null}
            </Reveal>

            <Divider className="my-9" />
          </>
        ) : null}

        {/* 3 and 4. The line of verse and the formal invitation, read as one thought. */}
        <Reveal delay={0.05}>
          <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted italic text-pretty">
            {copy.poetry}
          </p>

          <p className="mt-7 font-inv-body text-sm leading-relaxed text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          {/* Roles sit under a rule each, rather than either side of one. */}
          <div className="mt-8 grid grid-cols-2 gap-5">
            {[
              { role: copy.roleGroom, name: view.name1 },
              { role: copy.roleBride, name: view.name2 },
            ].map((person) => (
              <div key={person.role}>
                <p className="font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent">
                  {person.role}
                </p>
                <span className="mx-auto mt-2 block h-px w-10 bg-inv-line" aria-hidden="true" />
                <p className="mt-2.5 font-inv-display text-xl leading-snug text-inv-ink text-balance">
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 5. Photo, when there is one, under an arch. */}
        {view.photoUrl ? (
          <Reveal className="mt-10">
            <PhotoFrame view={view} shape="arch" />
          </Reveal>
        ) : null}

        <Divider className="my-9" />

        {/*
          6 and 8. Date, hour and place in one panel. These are the details a guest
          actually comes back to the card to check, so they are kept together and set
          apart from the ceremonial text above.
        */}
        <Reveal>
          <div className="rounded-2xl border border-inv-line bg-inv-panel/35 px-6 py-7">
            <p className="font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent">
              {date.weekday}
            </p>

            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="h-px w-9 bg-inv-line" aria-hidden="true" />
              <span className="numeric font-inv-display text-5xl leading-none text-inv-ink">
                {date.day}
              </span>
              <span className="h-px w-9 bg-inv-line" aria-hidden="true" />
            </div>

            <p className="mt-3 font-inv-display text-lg text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>

            <div className="my-6 h-px bg-inv-line" aria-hidden="true" />

            <p className="font-inv-body text-sm text-inv-muted">
              {copy.labels.time}
              <span className="mx-2 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>

            <div className="my-6 h-px bg-inv-line" aria-hidden="true" />

            <p className="font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent">
              {copy.labels.venue}
            </p>
            <p className="mt-2.5 font-inv-display text-2xl leading-snug text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target mt-5 inline-flex items-center gap-2 rounded-full border border-inv-accent/55 bg-inv-bg/70 px-6 py-3 font-inv-body text-sm text-inv-ink transition active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-inv-accent"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {copy.labels.mapsButton}
              </a>
            ) : null}
          </div>
        </Reveal>

        {/* 7. Countdown, standing on its own below the panel. */}
        <Reveal className="mt-11">
          <Countdown targetMs={view.eventInstantMs} copy={copy} />
        </Reveal>

        {/* 9. The couple's own words, if they wrote any. */}
        {view.customMessage ? (
          <>
            <Divider className="my-9" />
            <Reveal>
              <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </Reveal>
          </>
        ) : null}

        {/* 10. Footer. */}
        <Reveal className="mt-14">
          <Divider className="mb-7" />
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inv-body text-xs tracking-wide text-inv-muted/80 transition hover:text-inv-accent"
          >
            {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
          </a>
        </Reveal>
      </div>
    </div>
  );
}
