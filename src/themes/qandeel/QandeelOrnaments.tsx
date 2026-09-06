'use client';

import { cn } from '@/lib/cn';

/**
 * قنديل ornaments: Mamluk mosque lamp, hung plumb lines, and background suspension tile.
 *
 * All plumb line drops are locked tokens from the spec:
 * [40, 96, 62, 130, 78, 54, 112, 68] px.
 */

export const PLUMB_LENGTHS = {
  names: 40,
  verse: 96,
  poetry: 62,
  invite: 130,
  roles: 78,
  photo: 96,
  date: 54,
  venue: 112,
  countdown: 68,
  message: 40,
} as const;

/** Subtle repeating plumb lines background tile on FAR layer */
export const PLUMB_TILE =
  'repeating-linear-gradient(90deg, transparent 0px, transparent 89px, var(--inv-line) 89px, var(--inv-line) 90px)';

/**
 * Mamluk Mosque Lamp SVG.
 * ViewBox 0 0 120 190.
 * Bulbous body (96px max width), flared neck, splayed foot, 3 suspension chains to a ring.
 */
export function MosqueLamp({
  size = 120,
  variant = 'outline',
  lit = true,
  className,
}: {
  size?: number;
  variant?: 'outline' | 'solid';
  lit?: boolean;
  className?: string;
}) {
  const height = (size / 120) * 190;

  return (
    <svg
      viewBox="0 0 120 190"
      fill="none"
      style={{ width: `${size}px`, height: `${height}px` }}
      className={cn('shrink-0 text-inv-accent', className)}
      aria-hidden="true"
    >
      {/* 3 suspension chains meeting at a 10px top ring */}
      <circle cx="60" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="13" x2="60" y2="40" stroke="currentColor" strokeWidth="1.25" />
      <line x1="58" y1="13" x2="34" y2="48" stroke="currentColor" strokeWidth="1.25" />
      <line x1="62" y1="13" x2="86" y2="48" stroke="currentColor" strokeWidth="1.25" />

      {/* Flared neck & rim */}
      <path
        d="M 32 46 L 88 46 L 82 64 L 38 64 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={variant === 'solid' ? 'currentColor' : 'none'}
      />

      {/* Bulbous Body swelling to 96px */}
      <path
        d="M 38 64 C 20 84 10 114 14 136 C 18 154 36 166 60 166 C 84 166 102 154 106 136 C 110 114 100 84 82 64 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={variant === 'solid' ? 'currentColor' : 'none'}
      />

      {/* Lit lamp inner radial glow (hard-edged gradient, no CSS blur filter) */}
      {lit ? (
        <ellipse
          cx="60"
          cy="120"
          rx="32"
          ry="28"
          fill="url(#lamp-glow)"
          opacity="0.85"
        />
      ) : null}

      {/* Splayed Foot */}
      <path
        d="M 44 166 L 36 182 L 84 182 L 76 166 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={variant === 'solid' ? 'currentColor' : 'none'}
      />

      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--inv-accent)" stopOpacity="0.45" />
          <stop offset="60%" stopColor="var(--inv-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--inv-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * A plumb suspension line of authored length.
 */
export function PlumbLine({
  length,
  className,
}: {
  length: number;
  className?: string;
}) {
  return (
    <div
      className={cn('mx-auto flex flex-col items-center', className)}
      style={{ height: `${length}px` }}
      aria-hidden="true"
    >
      <span className="w-px flex-1 bg-inv-accent/60" />
      <span className="h-1.5 w-1.5 rounded-full bg-inv-accent shadow-xs" />
    </div>
  );
}
