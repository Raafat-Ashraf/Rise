import {
  isPropertyStatus,
  isPropertyType,
  isSortValue,
  type PropertyFilters,
  type PropertyStatus,
  type PropertyType,
} from './types';

/**
 * The single source of truth for filter ⇄ URL translation.
 *
 * Filters live in the query string so a filtered view is shareable, linkable
 * and survives a refresh or a back-button press. Both the server component that
 * renders results and the client component that drives the controls parse
 * through here, so they can never drift apart.
 */

export const FILTER_KEYS = {
  q: 'q',
  type: 'type',
  status: 'status',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  bedrooms: 'beds',
  bathrooms: 'baths',
  minArea: 'minArea',
  maxArea: 'maxArea',
  sort: 'sort',
} as const;

export const EMPTY_FILTERS: PropertyFilters = {
  q: '',
  type: [],
  status: [],
  sort: 'newest',
};

/** Next.js gives repeated params as arrays; normalise to a list either way. */
type RawParams = Record<string, string | string[] | undefined>;

function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  // Also accept comma-joined values ("villa,penthouse") for hand-written URLs.
  return values.flatMap((entry) => entry.split(',')).map((v) => v.trim()).filter(Boolean);
}

/** Collapses a possibly-repeated param down to its first value. */
function toSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = toSingle(value);
  if (raw === undefined || raw.trim() === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Parses raw query params into a validated filter set.
 * Anything unrecognised is dropped rather than throwing — a hand-mangled URL
 * should degrade to a broader result set, never a 500.
 */
export function parseFilters(params: RawParams): PropertyFilters {
  const sortRaw = toSingle(params[FILTER_KEYS.sort]);
  const q = toSingle(params[FILTER_KEYS.q]);

  let minPrice = toNumber(params[FILTER_KEYS.minPrice]);
  let maxPrice = toNumber(params[FILTER_KEYS.maxPrice]);
  // Tolerate an inverted range instead of returning nothing.
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  let minArea = toNumber(params[FILTER_KEYS.minArea]);
  let maxArea = toNumber(params[FILTER_KEYS.maxArea]);
  if (minArea !== undefined && maxArea !== undefined && minArea > maxArea) {
    [minArea, maxArea] = [maxArea, minArea];
  }

  return {
    q: (q ?? '').slice(0, 120),
    type: toList(params[FILTER_KEYS.type]).filter(isPropertyType) as PropertyType[],
    status: toList(params[FILTER_KEYS.status]).filter(
      isPropertyStatus,
    ) as PropertyStatus[],
    minPrice,
    maxPrice,
    bedrooms: toNumber(params[FILTER_KEYS.bedrooms]),
    bathrooms: toNumber(params[FILTER_KEYS.bathrooms]),
    minArea,
    maxArea,
    sort: isSortValue(sortRaw) ? sortRaw : 'newest',
  };
}

/**
 * Serialises filters back to a query string.
 * Defaults are omitted so the canonical "no filters" URL is a bare /properties.
 */
export function serializeFilters(filters: PropertyFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set(FILTER_KEYS.q, filters.q.trim());
  filters.type.forEach((type) => params.append(FILTER_KEYS.type, type));
  filters.status.forEach((status) => params.append(FILTER_KEYS.status, status));

  const numeric: Array<[string, number | undefined]> = [
    [FILTER_KEYS.minPrice, filters.minPrice],
    [FILTER_KEYS.maxPrice, filters.maxPrice],
    [FILTER_KEYS.bedrooms, filters.bedrooms],
    [FILTER_KEYS.bathrooms, filters.bathrooms],
    [FILTER_KEYS.minArea, filters.minArea],
    [FILTER_KEYS.maxArea, filters.maxArea],
  ];
  numeric.forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  if (filters.sort !== 'newest') params.set(FILTER_KEYS.sort, filters.sort);

  const query = params.toString();
  return query ? `?${query}` : '';
}

/** How many filters are active — drives the "N applied" badge. */
export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.q.trim()) count += 1;
  count += filters.type.length;
  count += filters.status.length;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
  if (filters.bedrooms !== undefined) count += 1;
  if (filters.bathrooms !== undefined) count += 1;
  if (filters.minArea !== undefined || filters.maxArea !== undefined) count += 1;
  return count;
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return countActiveFilters(filters) > 0;
}
