'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/invitation/Reveal';
import { cn } from '@/lib/cn';
import { formatEventDateParts, formatEventTimeParts } from '@/lib/format';
import { FooterBlock } from '../sections';
import {
  BullionFringe,
  FOLD_CROP,
  FOLD_LIGHT,
  FOLD_SHADE,
  NAP_SHEEN,
  PLEAT,
  TasselCord,
  pleatImage,
  usePrefersReducedMotion,
} from './MakhmalOrnaments';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * مخمل, revealed.
 *
 * THE AXIS: continuous surface. There is no panel, no card, no margin box and no
 * container of any kind between the content and the page — the whole viewport is one
 * piece of pleated velvet and the words lie directly on it at 28px of inline padding.
 * Where every other theme in the set would draw a rule or open a panel, this folds the
 * material instead: a 44px SEAM where the pleats darken and recover, which is the only
 * separator the theme owns and the only one it uses.
 *
 * Two of the seven seams are load-bearing rather than decorative, and that is the part
 * that makes the fabric structure instead of background. Seam 3 drags its fold down over
 * the poetry's inline-start edge and takes 36px of the measure with it, so the block is
 * genuinely cropped by the drape. Seam 5 shoves everything after it — date, hour, place —
 * 24px off-axis toward inline-end, and only the Maps bar climbs back to full measure.
 *
 * The one flat surface on the page is the verse patch, where the pleats are suppressed
 * outright. That is deliberate and it is the theme's own هيبة rule: the sacred lines get
 * still cloth and no gold anywhere near them.
 */
