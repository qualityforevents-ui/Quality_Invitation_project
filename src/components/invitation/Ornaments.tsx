import { cn } from '@/lib/cn';

/**
 * Ornaments are inline SVG rather than image files.
 *
 * They inherit currentColor, so a theme changes their colour by changing one variable,
 * and they cost nothing to deliver over mobile data at a family gathering, which is
 * where these pages get opened.
 *
 * None of them use gradients or SVG ids. Several of these render more than once on a
 * page, and duplicate ids in one document resolve to whichever came first.
 */

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center', className)} aria-hidden="true">
      <svg
        viewBox="0 0 240 14"
        fill="none"
        className="w-56 max-w-[68%] text-inv-accent"
        role="presentation"
      >
        <path d="M2 7H96" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <path d="M144 7H238" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <circle cx="104" cy="7" r="1.9" fill="currentColor" opacity="0.5" />
        <circle cx="136" cy="7" r="1.9" fill="currentColor" opacity="0.5" />
        <path d="M120 1.5L125.5 7L120 12.5L114.5 7Z" fill="currentColor" opacity="0.85" />
      </svg>
    </div>
  );
}

/** A smaller mark for separating a label from its value. */
export function Pip({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex text-inv-accent', className)} aria-hidden="true">
      <svg viewBox="0 0 12 12" fill="none" className="h-2 w-2">
        <path d="M6 0.5L7.7 6L6 11.5L4.3 6Z" fill="currentColor" opacity="0.75" />
      </svg>
    </span>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={cn('h-10 w-10 text-inv-accent', className)}>
      <path d="M0 18V0H18" stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
      <path d="M7 25V7H25" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M13 36C13 23.3 23.3 13 36 13" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="10" cy="10" r="1.7" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

/**
 * The ornate border the classic theme sits inside. Purely decorative, so it is hidden
 * from assistive technology and never intercepts a tap.
 */
export function OrnateFrame({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-3 sm:inset-4', className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 border border-inv-line" />
      <div className="absolute inset-[6px] border border-inv-line opacity-50" />

      {/*
        Positioned physically rather than with logical properties. The frame is a
        symmetrical decoration, so it should look identical in Arabic and English, and
        pairing start and end with fixed rotations flips the corners into the wrong
        orientation the moment the direction changes.
      */}
      <Corner className="absolute top-0 left-0" />
      <Corner className="absolute top-0 right-0 rotate-90" />
      <Corner className="absolute right-0 bottom-0 rotate-180" />
      <Corner className="absolute bottom-0 left-0 -rotate-90" />
    </div>
  );
}

/**
 * A very faint paper grain. Keeps a large flat cream area from reading as a blank
 * browser page on an OLED phone screen.
 */
export function PaperTexture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
