import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Bath, BedDouble, MapPin, Maximize } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { Badge } from '@/components/ui/Card';
import type { Property } from '@/lib/types';
import { SHOW_PRICES } from '@/lib/site-config';
import { cn, formatArea, formatPrice, pick } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  locale: Locale;
  /** Cover image priority — pass `true` for the first row above the fold. */
  priority?: boolean;
  className?: string;
}

const statusTone = {
  'for-sale': 'gold',
  'for-rent': 'navy',
  'off-plan': 'navy',
  sold: 'muted',
} as const;

export function PropertyCard({
  property,
  locale,
  priority = false,
  className,
}: PropertyCardProps) {
  const t = useTranslations('properties.card');
  const tTypes = useTranslations('propertyTypes');
  const tStatus = useTranslations('propertyStatus');
  const tProperty = useTranslations('property');

  const cover = property.gallery[0];
  const title = pick(property.title, locale);
  const city = pick(property.location.city, locale);
  const district = property.location.district
    ? pick(property.location.district, locale)
    : undefined;

  const showPrice = SHOW_PRICES && property.price !== undefined;
  const price = showPrice
    ? formatPrice(property.price!, locale, { abbreviate: true })
    : tProperty('priceOnRequest');

  const specs = [
    property.bedrooms
      ? { icon: BedDouble, label: t('beds', { count: property.bedrooms }) }
      : null,
    property.bathrooms
      ? { icon: Bath, label: t('baths', { count: property.bathrooms }) }
      : null,
    { icon: Maximize, label: formatArea(property.area, locale) },
  ].filter(Boolean) as Array<{ icon: typeof Bath; label: string }>;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card border border-sand-300',
        'bg-sand-50 shadow-card transition-all duration-500 ease-rise gpu',
        'hover:-translate-y-2 hover:border-gold-500/60 hover:shadow-lift',
        'focus-within:-translate-y-2 focus-within:border-gold-500/60 focus-within:shadow-lift',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-200">
        {cover ? (
          <Image
            src={cover.url}
            alt={pick(cover.alt, locale)}
            fill
            priority={priority}
            // Three-up on desktop, two-up on tablet, full-bleed on mobile.
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 92vw"
            placeholder={cover.lqip ? 'blur' : undefined}
            blurDataURL={cover.lqip}
            className="size-full object-cover transition-transform duration-700 ease-rise
                       group-hover:scale-[1.06]"
          />
        ) : null}

        {/* Anchors the badges and price against bright photography */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/10 to-navy-950/25"
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <Badge tone={statusTone[property.status]}>{tStatus(property.status)}</Badge>
          {property.featured ? <Badge tone="gold">{t('featured')}</Badge> : null}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold-300">
              {tTypes(property.type)}
            </p>
            <p className="mt-1 text-xl font-bold text-sand-50">
              <span className="numeric">{price}</span>
              {/* The "/month" suffix only means something next to an actual
                  figure — without one it reads as noise. */}
              {showPrice && property.status === 'for-rent' ? (
                <span className="text-sm font-medium text-sand-200">
                  {tProperty('perMonth')}
                </span>
              ) : null}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-50/10
                       text-sand-50 backdrop-blur-sm transition-all duration-500 ease-rise
                       group-hover:bg-gold-gradient group-hover:text-navy-950
                       rtl:-scale-x-100"
          >
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-bold leading-snug text-navy-900">
          {/* Stretched link: the whole card is clickable, but only the title is
              in the tab order and read as the link name. */}
          <Link
            href={`/properties/${property.slug}`}
            className="before:absolute before:inset-0 before:z-10 before:content-['']
                       focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-navy-400">
          <MapPin className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
          <span className="line-clamp-1">
            {district ? `${district}، ${city}` : city}
          </span>
        </p>

        <ul className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand-200 pt-4 text-sm text-navy-600">
          {specs.map((spec) => (
            <li key={spec.label} className="flex items-center gap-1.5">
              <spec.icon className="size-4 text-navy-300" aria-hidden="true" />
              <span className="numeric">{spec.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** Matches PropertyCard's geometry so the grid doesn't reflow when data lands. */
export function PropertyCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-card border border-sand-300 bg-sand-50 shadow-card"
      aria-hidden="true"
    >
      <div className="skeleton aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="skeleton h-5 w-3/4 rounded-md" />
        <div className="skeleton h-4 w-1/2 rounded-md" />
        <div className="mt-auto flex gap-4 border-t border-sand-200 pt-4">
          <div className="skeleton h-4 w-16 rounded-md" />
          <div className="skeleton h-4 w-16 rounded-md" />
          <div className="skeleton h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