export function MakhmalInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const reduced = usePrefersReducedMotion();
  const date = formatEventDateParts(view.eventDate, view.lang);
  const time = formatEventTimeParts(view.eventTime, view.lang);

  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(view.photoUrl) && !photoFailed;

  return (
    <div className="relative min-h-dvh bg-inv-bg">
      {/* Outside the clipped column below on purpose: `overflow` on an ancestor is
          allowed to clip fixed descendants, and the fabric must never be clipped. */}
      <NapLayers reduced={reduced} />

      {/* No wrapper width, no max-w, no padding here. Every block pads itself, which is
          what lets the seams, the verse patch and the countdown run edge to edge. */}
      <div className="relative overflow-x-clip pb-24">
        {/* 1. NAMES, lying across the drape with the tassel hanging behind them. */}
        <Reveal immediate>
          <section className="relative px-7 pt-20 pb-12">
            {/*
              Placed logically, flipped physically. Where it hangs relates to the text —
              it belongs on the far side from where reading starts — so `end-3` mirrors;
              the cord's single loop is the theme's one asymmetric shape, so the drawing
              mirrors with it.
            */}
            <TasselCord className="pointer-events-none absolute -top-3 end-2 w-40 text-inv-accent-soft/55 rtl:-scale-x-100" />

            <div className="@container relative">
              {copy.familiesPrefix ? (
                <p className="mb-6 font-inv-body text-[0.8125rem] text-inv-muted">
                  {copy.familiesPrefix}
                </p>
              ) : null}

              {/*
                64px is the design size and 15% of the measure is the cap that keeps it.
                A 390px phone leaves a 334px column, "Abdelrahman" is a single unbreakable
                word, and at 64px it is half a phone wider than the page — so the names
                land near 50px there and only reach full size on a screen that can hold
                them. Nothing clips; long names wrap and the block grows downward.

                font-bold is 700 because 700 is the heaviest Zain cut this build loads.
                The spec asks for 900 and the fix belongs in fonts.ts, not here: asking
                for a weight that is not there buys a synthetic bold, which on a face
                chosen for its flat, unmodulated strokes is the worst of both.
              */}
              <h1 className="font-inv-display font-bold text-inv-ink">
                <span className="block text-[length:min(4rem,15cqw)] leading-[1.1] text-balance">
                  {view.name1}
                </span>
                <span className="my-1.5 block font-inv-body text-2xl text-inv-accent" aria-hidden="true">
                  {copy.nameSeparator}
                </span>
                <span className="block text-[length:min(4rem,15cqw)] leading-[1.1] text-balance">
                  {view.name2}
                </span>
              </h1>
            </div>
          </section>
        </Reveal>

        {/*
          2. BISMILLAH AND VERSE. Arabic card only — all three strings are null in
          English, so the patch and both its seams disappear rather than leaving a band
          of flat colour with nothing in it.
        */}
        {copy.bismillah && copy.verse ? (
          <>
            <Seam reduced={reduced} fringe={false} />

            <Reveal immediate delay={0.15}>
              {/*
                The one place on the page where the pleats stop. A flat, full-bleed patch
                of panel colour: not a card and not a box — it has no border, no radius
                and no margin — but a change of material, the drape pressed still.
              */}
              <section className="bg-inv-panel px-7 py-12">
                <div className="@container">
                  {/*
                    U+FDFD is one ligature about eleven times wider than its font size.
                    2.375rem is the theme's token for it and 8.5% of the column is what
                    keeps it inside a 390px phone; a fixed rem here runs it off both edges
                    at once.

                    Ink, not accent. Gold never touches the verse in this theme — that is
                    the single line that separates this register from the one it sits
                    closest to, and it is not negotiable per block.
                  */}
                  <p
                    className="font-inv-verse text-[length:min(2.375rem,8.5cqw)] leading-none text-inv-ink"
                    aria-label="بسم الله الرحمن الرحيم"
                  >
                    {copy.bismillah}
                  </p>

                  <p className="mt-8 font-inv-verse text-[1.0625rem] leading-[2.05] text-inv-ink text-pretty">
                    {copy.verse}
                  </p>

                  {copy.verseSource ? (
                    <p className="mt-4 font-inv-body text-xs text-inv-muted">{copy.verseSource}</p>
                  ) : null}
                </div>
              </section>
            </Reveal>

            {/* Both seams around the patch go without their fringe. The fringe is gold and
                the patch is the verse. */}
            <Seam reduced={reduced} fringe={false} />
          </>
        ) : null}

        {/* 3. POETRY, cropped by the seam above it. */}
        <Seam reduced={reduced} />

        <Reveal>
          <section className="relative ps-16 pe-7">
            {/*
              Seam 3 doing structural work. The fold does not stop at the band: it runs
              down over this block's inline-start edge, and the block's measure starts
              36px late because the drape is lying on it. Mirrored by scaling the element
              rather than by writing a second gradient, so there is one fold and both
              directions get the same one.
            */}
            <span
              className="pointer-events-none absolute -top-11 bottom-0 start-0 w-16 rtl:-scale-x-100"
              style={{ backgroundImage: FOLD_CROP }}
              aria-hidden="true"
            />

            <p className="relative font-inv-body text-[1.125rem] leading-[1.95] text-inv-muted text-pretty">
              {copy.poetry}
            </p>

            {/* 4. THE INVITATION LINE, back at full measure — the fold only reaches the
                block it is lying on. */}
            <p className="relative -ms-9 mt-8 font-inv-body text-[1.0625rem] leading-[1.85] text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
          </section>
        </Reveal>

        {/* 5. ROLES. Two rows, not two columns, with a fringe hung between them. */}
        <Reveal>
          <section className="px-7 pt-11">
            <Role label={copy.roleGroom} name={view.name1} />
            <BullionFringe className="my-6 text-inv-accent/70" />
            <Role label={copy.roleBride} name={view.name2} />
          </section>
        </Reveal>

        {/* 6. PHOTO, set into the drape. */}
        <Seam reduced={reduced} />

        {hasPhoto && view.photoUrl ? (
          <Reveal>
            <section className="px-7 pt-4">
              {/*
                Not framed on the fabric — cut into it. A 3px gold hem marks the cut, and
                inside the hem sits a 12px inset of exposed pleats before the picture
                starts, so the velvet is visibly behind the photograph rather than
                stopping at its edge. 2px of radius and no more: anything softer and this
                becomes a rounded card, which is the one shape the theme does not own.
              */}
              <div
                className="relative border-[3px] border-inv-accent p-3"
                style={{ borderRadius: '2px' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.photoUrl}
                  alt={`${view.name1} & ${view.name2}`}
                  loading="lazy"
                  decoding="async"
                  onError={() => setPhotoFailed(true)}
                  className="block w-full object-cover"
                  style={{ aspectRatio: '4 / 5' }}
                />

                {/* Hung, not mounted: the fringe sits on the hem and its pendants fall
                    into the exposed pleats. */}
                <BullionFringe className="absolute -top-px left-1/2 -translate-x-1/2 text-inv-accent" />
              </div>
            </section>
          </Reveal>
        ) : (
          /*
            No photo is the common case and the better-looking of the two states, so it
            is a design rather than a gap: the fringe stays, on its own, and the pleats
            run through the position uninterrupted. Nothing collapses and nothing is left
            waiting for an image.
          */
          <div className="flex justify-center py-2" aria-hidden="true">
            <BullionFringe className="text-inv-accent/70" />
          </div>
        )}

        {/*
          7, 8 and 9. Seam 5 pushes everything under it 24px off-axis toward inline-end.
          The drape folds the layout, rather than the layout stepping around the drape.
        */}
        <Seam reduced={reduced} />

        <Reveal>
          <section className="ps-[3.25rem] pe-7">
            <p className="font-inv-body text-[0.6875rem] text-inv-muted uppercase [word-spacing:0.3em]">
              {date.weekday}
            </p>

            {/* Bare digits, safe to isolate. The month line below is not isolated — it
                mixes a word with digits and bidi already orders that correctly. */}
            <p className="numeric mt-2 font-inv-display text-[4.5rem] leading-[0.92] font-bold text-inv-accent">
              {date.day}
            </p>

            <p className="mt-1 font-inv-body text-base text-inv-ink">
              {date.month} <span className="numeric">{date.year}</span>
            </p>

            <BullionFringe className="my-6 text-inv-accent/70" />

            <p className="font-inv-body text-base text-inv-muted">
              {copy.labels.time}
              <span className="mx-2 text-inv-accent">·</span>
              <span className="numeric">{time.clock}</span> {time.period}
            </p>

            <p className="mt-9 font-inv-body text-[0.6875rem] text-inv-muted uppercase [word-spacing:0.3em]">
              {copy.labels.venue}
            </p>
            <p className="mt-2 font-inv-body text-[1.1875rem] leading-snug font-bold text-inv-ink text-balance">
              {view.venueName}
            </p>

            {view.venueMapUrl ? (
              /*
                The one element that climbs back onto the axis: a negative inline-start
                margin cancels seam 5's shove exactly, so the bar spans the card's full
                measure while the text above it stays displaced. A solid gold bar rather
                than an outlined pill — an outline drawn on pleats disappears into the
                first fold shadow it crosses.
              */
              <a
                href={view.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target press -ms-6 mt-6 flex items-center justify-center gap-2 bg-inv-accent px-5 py-3.5 font-inv-body text-[0.9375rem] font-medium text-inv-bg"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {copy.labels.mapsButton}
              </a>
            ) : null}
          </section>
        </Reveal>

        {/* 10. COUNTDOWN, four cells straight across the full bleed. */}
        <Seam reduced={reduced} />

        <Reveal>
          <MakhmalCountdown view={view} copy={copy} />
        </Reveal>

        {/* 11. The couple's own words. The builder caps this at 200 characters, so the
            block never has to defend itself against a wall of text. */}
        {view.customMessage ? (
          <Reveal>
            <section className="px-7 pt-12">
              <p className="font-inv-body text-base leading-[1.95] text-inv-muted text-pretty">
                {view.customMessage}
              </p>
            </section>
          </Reveal>
        ) : null}

        {/* 12. FOOTER, under the last fold. */}
        <Seam reduced={reduced} className="mt-12" />
        <div className="px-7">
          <FooterBlock view={view} />
        </div>
      </div>
    </div>
  );
}

/**
 * The nap: the theme's scroll signature and the reason it is worth the top price tier.
 *
 * Two full-height pleat layers at 26px and 27px pitch. Because the pitches differ by one
 * pixel the two gradients beat against each other, and sliding the upper one walks that
 * interference up the page — velvet catching the light as you move past it, an optical
 * effect in the material rather than an element travelling across it. Two elements, one
 * transform, no repaint.
 *
 * Both layers are `fixed` at viewport height and never document height. A
 * repeating-linear-gradient stretched over a 4000px card is a paint cost linear in page
 * length, and that is precisely the shape of cost a mid-range Android cannot absorb.
 *
 * The sheen band is what the eye actually reads as movement: the pleats are vertical, so
 * translating them up the page changes nothing about them on its own. The band moving
 * through the interference is the whole effect.
 */
function NapLayers({ reduced }: { reduced: boolean }) {
  const { scrollYProgress } = useScroll();

  // The entire travel is 40px over the whole document, which is small enough that the
  // moiré swells rather than crawls. Reduced motion pins it at the rest offset, which is
  // also where it starts, so nothing jumps when the media query resolves.
  const napY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ backgroundImage: pleatImage(PLEAT.base) }} />

      {/* Taller than the frame at both ends so 40px of travel never exposes an edge. */}
      <motion.div
        className="absolute inset-x-0 -top-16 h-[calc(100%+8rem)]"
        style={{
          backgroundImage: `${NAP_SHEEN}, ${pleatImage(PLEAT.nap, 0.55)}`,
          y: napY,
          willChange: 'transform',
        }}
      />
    </div>
  );
}

