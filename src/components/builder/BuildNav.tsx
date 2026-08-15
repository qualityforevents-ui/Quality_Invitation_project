'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

/**
 * The way back, and the sense of place.
 *
 * The builder used to be one directional. Every step had a button forward and none had a
 * button back, so somebody who reached the payment screen and noticed the bride's name
 * was misspelled had no route to the field that held it: the only way was the browser's
 * own back button, three times, with no assurance their answers had survived.
 *
 * Two things fix that together. A back control in the corner of every step, and a row of
 * steps whose completed entries are links, so the same person can go straight to the
 * data instead of walking backwards through the design and the preview to reach it.
 * Steps ahead are not links, because arriving at the payment screen without a date is
 * not somewhere worth being.
 */

export type StepKey = 'data' | 'design' | 'preview' | 'payment';

const ORDER: Array<{ key: StepKey; href: string }> = [
  { key: 'data', href: '/build' },
  { key: 'design', href: '/build/theme' },
  { key: 'preview', href: '/build/preview' },
  { key: 'payment', href: '/build/payment' },
];

/** Where each step goes back to. The first leaves the builder entirely. */
const BACK_TO: Record<StepKey, string> = {
  data: '/',
  design: '/build',
  preview: '/build/theme',
  payment: '/build/preview',
};

function stepFromPath(pathname: string): StepKey | null {
  if (pathname === '/build') return 'data';
  if (pathname.startsWith('/build/theme')) return 'design';
  if (pathname.startsWith('/build/preview')) return 'preview';
  if (pathname.startsWith('/build/payment')) return 'payment';
  // The status screen is an outcome rather than a step, so it carries neither.
  return null;
}

/**
 * A back control, drawn as an arrow in a ring.
 *
 * The arrow is mirrored under `rtl:`, because back is a direction rather than a shape:
 * in Arabic the page runs right to left, so the way back points right. The button sits
 * at the inline start, which is the top right corner in Arabic and the top left in
 * English, without either being hard coded.
 */
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="press tap-target -ms-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white/70 text-ink-soft hover:border-gold/50 hover:text-gold-deep"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 rtl:rotate-180" aria-hidden="true">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M13.2 8.4 9.6 12l3.6 3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export function BuildNav({
  labels,
  backLabel,
  stepWord,
  ofWord,
  children,
}: {
  /** Step names in the builder's language, keyed to match ORDER. */
  labels: Record<StepKey, string>;
  backLabel: string;
  stepWord: string;
  ofWord: string;
  /** The language toggle, rendered on the server and placed at the end of the row. */
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = stepFromPath(pathname);
  const index = current ? ORDER.findIndex((step) => step.key === current) : -1;

  const header = (
    <div className="flex items-center gap-3 py-4">
      {/* The status screen is an outcome, not a step, so it gets the header without a
          way back into a form it has already left behind. */}
      {current ? <BackButton href={BACK_TO[current]} label={backLabel} /> : null}

      <Link href="/" className="press text-sm font-semibold tracking-wide text-gold-deep">
        qlty.events
      </Link>

      <div className="ms-auto">{children}</div>
    </div>
  );

  if (!current) return header;

  return (
    <>
      {header}

      {/*
        Named rather than numbered alone. "2 of 4" says how much is left; the names say
        what is coming, which is the part that stops somebody abandoning a form because
        they cannot tell whether it ends at the next screen or the tenth.
      */}
      <nav
        aria-label={`${stepWord} ${index + 1} ${ofWord} ${ORDER.length}`}
        className="mb-5 flex items-center gap-1.5"
      >
        {ORDER.map((step, i) => {
          const done = i < index;
          const active = i === index;

          const content = (
            <>
              <span
                className={cn(
                  'block h-1 rounded-full transition-colors',
                  active ? 'bg-gold' : done ? 'bg-gold/45' : 'bg-line',
                )}
              />
              <span
                className={cn(
                  'mt-1.5 block text-[0.6875rem] leading-none transition-colors',
                  active ? 'font-medium text-gold-deep' : done ? 'text-ink-soft' : 'text-ink-faint',
                )}
              >
                {labels[step.key]}
              </span>
            </>
          );

          // Only what is already behind them is reachable. Jumping ahead would land the
          // customer on a screen the step they skipped was there to fill in.
          return done ? (
            <Link
              key={step.key}
              href={step.href}
              className="press min-w-0 flex-1 text-start"
              aria-current={undefined}
            >
              {content}
            </Link>
          ) : (
            <span
              key={step.key}
              className="min-w-0 flex-1"
              aria-current={active ? 'step' : undefined}
            >
              {content}
            </span>
          );
        })}
      </nav>
    </>
  );
}
