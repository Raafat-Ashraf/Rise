import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { PropertiesShellSkeleton } from '@/components/property/PropertiesShellSkeleton';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { parseFilters } from '@/lib/filters';
import { filterProperties, getAllProperties, getFacets } from '@/lib/properties';
import { SHOW_PRICES } from '@/lib/site-config';
import type { PropertyFilters as Filters } from '@/lib/types';
import { absoluteUrl } from '@/lib/utils';

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.properties' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/properties`),
      languages: {
        ar: absoluteUrl('/ar/properties'),
        en: absoluteUrl('/en/properties'),
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: absoluteUrl(`/${locale}/properties`),
    },
  };
}

/**
 * Fetches and filters the book.
 *
 * This is split out of the page so the data fetch happens *inside* the Suspense
 * boundary — that's what lets the skeleton actually render while the CMS
 * responds. Awaiting in the page itself would block the whole route and the
 * fallback would never be shown.
 */
async function PropertiesResults({
  filters,
  locale,
}: {
  filters: Filters;
  locale: Locale;
}) {
  const all = await getAllProperties();
  // Facets come from the unfiltered book, so slider bounds stay stable while
  // the visitor narrows down.
  const facets = getFacets(all);
  const results = filterProperties(all, filters);

  /*
   * `facets` is a prop on a client component, so it is serialised into the RSC
   * payload and readable in page source. Its price bounds are real figures from
   * the book — `maxPrice` is literally the most expensive asset's price — so in
   * "price on request" mode they must be stripped here, not merely hidden in
   * the UI. The price slider is the only consumer and it isn't rendered then.
   */
  const publicFacets = SHOW_PRICES
    ? facets
    : { ...facets, minPrice: 0, maxPrice: 0 };

  return (
    <PropertyFilters
      initialFilters={filters}
      facets={publicFacets}
      resultCount={results.length}
    >
      {/* Stays a server component — the property list is never shipped to the
          client, only the rendered cards. */}
      <PropertyGrid properties={results} locale={locale} />
    </PropertyFilters>
  );
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = parseFilters(await searchParams);

  const t = await getTranslations({ locale, namespace: 'properties' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('properties'), url: absoluteUrl(`/${locale}/properties`) },
        ]}
      />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        image="/images/properties/tower-2.jpg"
      />

      <section className="bg-sand-50 py-14 lg:py-20">
        <div className="shell">
          {/* Re-keying on the filter set remounts the boundary, so each filter
              change shows the skeleton instead of silently swapping the grid. */}
          <Suspense
            key={JSON.stringify(filters)}
            fallback={<PropertiesShellSkeleton />}
          >
            <PropertiesResults filters={filters} locale={locale as Locale} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
