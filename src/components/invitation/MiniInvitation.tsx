import { Divider } from './Ornaments';
import { cn } from '@/lib/cn';
import { formatEventDate } from '@/lib/format';
import { invitationFontVariables } from '@/lib/fonts';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { getInvitationCopy } from '@/i18n/invitation';
import { getTheme, themeStyle } from '@/themes/registry';
import type { EventType, Lang } from '@/generated/prisma/enums';

/**
 * A small, true to life rendering of an invitation, drawn with real data.
 *
 * Shared between the theme picker, where it is what the customer chooses from, and the
 * admin approval screen, where it is how the operator sees what they are about to make
 * live. One component so the operator is never approving something that looks slightly
 * different from what was built.
 */
export function MiniInvitation({
  themeId,
  lang,
  name1,
  name2,
  eventDate,
  eventType,
  size = 'sm',
  className,
}: {
  themeId: string;
  lang: Lang;
  name1: string;
  name2: string;
  eventDate: Date;
  eventType: EventType;
  /**
   * `lg` is the same card at reading size, for the design question, where this is the
   * main thing on screen rather than one of four thumbnails.
   *
   * Deliberately a size and nothing else. The content is identical at both sizes,
   * because the operator approves an invitation through this component and it must not
   * be able to show them something the customer was not shown.
   */
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const large = size === 'lg';
  const theme = getTheme(themeId);
  const copy = getInvitationCopy(lang);

  return (
    <div
      lang={htmlLangFor(lang)}
      dir={dirFor(lang)}
      style={themeStyle(theme, lang)}
      className={cn(
        invitationFontVariables,
        'flex flex-col items-center bg-inv-bg text-center',
        large ? 'px-6 py-12' : 'px-5 py-7',
        className,
      )}
    >
      <p
        className={cn(
          'font-inv-body text-inv-muted',
          large ? 'text-xs tracking-[0.35em]' : 'text-[0.5625rem] tracking-[0.3em]',
        )}
      >
        {copy.eventName[eventType]}
      </p>

      <Divider className={large ? 'my-5' : 'my-3 scale-75'} />

      <p
        className={cn(
          'font-inv-display leading-snug text-inv-ink text-balance',
          large ? 'text-3xl' : 'text-lg',
        )}
      >
        {name1 || copy.roleGroom}
      </p>
      <p
        className={cn('font-inv-display text-inv-accent', large ? 'text-base' : 'text-[0.6875rem]')}
        aria-hidden="true"
      >
        {copy.nameSeparator}
      </p>
      <p
        className={cn(
          'font-inv-display leading-snug text-inv-ink text-balance',
          large ? 'text-3xl' : 'text-lg',
        )}
      >
        {name2 || copy.roleBride}
      </p>

      <Divider className={large ? 'my-5' : 'my-3 scale-75'} />

      <p
        className={cn(
          'font-inv-body tracking-widest text-inv-accent',
          large ? 'text-sm' : 'text-[0.625rem]',
        )}
      >
        {formatEventDate(eventDate, lang)}
      </p>
    </div>
  );
}
