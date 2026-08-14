'use client';

/**
 * Always visible once the card is open, never a icon that appears only on hover.
 *
 * On an iPhone with the physical silent switch on, the audio plays but makes no sound,
 * and nothing on screen would otherwise explain why. A toggle sitting there showing
 * sound as on is the only cue the guest gets, so it earns its corner.
 *
 * Its distance from the bottom is a CSS variable, so a surface that puts its own bar
 * along the bottom edge, such as the preview, can lift the toggle clear of it without
 * this component needing to know that surface exists.
 */
export function MuteToggle({
  muted,
  onToggle,
  labelMute,
  labelUnmute,
}: {
  muted: boolean;
  onToggle: () => void;
  labelMute: string;
  labelUnmute: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={muted}
      aria-label={muted ? labelUnmute : labelMute}
      className="tap-target fixed end-4 bottom-[calc(var(--inv-toggle-offset,1rem)+env(safe-area-inset-bottom))] z-40 flex items-center justify-center rounded-full border border-inv-line bg-inv-bg/85 p-3 text-inv-accent shadow-sm backdrop-blur transition active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {muted ? (
          <path
            d="M16 9.5l4.5 5m0-5l-4.5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ) : (
          <>
            <path
              d="M15.6 9c1 .9 1 4.1 0 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M18.4 6.8c2 1.9 2 8.5 0 10.4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </>
        )}
      </svg>
    </button>
  );
}
