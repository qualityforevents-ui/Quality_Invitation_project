import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'qlty.events',
    template: '%s | qlty.events',
  },
  description: 'دعوات إلكترونية للخطوبة والفرح',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf7f0',
};

/**
 * Arabic is the default, so the document opens right to left and stays that way
 * unless something below it says otherwise.
 *
 * The language is deliberately not read from a cookie here. Doing so would opt every
 * route into dynamic rendering, including the public invitation pages, which have to
 * stay statically generated. Instead each surface sets direction on its own wrapper
 * and nudges these two attributes into agreement after hydration.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
