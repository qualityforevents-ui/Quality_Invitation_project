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
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'block w-full overflow-hidden rounded-2xl border-2 text-start transition',
        selected ? 'border-gold shadow-[0_8px_24px_-14px_rgba(138,106,50,0.7)]' : 'border-line',
      )}
    >
      <MiniInvitation
        themeId={theme.id}
        lang={lang}
        name1={name1}
        name2={name2}
        eventDate={eventDate}
        eventType={eventType}
      />

      <div className="flex items-center justify-between bg-white px-4 py-3">
        <span className="text-sm font-medium text-ink">{themeName(theme, uiLang)}</span>
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border',
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
    </button>
  );
}
