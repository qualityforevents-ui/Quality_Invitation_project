'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { dirFor, htmlLangFor } from '@/i18n/ui';
import { getInvitationCopy } from '@/i18n/invitation';
import { invitationFontVariables } from '@/lib/fonts';
import { getThemeComponents } from '@/themes/components';
import { themeName, themeStyle, type ThemeDefinition } from '@/themes/registry';
import type { InvitationView } from '@/lib/invitation-view';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

/**
 * The phone the covers were drawn for.
 *
 * Every cover in src/themes is authored against a ~360px screen and sizes itself with
 * `h-full`, so a preview is that screen rendered at its real size and then scaled down
 * as one unit. Scaling rather than shrinking is what makes this an honest preview:
 * nothing reflows, nothing picks a different breakpoint, and the ornaments keep the
 * proportions they were drawn with. What is in the tile is the card, at 55%.
 */
const STAGE_W = 360;
const STAGE_H = 620;

/** How much of the picker's width the centre card takes, leaving its neighbours peeking. */
const TILE_RATIO = 0.62;
const TILE_MIN = 168;
const TILE_MAX = 248;

/**
 * A real cover, rendered small.
 *
 * Not a diagram of a theme and not a re-typesetting of one: this mounts the same
 * component the guest's phone mounts, with the customer's own names, date and language.
 * The picker used to show an abstract swatch of three grey dashes over the theme's
 * background colour and, under it, a generic card that wore no theme's ornament at all —
 * so the two things on screen were a colour chip and a design that did not exist. The
 * only preview worth showing is the thing itself.
 */
function CoverStage({
  theme,
  view,
  scale,
}: {
  theme: ThemeDefinition;
  view: InvitationView;
  scale: number;
}) {
  const { Cover } = getThemeComponents(theme.id);
  const copy = getInvitationCopy(view.lang, { verseId: view.verseId, quote: view.quote });

  return (
    <div
      lang={htmlLangFor(view.lang)}
      dir={dirFor(view.lang)}
      style={{
        ...themeStyle(theme, view.lang),
        width: STAGE_W,
        height: STAGE_H,
        transform: `scale(${scale})`,
      }}
      /*
       * Pinned to the physical top left, not merely placed there.
       *
       * The stage is 360px wide inside a tile of about 200, and an over-wide block in a
       * right-to-left parent is laid out from the parent's right edge, so the whole card
       * sat off to the left of its own tile and the picker showed nine white rectangles.
       * `left-0 top-0` is the pair that `origin-top-left` is scaling from.
       */
      className={cn(
        invitationFontVariables,
        'absolute left-0 top-0 origin-top-left bg-inv-bg text-inv-ink',
      )}
    >
      {/* The cover's own open button is inside a `pointer-events-none` wrapper upstairs,
          so this never fires. It is required, not optional, hence a noop rather than a
          missing prop. */}
      <Cover view={view} copy={copy} onOpen={() => {}} />
    </div>
  );
}

/**
 * Choosing a design by looking at it.
 *
 * One card at a time, at the size a decision can actually be made at, with its
 * neighbours showing at the edges so it is obvious there are more and which way they
 * are. Swiping is the whole interaction: the card you stop on is the card you have
 * chosen, so browsing and choosing are one gesture instead of two.
 *
 * Selection commits when the scroll settles rather than on every frame of a fling,
 * because choosing a design also moves the music track under it and doing that eight
 * times during one flick is work nobody asked for.
 */
