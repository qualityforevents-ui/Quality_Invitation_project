'use client';

import { useEffect } from 'react';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Brings the html element's lang and dir into line with whatever is being rendered.
 *
 * The visible layout does not depend on this. Direction is already set on the wrapper
 * that the server rendered, so text and alignment are correct on first paint. What
 * this fixes is the document level: which side the scrollbar sits on, and what a
 * screen reader announces the page language as.
 *
 * The root layout cannot do this itself without reading a cookie, which would force
 * dynamic rendering onto the invitation pages.
 */
export function SyncDocumentLang({ lang }: { lang: Lang }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = htmlLangFor(lang);
    root.dir = dirFor(lang);
  }, [lang]);

  return null;
}
