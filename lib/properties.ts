import 'server-only';

import { sanityClient } from '@/sanity/lib/client';
import {
  allPropertiesQuery,
  featuredPropertiesQuery,
  propertyBySlugQuery,
  propertySlugsQuery,
  similarPropertiesQuery,
} from '@/sanity/lib/queries';
import { demoProperties } from './demo-data';
import type {
  Property,
  PropertyFacets,
  PropertyFilters,
  SortValue,
} from './types';

/**
 * Data access for the property portfolio.
 *
 * Every function tries Sanity first and falls back to the bundled demo
 * portfolio when Sanity isn't configured (or is unreachable). That keeps the
 * site rendering on a fresh clone and stops a CMS outage from taking down the
 * marketing pages.
 */

/** Revalidation window for CMS-backed pages. */
export const REVALIDATE_SECONDS = 60;

async function fetchFromSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['property'] },
    });
  } catch (error) {
    console.error('[rise] Sanity fetch failed, serving demo portfolio:', error);
    return null;
  }
}

/** Sanity may return nulls inside arrays (e.g. an unpublished reference). */
function compact<T>(items: (T | null)[] | null | undefined): T[] {
  return (items ?? []).filter((item): item is T => Boolean(item));
}

export async function getAllProperties(): Promise<Property[]> {
  const result = await fetchFromSanity<(Property | null)[]>(allPropertiesQuery);
  const properties = compact(result);
  return properties.length > 0 ? properties : demoProperties;
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const result = await fetchFromSanity<(Property | null)[]>(featuredPropertiesQuery, {
    limit,
  });
  const properties = compact(result);
  if (properties.length > 0) return properties;

  const featured = demoProperties.filter((p) => p.featured);
  // Never show an empty strip: top up with the newest non-featured assets.
  const filler = demoProperties.filter((p) => !p.featured);
  return [...featured, ...filler].slice(0, limit);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const result = await fetchFromSanity<Property | null>(propertyBySlugQuery, { slug });
  if (result) return result;
  return demoProperties.find((p) => p.slug === slug) ?? null;
}

export async function getSimilarProperties(
  property: Property,
  limit = 3,
): Promise<Property[]> {
  const result = await fetchFromSanity<(Property | null)[]>(similarPropertiesQuery, {
    slug: property.slug,
    type: property.type,
    city: property.location.city.en,
    limit,
  });
  const properties = compact(result);
  if (properties.length > 0) return properties;

  // Demo fallback: same scoring rule as the GROQ query — type match wins,
  // then city match, then newest.
  return demoProperties
    .filter((p) => p.slug !== property.slug && p.status !== 'sold')
    .map((p) => {
      const sameType = p.type === property.type;
      const sameCity = p.location.city.en === property.location.city.en;
      return { property: p, score: (sameType ? 2 : 0) + (sameCity ? 1 : 0) };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.property.publishedAt) - Date.parse(a.property.publishedAt),
    )
    .slice(0, limit)
    .map((entry) => entry.property);
}

export async function getPropertySlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const result = await fetchFromSanity<{ slug: string; updatedAt: string }[]>(
    propertySlugsQuery,
  );
  if (result && result.length > 0) return result;
  return demoProperties.map((p) => ({ slug: p.slug, updatedAt: p.publishedAt }));
}

// ── Filtering ──────────────────────────────────────────────────────────────

/**
 * Applies the filter set in memory.
 *
 * The portfolio is a curated book (tens, not tens of thousands), so filtering
 * the full list server-side is cheaper and far more responsive than a GROQ
 * round-trip per keystroke. If the book ever outgrows that, this is the single
 * function to push down into the query.
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters,
): Property[] {
  const query = filters.q.trim().toLowerCase();

  const matched = properties.filter((property) => {
    if (query) {
      const haystack = [
        property.title.ar,
        property.title.en,
        property.location.city.ar,
        property.location.city.en,
        property.location.district?.ar,
        property.location.district?.en,
        property.reference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.type.length > 0 && !filters.type.includes(property.type)) return false;
    if (filters.status.length > 0 && !filters.status.includes(property.status)) {
      return false;
    }

    // Properties without a price are "on request" — a price filter excludes them.
    if (filters.minPrice !== undefined) {
      if (property.price === undefined || property.price < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined) {
      if (property.price === undefined || property.price > filters.maxPrice) return false;
    }

    // Bedroom/bathroom filters are "N or more".
    if (filters.bedrooms !== undefined && (property.bedrooms ?? 0) < filters.bedrooms) {
      return false;
    }
    if (filters.bathrooms !== undefined && (property.bathrooms ?? 0) < filters.bathrooms) {
      return false;
    }

    if (filters.minArea !== undefined && property.area < filters.minArea) return false;
    if (filters.maxArea !== undefined && property.area > filters.maxArea) return false;

    return true;
  });

  return sortProperties(matched, filters.sort);
}

export function sortProperties(properties: Property[], sort: SortValue): Property[] {
  const sorted = [...properties];

  switch (sort) {
    case 'price-asc':
      // Unpriced assets sink to the bottom in both price sorts.
      return sorted.sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      );
    case 'price-desc':
      return sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    case 'area-desc':
      return sorted.sort((a, b) => b.area - a.area);
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
      );
  }
}

/** Slider bounds, rounded outward to clean steps so the handles sit nicely. */
export function getFacets(properties: Property[]): PropertyFacets {
  const prices = properties
    .map((p) => p.price)
    .filter((price): price is number => typeof price === 'number');
  const areas = properties.map((p) => p.area);

  const roundDown = (value: number, step: number) => Math.floor(value / step) * step;
  const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;

  return {
    minPrice: prices.length ? roundDown(Math.min(...prices), 100_000) : 0,
    maxPrice: prices.length ? roundUp(Math.max(...prices), 100_000) : 100_000_000,
    minArea: areas.length ? roundDown(Math.min(...areas), 10) : 0,
    maxArea: areas.length ? roundUp(Math.max(...areas), 10) : 2_000,
  };
}
