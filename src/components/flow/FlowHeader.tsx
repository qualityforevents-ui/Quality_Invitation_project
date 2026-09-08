'use client';

import Link from 'next/link';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';
import type { SaveStatus } from '@/lib/useAutosave';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * The only fixed chrome in the flow.
 *
 * Revealing questions one at a time costs the customer their sense of how much is left,
 * which is exactly the problem the old four step nav existed to solve. The rail under
 * the wordmark is the whole answer to it, and it is not decoration: without it a flow
 * that asks sixteen questions feels endless at the fourth.
 *
 * The save indicator moved here from beside each step heading. There is one page now,
 * so there is one place for it, and it belongs next to the thing that never scrolls
 * away rather than attached to whichever question happens to be open.
 */
export function FlowHeader({
  lang,
  t,
  percent,
  saveStatus,
  started,
}: {
  lang: Lang;
  t: Dictionary;
  percent: number;
  saveStatus: SaveStatus;
  started: boolean;
}) {
  const busy = saveStatus === 'saving' || saveStatus === 'pending';

  return (
    <header className="sticky top-0 z-30 -mx-5 border-b border-transparent bg-background/90 px-5 backdrop-blur transition-colors data-[started=true]:border-border" data-started={started}>
      <div className="flex h-14 items-center gap-3">
        <Link href="/" className="press text-sm font-semibold tracking-wide text-secondary-foreground">
          qlty.events
        </Link>

        {saveStatus !== 'idle' ? (
          <span
            aria-live="polite"
            className={cn(
              'shrink-0 text-xs whitespace-nowrap',
              saveStatus === 'error'
                ? 'rounded-full bg-destructive/10 px-2.5 py-1 font-medium text-destructive'
                : busy
                  ? 'text-muted-foreground'
                  : 'text-success',
            )}
          >
            {saveStatus === 'error' ? t.errors.saveFailedShort : busy ? t.common.saving : t.common.saved}
          </span>
        ) : null}

        <div className="ms-auto">
          <LanguageToggle lang={lang} label={t.common.switchTo} className="h-9 px-3 text-xs" />
        </div>
      </div>

      {started ? (
        <Progress
          value={percent}
          aria-label={t.flow.progressLabel}
          className="h-1 -mb-px rounded-none bg-primary/15"
        />
      ) : null}
    </header>
  );
}
