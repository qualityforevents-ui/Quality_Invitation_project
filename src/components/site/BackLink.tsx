import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

/**
 * The way back, drawn as an arrow in a ring.
 *
 * The arrow is mirrored under `rtl:`, because back is a direction rather than a shape:
 * in Arabic the page runs right to left, so the way back points right. Placement is left
 * to the caller, which puts it at the inline start on every screen that uses it, so it
 * lands in the top right corner in Arabic and the top left in English without either
 * being hard coded.
 *
 * It lives here rather than beside the builder because the two screens that still need
 * it, the sample invitation and the full screen preview, are not part of the builder's
 * own chrome and outlived the step header this used to belong to.
 */
export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="icon-lg"
      aria-label={label}
      title={label}
      className={cn('rounded-full bg-card/80 backdrop-blur', className)}
    >
      <Link href={href}>
        <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
      </Link>
    </Button>
  );
}
