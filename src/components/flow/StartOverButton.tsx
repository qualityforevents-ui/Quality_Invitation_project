'use client';

import { useState, useTransition } from 'react';
import { startOver } from '@/app/(site)/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Dictionary } from '@/i18n/ui';

/**
 * Throws away what has been answered and begins a fresh invitation.
 *
 * Deliberately quiet, and deliberately at the bottom. Every other control in the flow
 * moves the customer forward, and a reset that looks like one of them is a reset
 * somebody presses by accident on the question before payment. It is a small underlined
 * word below the last answer, which is where a person who wants to start again will
 * look and where nobody else will.
 *
 * It asks first, because the consequence cannot be undone: there are no accounts here,
 * so clearing the cookie is the same as losing the invitation. The dialog says that in
 * as many words rather than asking a bare "are you sure?", and its safe option is the
 * one that keeps going.
 */
export function StartOverButton({ t }: { t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press tap-target rounded-full px-3 py-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {t.flow.startOver}
        </button>
      </div>

      <Dialog open={open} onOpenChange={(next) => (isPending ? null : setOpen(next))}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogTitle className="text-lg font-bold text-balance">
            {t.flow.startOverTitle}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t.flow.startOverBody}
          </DialogDescription>

          <DialogFooter className="mt-5 flex-col gap-2">
            {/*
              The safe choice is the big one and it comes first, so the thumb that is
              already moving lands on "keep going" rather than on the destructive answer.
            */}
            <Button
              type="button"
              size="lg"
              onClick={() => setOpen(false)}
              className="w-full rounded-full text-base"
            >
              {t.flow.startOverCancel}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => startTransition(async () => { await startOver(); })}
              className="w-full rounded-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isPending ? t.common.saving : t.flow.startOverConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
