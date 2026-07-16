import { NextStudio } from 'next-sanity/studio';

import config from '@/sanity.config';
import { isSanityConfigured } from '@/sanity/env';
import { StudioNotConfigured } from './StudioNotConfigured';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

/**
 * The Studio is a single-page app; the optional catch-all lets its own router
 * own everything under /studio (e.g. /studio/structure/property;abc123).
 */
export default function StudioPage() {
  if (!isSanityConfigured) {
    return <StudioNotConfigured />;
  }
  return <NextStudio config={config} />;
}
