'use client';

import type { ReactNode } from 'react';
import { Countdown } from '@/components/invitation/Countdown';
import { Reveal } from '@/components/invitation/Reveal';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * The content blocks every theme puts on a card.
 *
 * What each section says is fixed by the spec and identical everywhere, so it lives
 * here once. What a theme controls is how it looks: the ornament between sections, the
 * type scale, the spacing rhythm, whether the practical details sit in a panel, and its
 * own open animation. Those stay in the theme.
 *
 * Every block takes className overrides rather than a variant enum, because the point
 * is for four themes to look genuinely different rather than to look like one theme
 * with a switch on it.
 */

export function NamesBlock({
  view,
  copy,
  separator,
  nameClassName,
  className,
}: {
  view: InvitationView;
  copy: InvitationCopy;
  separator: ReactNode;
  nameClassName: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {copy.familiesPrefix ? (
        <p className="mb-5 font-inv-body text-[0.8125rem] tracking-[0.14em] text-inv-muted">
          {copy.familiesPrefix}
        </p>
      ) : null}

      <h1 className="flex flex-col items-center font-inv-display text-inv-ink">
        <span className={cn('block text-balance', nameClassName)}>{view.name1}</span>
        {separator}
        <span className={cn('block text-balance', nameClassName)}>{view.name2}</span>
      </h1>
    </div>
  );
}

/** Bismillah and the verse from Ar-Rum. Renders nothing on an English card, by design. */
export function VerseBlock({
  copy,
  bismillahClassName = 'text-[length:min(2rem,8cqw)]',
}: {
  copy: InvitationCopy;
  bismillahClassName?: string;
}) {
  if (!copy.bismillah || !copy.verse) return null;

  return (
    <>
      {/* U+FDFD is around eleven times wider than its font size, so it is sized against
          the column. See the note in the classic theme. */}
      <p
        className={cn('font-inv-verse leading-none text-inv-accent', bismillahClassName)}
        aria-label="بسم الله الرحمن الرحيم"
      >
        {copy.bismillah}
      </p>

      <p className="mt-7 font-inv-verse text-[1.0625rem] leading-[2.1] text-inv-ink text-pretty">
        {copy.verse}
      </p>

      {copy.verseSource ? (
        <p className="mt-3 font-inv-body text-xs tracking-wide text-inv-muted">{copy.verseSource}</p>
      ) : null}
    </>
  );
}

export function RolesBlock({
  view,
  copy,
  className,
  nameClassName = 'text-xl',
}: {
  view: InvitationView;
  copy: InvitationCopy;
  className?: string;
  nameClassName?: string;
}) {
  const people = [
    { role: copy.roleGroom, name: view.name1 },
    { role: copy.roleBride, name: view.name2 },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-5', className)}>
      {people.map((person) => (
        <div key={person.role}>
          <p className="font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent">
            {person.role}
          </p>
          <span className="mx-auto mt-2 block h-px w-10 bg-inv-line" aria-hidden="true" />
          <p className={cn('mt-2.5 font-inv-display leading-snug text-inv-ink text-balance', nameClassName)}>
            {person.name}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DateBlock({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  return (
    <div>
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

      {/* Only the clock is isolated as left to right. The period beside it is a word,
          and forcing it would seat it on the wrong side in Arabic. */}
      <p className="mt-4 font-inv-body text-sm text-inv-muted">
        {copy.labels.time}
        <span className="mx-2 text-inv-accent">·</span>
        <span className="numeric">{time.clock}</span> {time.period}
      </p>
    </div>
  );
}

export function VenueBlock({
  view,
  copy,
  buttonClassName,
  nameClassName = 'text-2xl',
}: {
  view: InvitationView;
  copy: InvitationCopy;
  buttonClassName: string;
  nameClassName?: string;
}) {
  return (
    <div>
      <p className="font-inv-body text-[0.6875rem] tracking-[0.2em] text-inv-accent">
        {copy.labels.venue}
      </p>

      <p className={cn('mt-2.5 font-inv-display leading-snug text-inv-ink text-balance', nameClassName)}>
        {view.venueName}
      </p>

      {view.venueMapUrl ? (
        <a
          href={view.venueMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('tap-target mt-5 inline-flex items-center gap-2 rounded-full font-inv-body text-sm transition active:scale-95', buttonClassName)}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-inv-accent" aria-hidden="true">
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
  );
}

export { PhotoFrame } from '@/components/invitation/PhotoFrame';

export function CountdownBlock({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  return <Countdown targetMs={view.eventInstantMs} copy={copy} eventType={view.eventType} />;
}

export function MessageBlock({ view }: { view: InvitationView }) {
  if (!view.customMessage) return null;

  return (
    <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted text-pretty">
      {view.customMessage}
    </p>
  );
}

export function FooterBlock({ view, ornament }: { view: InvitationView; ornament?: ReactNode }) {
  return (
    <Reveal className="mt-14">
      {ornament}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-inv-body text-xs tracking-wide text-inv-muted/80 transition hover:text-inv-accent"
      >
        {view.lang === 'AR' ? 'صنع بواسطة qlty.events' : 'Made with qlty.events'}
      </a>
    </Reveal>
  );
}
