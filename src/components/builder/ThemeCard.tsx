import Link from 'next/link';
import { MiniInvitation } from '@/components/invitation/MiniInvitation';
import { cn } from '@/lib/cn';
import { themeName, type ThemeDefinition } from '@/themes/registry';
import type { EventType, Lang } from '@/generated/prisma/enums';

/**
 * A theme in the picker, drawn with the customer's own names and date rather than
 * placeholder text.
 *
 * Typography is most of what is being chosen here, so the miniature re renders whenever
 * the invitation language changes. Seeing "Karim and Salma" set in Cormorant tells you
 * something that a stock thumbnail does not.
 */
export function ThemeCard({
  theme,
  lang,
  uiLang,
  selected,
  name1,
  name2,
  eventDate,
  eventType,
  onSelect,
  viewLabel,
}: {
  theme: ThemeDefinition;
  /** The invitation language, which is what the miniature is drawn in. */
  lang: Lang;
  /** The builder language, used for the caption underneath. */
  uiLang: Lang;
  selected: boolean;
  name1: string;
  name2: string;
  eventDate: Date;
  eventType: EventType;
  onSelect: () => void;
  viewLabel: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border-2 transition',
        selected ? 'border-gold shadow-[0_8px_24px_-14px_rgba(138,106,50,0.7)]' : 'border-line',
      )}
    >
      {/*
        The miniature selects the theme, and the link underneath opens it full screen.
        Kept as siblings rather than nesting the link inside the button: a link inside a
        button is invalid markup and browsers disagree about which one a tap belongs to.
      */}
      <button type="button" onClick={onSelect} aria-pressed={selected} className="block w-full text-start">
        <MiniInvitation
          themeId={theme.id}
          lang={lang}
          name1={name1}
          name2={name2}
          eventDate={eventDate}
          eventType={eventType}
        />
      </button>

      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
        <button type="button" onClick={onSelect} className="flex items-center gap-2 text-start">
          <span className="text-sm font-medium text-ink">{themeName(theme, uiLang)}</span>
        </button>

        {/*
          An eye, not a word. The card already carries a name, a tick and a miniature,
          and a fourth piece of text made the caption row read like a sentence. The
          label survives for screen readers and as the hover title.
        */}
        <Link
          href={`/build/preview?theme=${theme.id}`}
          aria-label={viewLabel}
          title={viewLabel}
          className="tap-target ms-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-gold/50 hover:text-gold-deep active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M2.75 12S6.25 5.75 12 5.75 21.25 12 21.25 12 17.75 18.25 12 18.25 2.75 12 2.75 12Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="13" cy="11" r="0.9" fill="currentColor" />
          </svg>
        </Link>
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-gold bg-gold' : 'border-line',
          )}
          aria-hidden="true"
        >
          {selected ? (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </div>
    </div>
  );
}
