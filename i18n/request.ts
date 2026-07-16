import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Cairo/EG is the brand's home market; keeps dates and numbers consistent
    // between server render and client hydration.
    timeZone: 'Africa/Cairo',
    now: new Date(),
    formats: {
      number: {
        currency: {
          style: 'currency',
          currency: 'EGP',
          maximumFractionDigits: 0,
        },
        compact: {
          notation: 'compact',
          maximumFractionDigits: 1,
        },
      },
    },
  };
});
