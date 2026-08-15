import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The shadcn class merger, at the path shadcn's own components import it from.
 *
 * `src/lib/cn.ts` re-exports this rather than keeping its old implementation, so the
 * product has one `cn` and not two that behave differently. The old one concatenated;
 * this one also resolves conflicts, which is what lets a caller pass `px-8` to a
 * component whose base class already says `px-4` and get the class they asked for.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
