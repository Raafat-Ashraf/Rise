import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/routing';
import { getPropertySlugs } from '@/lib/properties';
import { absoluteUrl } from '@/lib/utils';

/** Static routes, with their relative importance. */
const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/properties', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/services', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
];

/**
 * Sitemap.
 *
 * Every URL carries `alternates.languages`, so search engines treat the Arabic
 * and English versions as one page in two languages rather than duplicates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${route.path}`),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, absoluteUrl(`/${alt}${route.path}`)]),
        ),
      },
    })),
  );

  const slugs = await getPropertySlugs();

  const properties: MetadataRoute.Sitemap = slugs.flatMap(({ slug, updatedAt }) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}/properties/${slug}`),
      lastModified: new Date(updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, absoluteUrl(`/${alt}/properties/${slug}`)]),
        ),
      },
    })),
  );

  return [...pages, ...properties];
}
