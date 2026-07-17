import type { Locale } from '@/i18n/routing';
import type { LocaleString } from './types';

/**
 * Minimal class-name joiner. Falsy values are dropped, so
 * `cn('a', cond && 'b')` reads cleanly at call sites.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Reads a localised field, falling back to Arabic (the authored default). */
export function pick(value: LocaleString | undefined, locale: Locale): string {
  if (!value) return '';
  return value[locale] || value.ar || value.en || '';
}

/**
 * Formats a price in EGP.
 *
 * Above a million we abbreviate ("18.5M EGP" / "18.5 مليون ج.م") because exact
 * digits at that scale are noise on a card; rents stay exact.
 */
export function formatPrice(
  price: number,
  locale: Locale,
  options: { abbreviate?: boolean } = {},
): string {
  const { abbreviate = false } = options;

  if (abbreviate && price >= 1_000_000) {
    const millions = price / 1_000_000;
    const digits = millions % 1 === 0 ? 0 : 1;
    const value = millions.toFixed(digits);
    return locale === 'ar' ? `${value} مليون ج.م` : `${value}M EGP`;
  }

  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
    // Latin digits in both locales: prices sit next to Latin-numeral specs.
    numberingSystem: 'latn',
  }).format(price);
}

/** Formats a plain number with locale-appropriate grouping, Latin digits. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    maximumFractionDigits: 1,
    numberingSystem: 'latn',
  }).format(value);
}

export function formatArea(area: number, locale: Locale): string {
  return `${formatNumber(area, locale)} ${locale === 'ar' ? 'م²' : 'm²'}`;
}

/** `tel:` / `wa.me` links need digits only. */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function googleMapsUrl(lat: number, lng: number, label?: string): string {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lng}`;
}

/**
 * An OpenStreetMap embed URL — a real, keyless map.
 * Google Maps embeds require an API key we don't want to hard-require.
 */
export function osmEmbedUrl(lat: number, lng: number, zoomSpan = 0.008): string {
  const bbox = [lng - zoomSpan, lat - zoomSpan / 2, lng + zoomSpan, lat + zoomSpan / 2].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** Site origin used for canonical URLs, OG images, sitemap and JSON-LD. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Contact channels, read once so components don't touch `process.env`. */
export const contact = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '201122742408',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '+20 112 274 2408',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'amjadegypt33@gmail.com',
} as const;

/** Amjad HQ — used by the contact map. */
export const officeGeo = { lat: 30.0261, lng: 31.4703 } as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
