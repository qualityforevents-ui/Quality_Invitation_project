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
  className,
}: {
  themeId: string;
  lang: Lang;
  name1: string;
  name2: string;
  eventDate: Date;
  eventType: EventType;
  className?: string;
}) {
  const theme = getTheme(themeId);
  const copy = getInvitationCopy(lang);

  return (
    <div
      lang={htmlLangFor(lang)}
      dir={dirFor(lang)}
      style={themeStyle(theme, lang)}
      className={cn(
        invitationFontVariables,
        'flex flex-col items-center bg-inv-bg px-5 py-7 text-center',
        className,
      )}
    >
      <p className="font-inv-body text-[0.5625rem] tracking-[0.3em] text-inv-muted">
        {copy.eventName[eventType]}
      </p>

      <Divider className="my-3 scale-75" />

      <p className="font-inv-display text-lg leading-snug text-inv-ink text-balance">
        {name1 || copy.roleGroom}
      </p>
      <p className="font-inv-display text-[0.6875rem] text-inv-accent" aria-hidden="true">
        &amp;
      </p>
      <p className="font-inv-display text-lg leading-snug text-inv-ink text-balance">
        {name2 || copy.roleBride}
      </p>

      <Divider className="my-3 scale-75" />

      <p className="font-inv-body text-[0.625rem] tracking-widest text-inv-accent">
        {formatEventDate(eventDate, lang)}
      </p>
    </div>
  );
}
