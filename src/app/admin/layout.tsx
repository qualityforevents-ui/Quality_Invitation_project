import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { getOperator } from '@/lib/admin-auth';
import { getNavCounts } from '@/lib/admin-queries';
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
 *
 * The tab bar is rendered here rather than per page so it survives navigation instead
 * of being torn down and rebuilt on every route change. Its counts are read here too,
 * which is the one query this layout runs — and it runs only for a signed in operator,
 * because this layout also wraps the login screen and that one has no business touching
 * Firestore.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const operator = await getOperator();
  const counts = operator ? await getNavCounts() : null;

  return (
    <div
      lang="ar"
      dir="rtl"
      className={`${uiFontVariables} min-h-dvh bg-adm-bg text-adm-text [color-scheme:light]`}
    >
      {children}
      {counts ? <AdminNav counts={counts} /> : null}
    </div>
  );
}