/**
 * A fold in the drape. This theme's only separator, in place of every rule it does not
 * draw.
 *
 * The band is 44px of horizontal shading laid over the fixed pleats, so they visibly
 * darken through it and recover on the other side. The secondary motion runs off the
 * same scroll value as the nap: each seam brightens by 8% as it crosses the viewport
 * centre, driven into opacity on a white copy of the same band, so a fold catches the
 * light as it passes. Opacity only — the band itself never moves.
 */
function Seam({
  reduced,
  fringe = true,
  className,
}: {
  reduced: boolean;
  /** False beside the verse patch: the fringe is gold and gold stays off the verse. */
  fringe?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Reduced motion holds the seam at its mid brightness — the finished state, not a
  // switched-off one.
  const sheen = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [0.04, 0.04, 0.04] : [0, 0.08, 0],
  );

  return (
    <div ref={ref} className={cn('relative h-11', className)} aria-hidden="true">
      <div className="absolute inset-0" style={{ backgroundImage: FOLD_SHADE }} />
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: FOLD_LIGHT, opacity: sheen }}
      />

      {fringe ? (
        <BullionFringe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-inv-accent" />
      ) : null}
    </div>
  );
}

/** One role and its name, stacked. Labels are spread with word-spacing, never tracking:
    letter-spacing is a silent no-op in Arabic, so any rhythm built on it exists only on
    the English card and the two versions quietly stop being the same design. */
