import { cn } from '@/lib/cn';

/**
 * The house logo.
 *
 * One traced SVG rather than markup that rebuilds the lockup out of a font and a few
 * paths. The wordmark is set in a face we do not license and the Q carries a bolt
 * knocked out of its bowl, so anything reconstructed here is a lookalike that drifts
 * from whatever the brand actually uses on a card or a banner. The file at
 * public/logo.svg is the artwork itself, traced from it, and the same file is cropped
 * to the tile for the favicon at src/app/icon.svg.
 *
 * It is a plain <img> and not next/image on purpose: SVG is not something the image
 * optimiser can usefully resize, and this one is on the first paint of every page, so
 * it wants to be a single static request with no loader in front of it.
 *
 * Sized by height. The intrinsic dimensions are the traced viewBox and are here so the
 * header does not reflow between HTML and the file arriving.
 */
export function BrandLogo({ className, alt = 'QLTY — for events' }: { className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.svg" alt={alt} width={428} height={140} className={cn('w-auto', className)} />
  );
}
