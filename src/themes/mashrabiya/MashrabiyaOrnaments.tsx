'use client';

import { cn } from '@/lib/cn';

/**
 * مشربية ornaments: turned wood (خرط) bobbins, rosettes, and hexagonal aperture voids.
 */

/**
 * 22px even turned-wood lattice tile (8% opacity).
 * Even pixel size authored to prevent moiré interference on mid-range Android screens.
 */
export const LATTICE_TILE =
  'radial-gradient(circle at 11px 11px, transparent 6px, rgba(111,61,22,0.12) 7px, rgba(111,61,22,0.12) 8px, transparent 9px), ' +
  'linear-gradient(45deg, transparent 10px, rgba(111,61,22,0.08) 10px, rgba(111,61,22,0.08) 12px, transparent 12px), ' +
  'linear-gradient(-45deg, transparent 10px, rgba(111,61,22,0.08) 10px, rgba(111,61,22,0.08) 12px, transparent 12px)';

/**
 * THE BOBBIN: a vesica/lens turned on a lathe.
 * ViewBox 0 0 16 40; 6px waist at mid-height.
 */
export function Bobbin({
  className,
  horizontal = false,
}: {
  className?: string;
  horizontal?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 40"
      fill="none"
      className={cn('h-8 w-3 text-inv-accent', horizontal && 'rotate-90', className)}
      aria-hidden="true"
    >
      <path
        d="M 8 0 C 1 12 5 20 8 20 C 11 20 15 12 8 0 Z"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M 8 40 C 1 28 5 20 8 20 C 11 20 15 28 8 40 Z"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="8" cy="20" r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * CONNECTIVE: Run of 3 bobbins laid end to end horizontally.
 */
export function BobbinDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn('my-4 flex items-center justify-center gap-1 text-inv-accent', className)}
      aria-hidden="true"
    >
      <Bobbin horizontal className="h-4 w-7" />
      <Bobbin horizontal className="h-4 w-7" />
      <Bobbin horizontal className="h-4 w-7" />
    </div>
  );
}

/**
 * HERO: Six-lobed rosette (six bobbins radiating at 60°).
 * ViewBox 0 0 200 200.
 */
export function SixLobedRosette({
  size = 180,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn('shrink-0 text-inv-accent', className)}
      aria-hidden="true"
    >
      <g transform="translate(100, 100)">
        {angles.map((deg) => (
          <g key={deg} transform={`rotate(${deg}) translate(-8, -80)`}>
            <path
              d="M 8 0 C 1 20 4 38 8 45 C 12 38 15 20 8 0 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <circle cx="8" cy="45" r="3.5" fill="currentColor" />
          </g>
        ))}
        {/* Central hub */}
        <circle cx="0" cy="0" r="14" stroke="currentColor" strokeWidth="1.5" fill="var(--inv-bg)" />
        <circle cx="0" cy="0" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * HEXAGONAL VOID: A clear aperture cut into the turned-wood screen.
 * Usable inner measure is 244px.
 */
export function HexagonalVoid({
  align = 'center',
  children,
  className,
}: {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  className?: string;
}) {
  const alignClass =
    align === 'start'
      ? 'self-start ms-2 sm:ms-6'
      : align === 'end'
        ? 'self-end me-2 sm:me-6'
        : 'self-center mx-auto';

  return (
    <div
      className={cn(
        'relative my-6 w-[300px] max-w-[90vw] rounded-3xl border-2 border-inv-accent/60 bg-inv-bg p-6 shadow-md',
        alignClass,
        className,
      )}
    >
      {/* 244px usable measure */}
      <div className="mx-auto w-full max-w-[244px] text-center">
        {children}
      </div>
    </div>
  );
}
