import type { Metadata, Viewport } from 'next';

import { siteUrl } from '@/lib/utils';

/**
 * Root layout for the embedded Sanity Studio.
 *
 * The Studio is deliberately *outside* the `[locale]` segment: it's an internal
 * admin tool with its own (English) chrome, and it must not be locale-prefixed
 * or wrapped in the marketing site's header/footer. `middleware.ts` skips
 * /studio for the same reason.
 */

export const metadata: Metadata = {
  // This root layout is separate from the site's, so it needs its own base URL
  // for Next to resolve relative metadata against.
  metadataBase: new URL(siteUrl()),
  title: 'Amjad — Content Studio',
  description: 'Manage the Amjad property portfolio.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Studio has its own dense UI; let editors zoom.
  maximumScale: 5,
};

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
