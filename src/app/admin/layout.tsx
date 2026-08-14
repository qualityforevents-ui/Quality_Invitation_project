import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { uiFontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'qlty admin',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Built for one person, on one phone, at odd hours.
 *
 * The admin is never linked from any customer page and never appears in public HTML.
 * It is reached by typing the address, and it is noindex at the route level in
 * next.config.ts as well as here.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      lang="ar"
      dir="rtl"
      className={`${uiFontVariables} min-h-dvh bg-adm-bg text-adm-text [color-scheme:dark]`}
    >
      {children}
    </div>
  );
}
