'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { COOKIE_MAX_AGE_SECONDS, UI_LANG_COOKIE } from '@/lib/constants';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { cn } from '@/lib/cn';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Switches the builder language.
 *
 * The cookie is written on the client and the server components are then asked to
 * re render, because all the copy is server rendered. The document attributes are set
 * straight away rather than waiting for the refresh, so the flip in direction happens
 * in one frame instead of two.
 *
 * This intentionally does not touch the invitation language. That is a separate
 * choice made on the theme step, and a customer building an Arabic card while reading
 * an English interface is a real case, not a mistake.
 */
export function LanguageToggle({ lang, label, className }: { lang: Lang; label: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next: Lang = lang === 'AR' ? 'EN' : 'AR';

  function switchLanguage() {
    document.cookie = `${UI_LANG_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;

    const root = document.documentElement;
    root.lang = htmlLangFor(next);
    root.dir = dirFor(next);

    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      disabled={isPending}
      aria-label={`Switch language to ${next === 'AR' ? 'Arabic' : 'English'}`}
      className={cn(
        'tap-target rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium text-ink-soft transition hover:text-ink disabled:opacity-50',
        className,
      )}
    >
      {label}
    </button>
  );
}
