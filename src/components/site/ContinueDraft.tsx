import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * The way back into a half built invitation, for somebody who arrived at the root.
 *
 * Before the root became the brand home, a returning customer landed on the builder and
 * their draft was simply there: the httpOnly cookie resolved and the form came back
 * filled in. Now they land one door earlier, and without this bar the only trace of an
 * evening's work would be a "Create your invitation" button that looks like starting
 * from nothing. There are no accounts in this product, so a customer who does not find
 * their draft has lost it.
 *
 * The caller resolves the draft server side and renders nothing when there is none. No
 * fetch, no client database access, and no flash of a bar that then disappears.
 */
export function ContinueDraft({
  lang,
  t,
  names,
}: {
  lang: Lang;
  t: Dictionary;
  /** The couple, when they have been typed. A draft this young may hold neither name. */
  names: string | null;
}) {
  // Pointing the way the reader is already going, which is leftwards in Arabic.
  const Arrow = lang === 'AR' ? ArrowLeft : ArrowRight;

  return (
    <Link
      href="/invitations"
      className="press flex items-center gap-3 rounded-lg border border-primary/30 bg-secondary/60 px-4 py-3 transition hover:bg-secondary"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{t.home.continueTitle}</span>
        {names ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{names}</span>
        ) : null}
      </span>

      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
        {t.home.continueCta}
        <Arrow className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
