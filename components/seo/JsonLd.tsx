import type { Locale } from '@/i18n/routing';
import type { Property } from '@/lib/types';
import { SHOW_PRICES } from '@/lib/site-config';
import { absoluteUrl, contact, pick, siteUrl } from '@/lib/utils';

/**
 * Structured data.
 *
 * Emitted as raw JSON-LD script tags. `JSON.stringify` output is escaped for
 * `</script>` so a stray sequence in CMS copy can't break out of the tag.
 */

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        '@id': `${siteUrl()}/#organization`,
        name: locale === 'ar' ? 'أمجاد للتطوير العقاري' : 'Amjad Developments',
        alternateName: 'Amjad',
        description:
          locale === 'ar'
            ? 'أمجاد تُصمِّم وتُسلِّم وتُدير أصولاً عقارية راقية.'
            : 'Amjad designs, delivers and manages premium real estate assets.',
        slogan:
          locale === 'ar'
            ? 'استثمار حقيقي وعقارات ذكية'
            : 'Real Investment & Smart Estates',
        url: absoluteUrl(`/${locale}`),
        logo: absoluteUrl('/logo.jpg'),
        image: absoluteUrl('/logo.jpg'),
        telephone: contact.phone,
        email: contact.email,
        foundingDate: '2009',
        priceRange: '$$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Amjad Tower, 90th Street North, Fifth Settlement',
          addressLocality: 'New Cairo',
          addressRegion: 'Cairo Governorate',
          addressCountry: 'EG',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 30.0261, longitude: 31.4703 },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            opens: '09:00',
            closes: '18:00',
          },
        ],
        areaServed: { '@type': 'Country', name: 'Egypt' },
        sameAs: ['https://www.facebook.com/AMJADDevEG'],
      }}
    />
  );
}

export function WebSiteJsonLd({ locale }: { locale: Locale }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl()}/#website`,
        name: 'Amjad',
        url: absoluteUrl(`/${locale}`),
        inLanguage: locale,
        publisher: { '@id': `${siteUrl()}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: absoluteUrl(`/${locale}/properties?q={search_term_string}`),
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function PropertyJsonLd({
  property,
  locale,
}: {
  property: Property;
  locale: Locale;
}) {
  const url = absoluteUrl(`/${locale}/properties/${property.slug}`);
  const images = property.gallery.map((image) =>
    image.url.startsWith('http') ? image.url : absoluteUrl(image.url),
  );

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        // Listings are Residence/Accommodation offers rather than Products.
        '@type': property.status === 'for-rent' ? 'RentAction' : 'Residence',
        '@id': `${url}#property`,
        name: pick(property.title, locale),
        description: pick(property.description, locale),
        url,
        image: images,
        inLanguage: locale,
        address: {
          '@type': 'PostalAddress',
          addressLocality: pick(property.location.city, locale),
          addressRegion: property.location.district
            ? pick(property.location.district, locale)
            : undefined,
          addressCountry: 'EG',
        },
        ...(property.location.lat && property.location.lng
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: property.location.lat,
                longitude: property.location.lng,
              },
            }
          : {}),
        floorSize: {
          '@type': 'QuantitativeValue',
          value: property.area,
          unitCode: 'MTK', // UN/CEFACT code for square metre
        },
        ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
        ...(property.bathrooms
          ? { numberOfBathroomsTotal: property.bathrooms }
          : {}),
        amenityFeature: property.features.map((feature) => ({
          '@type': 'LocationFeatureSpecification',
          name: pick(feature, locale),
          value: true,
        })),
        /*
         * The offer is still published (availability is useful), but the price
         * itself is omitted while the site is in "price on request" mode.
         * Structured data is read by Google independently of the page, so
         * leaving `price` here would surface the figure in search results even
         * though nothing on the page shows it.
         */
        offers: {
          '@type': 'Offer',
          ...(SHOW_PRICES && property.price
            ? { price: property.price, priceCurrency: 'EGP' }
            : {}),
          availability:
            property.status === 'sold'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          url,
          seller: { '@id': `${siteUrl()}/#organization` },
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
