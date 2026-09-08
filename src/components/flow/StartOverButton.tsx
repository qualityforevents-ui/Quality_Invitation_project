'use client';

import { useState, useTransition } from 'react';
import { startOver } from '@/app/(site)/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      {/*
        Close to the last answer rather than adrift below it, and a bordered control
        rather than small underlined text. It stays visually secondary — muted, outline,
        never the filled primary — because everything else on this screen moves the
        customer forward and this one throws their work away. But it was reading as a
        footnote: too far from the flow to look like part of it, and too small to be
        confident about tapping.
      */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press tap-target rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-foreground"
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

          {/*
            A plain div, not DialogFooter. That component carries
            `sm:flex-row sm:justify-end`, and a media query rule beats a plain
            `flex-col` passed in as a class, so above 640px the two buttons laid
            themselves out in a row and — both being w-full — the first one rendered
            outside the dialog entirely. These two always stack.
          */}
          <div className="mt-5 flex flex-col gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
