'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Lang } from '@/generated/prisma/enums';

/**
 * السجل's furniture: the ruled sheet, the ledger tile, and the seal.
 *
 * One bin and deliberately the sparsest in the set. There is no divider object here on
 * purpose — where a break is needed the table leaves a row empty, which is what a
 * register does and what every other theme reaches for an ornament to do.
 *
 * Nothing in this file uses an SVG id, a gradient, a mask or a filter. Two of these
 * render twice on one page in the builder preview, and an id that is a literal string
 * resolves to whichever copy was written first; having none at all is cheaper than
 * threading useId through, and it is the reason the seal's inscription is HTML rather
 * than SVG <text>.
 */

/**
 * The pitch, in pixels, and the single number the whole theme is built on.
 *
 * Every vertical measurement in the cover and the card is a multiple of this, which is
 * what keeps the printed rules registered with the type without a line of JavaScript:
 * the rules are a repeating background anchored to the top of the page, so as long as
 * nothing between the top and a given row is an odd height, that row lands on a rule.
 * The verse pitfall is the sharp end of this — see the note on the verse in the card.
 */
export const PITCH = 44;

/**
 * The printed rule, drawn 34px down each 44px band rather than at the foot of it.
 *
 * Both faces in this theme put the baseline of a 11–17px line roughly 24–28px into a
 * 44px line box, so a rule at 34 sits six to ten pixels under the type — close enough
 * to read as writing ON a line, far enough that Arabic descenders and the dots under
 * ب ج ي do not run through it. A rule at the foot of the band would leave the type
 * floating in the middle of an empty cell, which is a spreadsheet, not a register.
 */
const RULE_IMAGE =
  'repeating-linear-gradient(to bottom, transparent 0 33px, currentColor 33px 34px, transparent 34px 44px)';

/**
 * The register sheet: printed rules across the full width of the page, and the wash
 * that keeps the ones ahead of the reader pale.
 *
 * THE MOTION SIGNATURE. The rules ink in as you read: dark from the middle of the
 * viewport upward, pale below it, so the register appears to be filled as it is
 * scrolled. It is scroll-linked by construction rather than by subscription — the wash
 * is one `fixed` element carrying a static gradient, so it is composited once and never
 * repaints, never listens to scroll, and costs a mid-range Android exactly nothing. A
 * scroll handler writing a custom property would produce the identical picture at the
 * price of a paint every frame down a page this long.
 *
 * The arithmetic: --inv-line is 0.26 alpha, and the wash lays the page colour over it
 * at 0.62, which leaves 0.10 showing through. That is the pale end the theme is
 * specified at, and the dark end is the rule's own value untouched.
 *
 * Reduced motion is handled in CSS rather than in JavaScript, so there is no first
 * paint at the wrong state and no hydration branch: the wash simply is not there, and
 * every rule is at its finished 0.26 from the first frame.
 */
export function RuledSheet() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-inv-line"
        style={{ backgroundImage: RULE_IMAGE }}
      />

      {/*
        The page colour is read from the theme variable rather than restated, and it is
        an inline style because a gradient stop at calc(50% + 40px) has no utility form.
        `fixed` is what makes the band track the viewport centre; it also scopes itself
        to the builder's preview popup, because a transformed ancestor becomes the
        containing block for a fixed descendant.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.62] motion-reduce:opacity-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 50%, var(--inv-bg) calc(50% + 40px))',
        }}
      />
    </>
  );
}

/**
 * The ledger tile. The rule pitch continued at 6% inside a panel band, so the panel
 * reads as more of the same paper rather than as a card laid on top of it.
 *
 * A panel band paints over the printed rules behind it — that is unavoidable, an opaque
 * background is opaque — so it carries its own. It lands in register because every band
 * in this theme starts at a multiple of the pitch and the pattern is periodic.
 */
export function LedgerTile() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-inv-ink opacity-[0.06]"
      style={{ backgroundImage: RULE_IMAGE }}
    />
  );
}

/**
 * The 24 milled teeth of the seal's outer edge, as line segments on an ellipse.
 *
 * Module scope rather than a render-time loop: the geometry never changes, and this
 * component appears twice on a page.
 */
const MILLING = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const round = (value: number) => Math.round(value * 100) / 100;

  return {
    x1: round(60 + 53 * cos),
    y1: round(60 + 43 * sin),
    x2: round(60 + 58 * cos),
    y2: round(60 + 48 * sin),
  };
});

/**
 * THE SEAL. A double-ringed oval with a milled edge and a two-line inscription, tilted
 * two degrees off square the way a stamp lands.
 *
 * The inscription is HTML sitting over the SVG rather than <text> on a <textPath>, for
 * the same reason the shared Monogram sets its initials in HTML: it picks up the
 * theme's own face, and — the part that actually matters here — Arabic on a curved
 * textPath is shaped inconsistently across Android WebViews, where letters that should
 * join come apart. A straight inscription that is always correct beats a curved one
 * that is sometimes a row of disconnected glyphs.
 *
 * Sized from a container query so one component serves the 120px hero and the 88px
 * stamp on the photo without a second set of type sizes.
 *
 * The tilt is a physical rotation, not a logical one. A stamp tilts the same way for
 * both readers; mirroring it would be mirroring a physical object for no reason.
 */
