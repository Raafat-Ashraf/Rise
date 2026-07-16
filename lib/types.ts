import type { Locale } from '@/i18n/routing';

export const PROPERTY_TYPE_VALUES = [
  'villa',
  'apartment',
  'penthouse',
  'townhouse',
  'chalet',
  'office',
  'retail',
  'land',
] as const;

export const PROPERTY_STATUS_VALUES = [
  'for-sale',
  'for-rent',
  'off-plan',
  'sold',
] as const;

export type PropertyType = (typeof PROPERTY_TYPE_VALUES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUS_VALUES)[number];

/** A string authored in both site locales. */
export type LocaleString = Record<Locale, string>;

export interface PropertyImage {
  /** Either a Sanity CDN URL or a local /images path. */
  url: string;
  alt: LocaleString;
  /** Base64 blur placeholder, when available. */
  lqip?: string;
  width?: number;
  height?: number;
}

export interface PropertyLocation {
  city: LocaleString;
  district?: LocaleString;
  lat?: number;
  lng?: number;
}

export interface Agent {
  name: LocaleString;
  role: LocaleString;
  photo?: PropertyImage;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface Property {
  _id: string;
  slug: string;
  title: LocaleString;
  description: LocaleString;
  type: PropertyType;
  status: PropertyStatus;
  /** Monthly rent for `for-rent`; absent means "price on request". */
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  /** Built area in m². */
  area: number;
  location: PropertyLocation;
  gallery: PropertyImage[];
  features: LocaleString[];
  featured: boolean;
  reference?: string;
  agent?: Agent;
  publishedAt: string;
}

/** Sort keys accepted by the properties listing (mirrored in the URL). */
export const SORT_VALUES = ['newest', 'price-asc', 'price-desc', 'area-desc'] as const;
export type SortValue = (typeof SORT_VALUES)[number];

/** Fully-resolved, validated filter state. Mirrors the URL query string. */
export interface PropertyFilters {
  q: string;
  type: PropertyType[];
  status: PropertyStatus[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  sort: SortValue;
}

/** Bounds used to configure the price/area range sliders. */
export interface PropertyFacets {
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
}

export function isPropertyType(value: unknown): value is PropertyType {
  return PROPERTY_TYPE_VALUES.includes(value as PropertyType);
}

export function isPropertyStatus(value: unknown): value is PropertyStatus {
  return PROPERTY_STATUS_VALUES.includes(value as PropertyStatus);
}

export function isSortValue(value: unknown): value is SortValue {
  return SORT_VALUES.includes(value as SortValue);
}
