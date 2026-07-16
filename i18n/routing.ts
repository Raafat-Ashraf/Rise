import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

/** Arabic is the brand's default market, so it owns the root path. */
export const defaultLocale: Locale = 'ar';

export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export const localeLabels: Record<Locale, { native: string; short: string }> = {
  ar: { native: 'العربية', short: 'ع' },
  en: { native: 'English', short: 'EN' },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so /ar and /en are both explicit and independently indexable.
  localePrefix: 'always',
  /*
   * Arabic is the default for *everyone*, not just for Arabic browsers.
   *
   * next-intl detects a locale by default: it reads the `accept-language`
   * header (and a NEXT_LOCALE cookie) and redirects `/` accordingly, which
   * quietly overrides `defaultLocale` — an English-language browser would land
   * on /en and never see the Arabic site. This is the brand's home market, so
   * `/` must always open in Arabic. Visitors still choose English explicitly
   * from the header switcher, which navigates straight to /en.
   */
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
