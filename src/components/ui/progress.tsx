"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      {/*
        Filled by its own inline size rather than by sliding a full width bar out of
        view with translateX. A transform moves left whatever the direction, so on the
        Arabic page the shipped version drained from the wrong end and a third of the
        way through the flow read as two thirds. Inline size follows `dir` for free, so
        the bar grows from the right in Arabic and from the left in English with no
        variant and no second code path.
      */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full bg-primary transition-all"
        style={{ inlineSize: `${value ?? 0}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
