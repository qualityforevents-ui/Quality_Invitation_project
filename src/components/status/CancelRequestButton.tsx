'use client';

import { useState, useTransition } from 'react';
import { cancelRequest } from '@/app/(site)/build/status/[editToken]/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Dictionary } from '@/i18n/ui';

/**
 * Withdraws a request that is waiting on the operator.
 *
 * Quiet and at the bottom, for the same reason the flow's "start over" is: everything
 * else on this screen is a customer waiting or sharing, and a cancel that looks like
 * one of those is a cancel somebody presses while trying to copy their link.
 *
 * The confirmation carries the one piece of information that matters and that the
 * customer cannot know: money already transferred is not refunded by this button. It
 * points them at WhatsApp instead, because a person who has paid and then cancels their
 * own request is exactly the person who ends up thinking they were robbed.
 */
export function CancelRequestButton({ editToken, t }: { editToken: string; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press tap-target rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-foreground"
        >
          {t.status.cancel}
        </button>
      </div>

      <Dialog open={open} onOpenChange={(next) => (isPending ? null : setOpen(next))}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogTitle className="text-lg font-bold text-balance">
            {t.status.cancelTitle}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t.status.cancelBody}
          </DialogDescription>

          {/*
            A plain div, not DialogFooter. That component carries
            `sm:flex-row sm:justify-end`, and a media query rule beats a plain
            `flex-col` passed in as a class, so above 640px the two buttons laid
            themselves out in a row and — both being w-full — the first one rendered
            outside the dialog entirely. These two always stack.
          */}
          <div className="mt-5 flex flex-col gap-2">
            {/* The safe choice is the big one and comes first. */}
            <Button
              type="button"
              size="lg"
              onClick={() => setOpen(false)}
              className="w-full rounded-full text-base"
            >
              {t.status.cancelKeep}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => startTransition(async () => { await cancelRequest(editToken); })}
              className="w-full rounded-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isPending ? t.common.saving : t.status.cancelConfirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
