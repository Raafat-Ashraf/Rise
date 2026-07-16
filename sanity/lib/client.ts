import { createClient, type SanityClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { apiVersion, dataset, isSanityConfigured, projectId } from '../env';

/**
 * Returns a Sanity client, or `null` when the project isn't configured yet.
 * Callers fall back to the bundled demo portfolio — see `lib/properties.ts`.
 */
export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Served through the CDN; content updates land via revalidation.
      useCdn: true,
      perspective: 'published',
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlForImage(source: SanityImageSource): string | undefined {
  if (!builder || !source) return undefined;
  return builder.image(source).auto('format').fit('max').url();
}
