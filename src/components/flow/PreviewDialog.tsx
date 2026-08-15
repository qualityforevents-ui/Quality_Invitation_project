'use client';

import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvitationShell } from '@/components/invitation/InvitationShell';
import type { InvitationView } from '@/lib/invitation-view';
import type { Dictionary } from '@/i18n/ui';

/**
 * The invitation, exactly as a guest receives it.
 *
 * This is the screen the paywall sits behind rather than in front of, so it is
 * deliberately naked: the whole viewport, no header, no column, no support bubble, and
 * the real `InvitationShell` rather than a mockup of it. The old build had this as its
 * own route precisely so nothing could frame it; a full bleed dialog is that same
 * decision expressed on a page that no longer navigates.
 *
 * Two things here are load bearing and easy to undo by accident:
 *
 * It mounts on the unopened cover and waits for the customer to tap it. `audio.start()`
 * runs synchronously inside that tap handler inside `InvitationExperience`, and it is
 * only accepted by Safari while the gesture is still on the stack. Anything that opens
 * the card automatically on mount forfeits the music, and the failure is silent and
 * invisible on a desktop.
 *
 * The escape is a floating control rather than a bar along the bottom, so it sits over
 * the card instead of shortening it. `--inv-toggle-offset` lifts the invitation's own
 * mute toggle clear of nothing here, but the variable is still set so the toggle keeps
 * the same resting position it has on the sample screen.
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
        fullBleed
        showCloseButton={false}
        // Radix needs a title or it warns and hands screen readers an unnamed dialog.
        // Visually hidden, because a heading over the card is chrome.
        aria-describedby={undefined}
        className="border-0 p-0"
      >
        <DialogTitle className="sr-only">{t.flow.previewTitle}</DialogTitle>

        <div style={{ '--inv-toggle-offset': '5.5rem' } as CSSProperties}>
          <InvitationShell view={view} />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => onOpenChange(false)}
          aria-label={t.flow.previewClose}
          title={t.flow.previewClose}
          className="fixed top-4 start-4 z-50 rounded-full bg-card/80 backdrop-blur"
        >
          <X aria-hidden="true" />
        </Button>

      </DialogContent>
    </Dialog>
  );
}
