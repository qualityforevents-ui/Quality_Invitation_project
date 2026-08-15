'use client';

import type { ReactNode } from 'react';
import { Direction } from 'radix-ui';

/**
 * Tells every Radix primitive on the page which way the text runs.
 *
 * Without this each primitive falls back to left to right on its own, whatever the
 * document says, and the failures are the quiet kind: the arrow keys in a RadioGroup or
 * a ToggleGroup walk the options backwards in Arabic, and a Select or a Popover works
 * out which side it has room to open on against the wrong axis. Nothing looks broken in
 * a screenshot, which is exactly why it needs to be set once at the top rather than
 * discovered control by control.
 *
 * A `dir` attribute on an element is not a substitute. Radix reads this context, not the
 * DOM, and the two are only ever in agreement because this component is handed the same
 * value the wrapper's own `dir` gets.
 */
export function DirectionProvider({ dir, children }: { dir: 'rtl' | 'ltr'; children: ReactNode }) {
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}