export function ThemePicker({
  t,
  uiLang,
  view,
  choices,
  value,
  onChange,
  onOpen,
}: {
  t: Dictionary;
  uiLang: Lang;
  /** The flow's live values. Each tile renders it with its own theme id swapped in. */
  view: InvitationView;
  choices: ThemeDefinition[];
  value: string;
  onChange: (themeId: string) => void;
  /** Opens the full preview on the design in the middle. */
  onOpen: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedIndex = Math.max(
    0,
    choices.findIndex((theme) => theme.id === value),
  );

  /*
   * Which card is under the customer's thumb, which is not always which one is saved.
   * The ring, the name and the dots follow this immediately so the strip feels attached
   * to the finger; `onChange` follows it once the scrolling stops.
   */
  const [index, setIndex] = useState(selectedIndex);

  const [box, setBox] = useState({ width: 0, tile: TILE_MIN });
  const scale = box.tile / STAGE_W;
  const tileH = Math.round(STAGE_H * scale);
  const pad = Math.max(0, Math.round((box.width - box.tile) / 2));

  /*
   * Centring by delta, never by `scrollLeft`.
   *
   * The builder runs in Arabic as often as in English, and the origin of `scrollLeft` in
   * a right-to-left scroller is one of the few places browsers still disagree with each
   * other. A distance between two `getBoundingClientRect` centres is the same number in
   * both directions, and `scrollBy` takes it as a visual offset, so this is correct in
   * Arabic without a single direction check.
   */
  const centerOn = useCallback((target: number, smooth: boolean) => {
    const scroller = scrollerRef.current;
    const slide = slideRefs.current[target];
    if (!scroller || !slide) return;

    const scrollerBox = scroller.getBoundingClientRect();
    const slideBox = slide.getBoundingClientRect();
    const delta =
      slideBox.left + slideBox.width / 2 - (scrollerBox.left + scrollerBox.width / 2);

    if (Math.abs(delta) < 1) return;
    scroller.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  /* Sizing. The tile is a fraction of the picker so the neighbours always peek by the
     same proportion, capped so it does not become a poster on a desktop. */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () => {
      const width = scroller.clientWidth;
      const tile = Math.round(Math.min(TILE_MAX, Math.max(TILE_MIN, width * TILE_RATIO)));
      setBox((current) =>
        current.width === width && current.tile === tile ? current : { width, tile },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  /* Re-centre whenever the geometry changes, including the first time it is known.
     Without this the strip opens on the first design rather than the chosen one. */
  useLayoutEffect(() => {
    if (box.width === 0) return;
    centerOn(index, false);
    // Re-running on `index` would fight the scroll handler that sets it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.width, box.tile, centerOn]);

  /* A design changed from outside the strip — the section reopened on a saved answer,
     or a retired theme joined the list. Follow it. */
  useEffect(() => {
    if (choices[index]?.id === value) return;
    setIndex(selectedIndex);
    centerOn(selectedIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /*
   * Reading the strip, rather than being told about it.
   *
   * `scrollend` would say this in one line and Safari does not have it, so the position
   * is sampled on a frame and the choice is committed a beat after the last sample. The
   * beat is what keeps a fling from writing nine designs into the draft on its way past.
   */
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onScroll = useCallback(() => {
    if (frame.current) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const middle = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;

      let nearest = 0;
      let best = Infinity;
      /* Bounded by the list rather than by the ref array, which keeps whatever length it
         last grew to: a retired design leaves the list the moment another is chosen, and
         its abandoned ref would otherwise still be in the running for the centre. */
      for (let i = 0; i < choices.length; i += 1) {
        const slide = slideRefs.current[i];
        if (!slide) continue;
        const slideBox = slide.getBoundingClientRect();
        const distance = Math.abs(slideBox.left + slideBox.width / 2 - middle);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      }

      setIndex(nearest);

      clearTimeout(settle.current);
      settle.current = setTimeout(() => {
        const theme = choices[nearest];
        if (theme && theme.id !== value) onChange(theme.id);
      }, 120);
    });
  }, [choices, onChange, value]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(settle.current);
    },
    [],
  );

  /** An arrow, an arrow key, or a tap on a neighbour: move there and take it. */
  const select = useCallback(
    (target: number) => {
      const clamped = Math.min(choices.length - 1, Math.max(0, target));
      const theme = choices[clamped];
      if (!theme) return;

      setIndex(clamped);
      centerOn(clamped, true);
      if (theme.id !== value) onChange(theme.id);
    },
    [centerOn, choices, onChange, value],
  );

  /*
   * A tap means "bring that one here" on a neighbour and "open this" on the one already
   * here.
   *
   * Which is the only reading of a tap that is not a surprise in either place. A tap on
   * a card at the edge of the strip cannot mean open, because what the customer is
   * looking at is a third of a design; and a second tap on the card they have already
   * brought to the middle cannot mean select, because it is already selected. The card
   * is a picture of a closed invitation with an open button drawn on it, so pressing it
   * doing what that button does is the thing it already looks like it will do.
   */
  const press = useCallback(
    (target: number) => {
      if (target === index) onOpen();
      else select(target);
    },
    [index, onOpen, select],
  );

  const rtl = uiLang === 'AR';
  const current = choices[index] ?? choices[0];

  return (
    <div>
      <div
        ref={scrollerRef}
        role="radiogroup"
        aria-label={t.flow.themeTitle}
        onScroll={onScroll}
        onKeyDown={(event) => {
          const back = rtl ? 'ArrowRight' : 'ArrowLeft';
          const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (event.key === back) {
            event.preventDefault();
            select(index - 1);
          } else if (event.key === forward) {
            event.preventDefault();
            select(index + 1);
          }
        }}
        /* `overflow-y-visible` would turn this into a second scroll container on the
           cross axis and clip the lifted centre tile. Room is made with padding. */
        className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-2"
        style={{ paddingInline: pad + 20 }}
      >
        {choices.map((theme, i) => {
          const isCurrent = i === index;
          /* Only the card in hand and the two peeking beside it are real. A cover is a
             page of animated SVG; nine of them mounted at once is a phone getting warm
             for eight designs nobody is looking at. */
          const live = Math.abs(i - index) <= 1;

          return (
            <div
              key={theme.id}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              className="relative shrink-0 snap-center"
              style={{ width: box.tile, height: tileH }}
            >
              <div
                className={cn(
                  'relative h-full w-full overflow-hidden rounded-2xl border transition duration-200 ease-out',
                  isCurrent
                    ? 'border-primary shadow-[0_16px_36px_-20px_rgba(35,32,27,0.7)]'
                    : 'scale-[0.93] border-border opacity-60',
                )}
              >
                {live ? (
                  /* Hidden from screen readers, and unclickable, so the strip is nine
                     named choices rather than nine copies of the invitation's text with
                     nine "open" buttons inside them. */
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <CoverStage theme={theme} view={{ ...view, themeId: theme.id }} scale={scale} />
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    style={themeStyle(theme, view.lang)}
                    className="absolute inset-0 bg-inv-bg"
                  />
                )}

                <button
                  type="button"
                  role="radio"
                  aria-checked={isCurrent}
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={() => press(i)}
                  className="absolute inset-0 h-full w-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="sr-only">
                    {isCurrent
                      ? `${themeName(theme, uiLang)} — ${t.theme.themeView}`
                      : themeName(theme, uiLang)}
                  </span>
                </button>

                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className="rise pointer-events-none absolute top-2 end-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* The name of what is on screen, and the two ways to move that are not a swipe.
          The arrows are the desktop and the accessible path to the same strip. */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <ArrowButton
          label={t.theme.themePrev}
          disabled={index === 0}
          onClick={() => select(index - 1)}
        />

        <p className="min-w-0 flex-1 truncate text-center text-base font-semibold">
          {themeName(current, uiLang)}
        </p>

        <ArrowButton
          label={t.theme.themeNext}
          flip
          disabled={index === choices.length - 1}
          onClick={() => select(index + 1)}
        />
      </div>

      <div aria-hidden="true" className="mt-2 flex items-center justify-center gap-1.5">
        {choices.map((theme, i) => (
          <span
            key={theme.id}
            className={cn(
              'h-1.5 rounded-full transition-all duration-200',
              i === index ? 'w-4 bg-primary' : 'w-1.5 bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  disabled,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="tap-target flex size-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition disabled:opacity-30"
    >
      {/* One glyph, turned. In Arabic the whole row is mirrored by direction, so the
          chevron has to be mirrored back or both arrows point the same way. */}
      <ChevronLeft
        aria-hidden="true"
        className={cn('size-4', flip ? 'rotate-180 rtl:rotate-0' : 'rtl:rotate-180')}
      />
    </button>
  );
}
