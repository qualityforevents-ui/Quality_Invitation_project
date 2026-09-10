'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, LayoutGrid, MessageSquareQuote, PenLine } from 'lucide-react';
import { cn } from '@/lib/cn';

export type NavCounts = { pending: number; drafts: number; reviews: number };

const ITEMS = [
  { href: '/admin', label: 'الطلبات', icon: Inbox, badge: 'pending' as const, exact: true },
  { href: '/admin/all', label: 'الكل', icon: LayoutGrid, badge: null, exact: false },
  { href: '/admin/drafts', label: 'المسودات', icon: PenLine, badge: 'drafts' as const, exact: false },
  { href: '/admin/reviews', label: 'الآراء', icon: MessageSquareQuote, badge: 'reviews' as const, exact: false },
];

/**
 * The four places there are to be, always on screen.
 *
 * Everything here used to hang off the home screen: drafts and reviews were two links
 * at the bottom of it, and getting from one to the other meant going back through
 * home. That is a website's shape, and this is not a website — it is a tool one person
 * opens twenty times a day, on a phone, usually with one hand, to do one of four
 * things. A tab bar is the shape of that, and it puts every destination inside thumb
 * reach at the bottom of the screen rather than at the top where nothing on a modern
 * phone should live.
 *
 * The counts are the other half of it. A queue you have to open to discover is empty
 * is a queue you check compulsively; a number on a tab is the same information without
 * the trip.
 */
export function AdminNav({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="أقسام الإدارة"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-adm-line bg-adm-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-lg items-stretch">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count = item.badge ? counts[item.badge] : 0;
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                /* The count is part of the destination's name to a screen reader —
                   "المسودات، 12" — rather than a stray number read after it. */
                aria-label={count > 0 ? `${item.label}، ${count}` : undefined}
                className={cn(
                  'press tap-target relative flex flex-col items-center justify-center gap-1 py-2',
                  active ? 'text-adm-accent' : 'text-adm-muted',
                )}
              >
                <span className="relative">
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  {count > 0 ? (
                    <span
                      aria-hidden
                      className="numeric absolute -top-1.5 -end-2.5 min-w-4 rounded-full bg-adm-danger px-1 text-[0.625rem] font-bold text-white"
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  ) : null}
                </span>
                <span className="text-[0.6875rem] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
