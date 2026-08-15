'use client';

import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import type { InvitationView } from '@/lib/invitation-view';
import type { Dictionary } from '@/i18n/ui';

/**
 * The invitation, as a panel over the flow rather than a screen replacing it.
 *
 * It used to take the whole viewport, on the reasoning that what is on screen should be
 * exactly what a guest receives. The cost was that the customer lost the page: opening
 * the preview felt like navigating away from a form they were halfway through, and
 * closing it felt like starting again. A panel keeps the flow visible behind it, so the
 * preview reads as a look at the card rather than a departure from the builder.
 *
 * Two things are load bearing and easy to undo by accident.
 *
 * It mounts on the unopened cover and waits for the customer to tap it. `audio.start()`
 * runs synchronously inside that tap handler inside `InvitationExperience`, and Safari
 * only accepts it while the gesture is still on the stack. Anything that opens the card
 * automatically on mount forfeits the music, silently, and invisibly on a desktop.
 *
 * The panel is what the mute toggle and the confetti measure themselves against, and
 * that is not a coincidence to be tidied away. Both are `position: fixed`, and a
 * transformed ancestor becomes the containing block for fixed descendants. The centred
 * dialog carries `translate-x-[-50%] translate-y-[-50%]`, so the toggle sits in the
 * panel's own corner and the confetti falls inside the panel. Remove that transform and
 * both escape onto the page behind.
 */
export function PreviewDialog({
  open,
  onOpenChange,
  view,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: InvitationView;
  t: Dictionary;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        // Tall and narrow, close to the proportion of the phone a guest opens it on.
        // Overflow is owned here and nowhere else: the shell keeps `min-h-full` and no
        // scroller of its own, so there is exactly one scrolling box.
        className="h-[85dvh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-sm"
      >
        {/* Radix needs a title or it warns and hands screen readers an unnamed dialog.
            Visually hidden, because a heading over the card is chrome. */}
        <DialogTitle className="sr-only">{t.flow.previewTitle}</DialogTitle>

        <div
          className="h-full overflow-y-auto overscroll-contain"
          // The toggle sits above the panel's own bottom edge rather than the phone's.
          style={{ '--inv-toggle-offset': '1rem' } as CSSProperties}
        >
          <InvitationShell view={view} contained />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label={t.flow.previewClose}
          title={t.flow.previewClose}
          className="absolute top-3 start-3 z-50 rounded-full bg-card/80 backdrop-blur"
        >
          <X aria-hidden="true" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