function Role({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <p className="font-inv-body text-[0.6875rem] text-inv-muted uppercase [word-spacing:0.3em]">
        {label}
      </p>
      <p className="mt-2 font-inv-body text-[1.3125rem] leading-snug font-bold text-inv-ink text-balance">
        {name}
      </p>
    </div>
  );
}

/**
 * The countdown, written here rather than taken from the shared block.
 *
 * The shared Countdown draws four bordered rings, and a ring is a box: this is the one
 * theme in the set that has no rectangle anywhere in it, so borrowing it would break the
 * only claim the theme makes. The cells run straight across the full bleed instead, held
 * together by a shallow fold behind the row and nothing else.
 *
 * The clock itself follows the shared component's contract exactly, and for the same
 * reason: the first render uses the target as the current time so the server and the
 * client agree, and the real clock takes over one tick after mount.
 */
function MakhmalCountdown({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, view.eventInstantMs - (nowMs ?? view.eventInstantMs));
  const totalSeconds = Math.floor(remaining / 1000);
  const hasPassed = nowMs !== null && view.eventInstantMs - nowMs <= 0;

  if (hasPassed) {
    return (
      <section className="px-7 pt-8">
        <p className="font-inv-display text-3xl font-bold text-inv-accent">{copy.labels.started}</p>
      </section>
    );
  }

  const cells = [
    { value: Math.floor(totalSeconds / 86400), label: copy.labels.countdownDays },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: copy.labels.countdownHours },
    { value: Math.floor((totalSeconds % 3600) / 60), label: copy.labels.countdownMinutes },
    { value: totalSeconds % 60, label: copy.labels.countdownSeconds },
  ];

  return (
    <section className="pt-8">
      <p className="px-7 font-inv-body text-[0.6875rem] text-inv-muted uppercase [word-spacing:0.3em]">
        {copy.labels.countdownHeading}
      </p>

      <div
        className="mt-4 grid grid-cols-4 py-5"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0) 100%)',
        }}
      >
        {cells.map((cell) => (
          <div key={cell.label} className="text-center">
            <span className="numeric block font-inv-display text-[2.25rem] leading-none font-bold text-inv-accent">
              {cell.value.toString().padStart(2, '0')}
            </span>
            <span className="mt-2 block font-inv-body text-[0.625rem] text-inv-muted">
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
