import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  Hash,
  MapPin,
  Maximize,
  Tag,
} from 'lucide-react';

import { Link, locales, type Locale } from '@/i18n/routing';
import { Badge } from '@/components/ui/Card';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyCard } from '@/components/property/PropertyCard';
import { AgentCard } from '@/components/property/AgentCard';
import { PropertyMap } from '@/components/property/PropertyMap';
import { BreadcrumbJsonLd, PropertyJsonLd } from '@/components/seo/JsonLd';
import {
  getPropertyBySlug,
  getPropertySlugs,
  getSimilarProperties,
} from '@/lib/properties';
import { SHOW_PRICES } from '@/lib/site-config';
import { absoluteUrl, formatArea, formatPrice, pick } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Pre-renders every property in both locales at build time. */
export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return locales.flatMap((locale) =>
    slugs.map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return { title: 'Not found' };

  const title = pick(property.title, locale as Locale);
  const description = pick(property.description, locale as Locale).slice(0, 200);

  // Share the property's own cover photo. If a listing somehow has no gallery,
  // `images` is left undefined so Next falls back to the generated brand card
  // from ../../opengraph-image.tsx rather than linking a dead URL.
  const cover = property.gallery[0];
  const image = cover
    ? cover.url.startsWith('http')
      ? cover.url
      : absoluteUrl(cover.url)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/properties/${slug}`),
      languages: {
        ar: absoluteUrl(`/ar/properties/${slug}`),
        en: absoluteUrl(`/en/properties/${slug}`),
      },
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(`/${locale}/properties/${slug}`),
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const typedLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'property' });
  const tTypes = await getTranslations({ locale, namespace: 'propertyTypes' });
  const tStatus = await getTranslations({ locale, namespace: 'propertyStatus' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCard = await getTranslations({ locale, namespace: 'properties.card' });

  const similar = await getSimilarProperties(property, 3);

  const title = pick(property.title, typedLocale);
  const city = pick(property.location.city, typedLocale);
  const district = property.location.district
    ? pick(property.location.district, typedLocale)
    : undefined;
  const locationLabel = district ? `${district}، ${city}` : city;

  const showPrice = SHOW_PRICES && property.price !== undefined;
  const price = showPrice
    ? formatPrice(property.price!, typedLocale)
    : t('priceOnRequest');

  const specs = [
    { icon: Building2, label: t('specs.type'), value: tTypes(property.type) },
    { icon: Tag, label: t('specs.status'), value: tStatus(property.status) },
    property.bedrooms
      ? { icon: BedDouble, label: t('specs.bedrooms'), value: String(property.bedrooms) }
      : null,
    property.bathrooms
      ? { icon: Bath, label: t('specs.bathrooms'), value: String(property.bathrooms) }
      : null,
    { icon: Maximize, label: t('specs.area'), value: formatArea(property.area, typedLocale) },
    { icon: MapPin, label: t('specs.location'), value: locationLabel },
    property.reference
      ? { icon: Hash, label: t('specs.reference'), value: property.reference }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Bath;
    label: string;
    value: string;
  }>;

  return (
    <>
      <PropertyJsonLd property={property} locale={typedLocale} />
      <BreadcrumbJsonLd
        items={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('properties'), url: absoluteUrl(`/${locale}/properties`) },
          { name: title, url: absoluteUrl(`/${locale}/properties/${slug}`) },
        ]}
      />

      <article className="bg-sand-50 pb-section pt-[calc(var(--header-height)+2rem)]">
        <div className="shell">
          {/* Back */}
          <Link
            href="/properties"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-navy-500
                       transition-colors hover:text-gold-700"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1
                         rtl:-scale-x-100 rtl:group-hover:translate-x-1"
              aria-hidden="true"
            />
            {t('backToList')}
          </Link>

          {/* Title block */}
          <Reveal className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={property.status === 'for-sale' ? 'gold' : 'navy'}>
                {tStatus(property.status)}
              </Badge>
              <Badge tone="muted">{tTypes(property.type)}</Badge>
              {property.featured ? <Badge tone="gold">{tCard('featured')}</Badge> : null}
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-display-md font-extrabold text-navy-900">{title}</h1>
                <p className="mt-3 flex items-center gap-2 text-navy-500">
                  <MapPin className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                  {locationLabel}
                </p>
              </div>

              <p className="shrink-0 font-display text-3xl font-extrabold text-gold-gradient sm:text-4xl">
                <span className="numeric">{price}</span>
                {showPrice && property.status === 'for-rent' ? (
                  <span className="text-lg font-semibold text-navy-400">
                    {t('perMonth')}
                  </span>
                ) : null}
              </p>
            </div>
          </Reveal>

          {/* Gallery */}
          <div className="mt-10">
            <PropertyGallery
              images={property.gallery}
              title={title}
              locale={typedLocale}
            />
          </div>

          {/* Body */}
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              {/* Specs */}
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  {t('specs.title')}
                </h2>
                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-2xl border border-sand-300 bg-sand-100 p-4"
                    >
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-navy-400">
                        <spec.icon className="size-3.5 text-gold-600" aria-hidden="true" />
                        {spec.label}
                      </dt>
                      <dd className="mt-2 font-semibold text-navy-900">
                        <span className="numeric">{spec.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              {/* Overview */}
              <Reveal className="mt-12">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  {t('overview')}
                </h2>
                <p className="mt-5 whitespace-pre-line text-body-lg leading-relaxed text-navy-600">
                  {pick(property.description, typedLocale)}
                </p>
              </Reveal>

              {/* Features */}
              {property.features.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="font-display text-2xl font-bold text-navy-900">
                    {t('features.title')}
                  </h2>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {property.features.map((feature, index) => (
                      <li
                        key={`${index}-${feature.en}`}
                        className="flex items-center gap-3 rounded-xl border border-sand-200
                                   bg-sand-100 px-4 py-3"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-5 shrink-0 place-items-center rounded-full
                                     bg-gold-gradient text-navy-950"
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm font-medium text-navy-700">
                          {pick(feature, typedLocale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {/* Map */}
              <Reveal className="mt-12">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  {t('map.title')}
                </h2>
                <div className="mt-6">
                  <PropertyMap
                    lat={property.location.lat}
                    lng={property.location.lng}
                    label={locationLabel}
                    title={`${title} — ${locationLabel}`}
                  />
                </div>
              </Reveal>
            </div>

            {/* Agent rail */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <AgentCard
                  agent={property.agent}
                  locale={typedLocale}
                  propertyTitle={title}
                  reference={property.reference}
                />
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Similar */}
      <section className="border-t border-sand-200 bg-sand-200 py-section">
        <div className="shell">
          <Reveal>
            <h2 className="font-display text-display-sm font-bold text-navy-900">
              {t('similar.title')}
            </h2>
            <p className="mt-3 text-navy-500">
              {similar.length > 0 ? t('similar.description') : t('similar.empty')}
            </p>
          </Reveal>

          {similar.length > 0 ? (
            <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((item) => (
                <StaggerItem key={item._id}>
                  <PropertyCard property={item} locale={typedLocale} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}
        </div>
      </section>
    </>
  );
}