export function Seal({
  inscription,
  mark,
  className,
}: {
  /** What the stamp says. The occasion, in the card's own language. */
  inscription: string;
  /** The register's own mark: the entry number. */
  mark: string;
  className?: string;
}) {
  return (
    <div className={cn('@container relative rotate-2', className)} aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" className="absolute inset-0 h-full w-full">
        <g className="text-inv-accent">
          <ellipse cx="60" cy="60" rx="53" ry="43" stroke="currentColor" strokeWidth="1" />
          {MILLING.map((tooth) => (
            <line
              key={`${tooth.x1},${tooth.y1}`}
              x1={tooth.x1}
              y1={tooth.y1}
              x2={tooth.x2}
              y2={tooth.y2}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
        </g>

        {/* The inner ring is the one place accent-soft is allowed to appear: it is a
            2.33:1 colour and carries no text, so it draws and never has to be read. */}
        <ellipse
          cx="60"
          cy="60"
          rx="45"
          ry="35"
          className="text-inv-accent-soft"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-[14%] text-center">
        <span className="font-inv-body text-[length:9cqw] leading-tight text-inv-accent text-balance">
          {inscription}
        </span>
        <span className="numeric mt-[2cqw] font-inv-display text-[length:14cqw] leading-none text-inv-accent">
          {mark}
        </span>
      </div>
    </div>
  );
}

/**
 * The four words this theme needs that the shared copy does not carry.
 *
 * Every other string on the card comes from InvitationCopy. These four are register
 * furniture rather than invitation language — no other theme has a use for them — so
 * they live with the theme instead of being pushed into the shared pack. If a second
 * theme ever wants them, that is the moment they move to src/i18n/invitation.ts.
 */
export const REGISTER_LABELS: Record<Lang, { entry: string; poetry: string; hijri: string; gregorian: string }> = {
  AR: { entry: 'قيد رقم', poetry: 'الأبيات', hijri: 'هـ', gregorian: 'م' },
  EN: { entry: 'Entry no.', poetry: 'Lines', hijri: 'AH', gregorian: 'CE' },
};

/**
 * The entry number, derived rather than stored.
 *
 * A register entry has a number, and a card with a made-up one that changed on every
 * render would be a hydration mismatch as well as a lie. This hashes the three fields
 * that identify the entry, so the same invitation always carries the same number and
 * two different couples effectively never share one.
 */
export function entryNumber(name1: string, name2: string, eventDate: Date): string {
  const seed = `${name1}|${name2}|${eventDate.getTime()}`;

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) >>> 0;
  }

  return (hash % 10000).toString().padStart(4, '0');
}

/**
 * The event's date in both calendars, as bare Y/M/D digits.
 *
 * Built from formatToParts rather than from a formatted string because ICU appends an
 * era to a non-Gregorian calendar in some locales and not others, and the era belongs
 * beside the number as our own label, not inside a string we then have to parse it out
 * of. The numbering system is pinned to latn for the same reason src/lib/format.ts
 * pins it: Egyptian invitations print Western digits even in Arabic.
 *
 * Umm al-Qura is the civil Hijri calendar Egypt and the Gulf date documents by. If a
 * runtime is built without its calendar data the Hijri line is simply absent, which the
 * header is written to survive.
 */
export function registerDates(
  eventDate: Date,
  lang: Lang,
): { hijri: string | null; gregorian: string } {
  const base = lang === 'AR' ? 'ar-EG' : 'en-GB';
  const digits = lang === 'AR' ? '-nu-latn' : '';

  const ymd = (locale: string): string | null => {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC',
      }).formatToParts(eventDate);

      const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((candidate) => candidate.type === type)?.value ?? '';

      const year = part('year');
      if (!year) return null;

      return `${year}/${part('month')}/${part('day')}`;
    } catch {
      return null;
    }
  };

  return {
    hijri: ymd(`${base}-u-ca-islamic-umalqura${digits}`),
    gregorian: ymd(`${base}-u${digits || '-nu-latn'}`) ?? '',
  };
}

/**
 * A shared style object for the two name entries.
 *
 * `--sj-wipe` defaults to 0%, which is the UNCLIPPED state, and that default is the
 * safety net: the cover's open animation drives this property from 100% down to 0%, and
 * if a browser or a framer version ever declined to animate a custom property the names
 * would simply be there from the start rather than clipped away to nothing.
 */
export const NAME_CLIP: CSSProperties = {
  clipPath: 'inset(0 var(--sj-wipe-e) 0 var(--sj-wipe-s))',
};

/**
 * The two physical halves of that logical inset.
 *
 * CSS `inset()` has no logical form, so the wipe is composed from two variables and the
 * direction variant swaps which side they land on. One implementation, correct in both
 * directions: the entry writes itself from the side the reader writes from.
 */
export const NAME_CLIP_SIDES =
  '[--sj-wipe:0%] [--sj-wipe-s:0%] [--sj-wipe-e:var(--sj-wipe)] rtl:[--sj-wipe-s:var(--sj-wipe)] rtl:[--sj-wipe-e:0%]';
