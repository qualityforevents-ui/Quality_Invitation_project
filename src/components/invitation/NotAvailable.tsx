import Link from 'next/link';
import { Divider } from './Ornaments';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { uiFontVariables } from '@/lib/fonts';

/**
 * Shown for a slug that does not exist, or one whose invitation is not live.
 *
 * It says nothing about which of those it is and shows no content from the row, so a
 * draft cannot be read by guessing at a URL.
 *
 * Both languages appear, because a guest arriving here has followed a link from
 * somewhere and there is no stored preference to read.
 */
export function NotAvailable() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`${uiFontVariables} flex min-h-dvh flex-col items-center justify-center bg-cream px-8 text-center`}
    >
      <Divider className="mb-8 text-gold" />

      <h1 className="text-xl font-bold text-ink">الدعوة دي مش متاحة</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
        الرابط ممكن يكون اتغير، أو الدعوة لسه مش مفعّلة.
      </p>

      <p lang="en" dir="ltr" className="mt-6 max-w-xs text-sm leading-relaxed text-ink-faint">
        This invitation is not available. The link may have changed, or it is not live yet.
      </p>

      <Button asChild variant="outline" size="lg" className="mt-10 rounded-full">
        <Link href="/"><BrandLogo className="h-7" /></Link>
      </Button>
    </div>
  );
}
