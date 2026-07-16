import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { ButtonLink } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import type { Property } from '@/lib/types';
import { PropertyCard } from './PropertyCard';

const GRID = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

export function PropertyGrid({
  properties,
  locale,
}: {
  properties: Property[];
  locale: Locale;
}) {
  if (properties.length === 0) return <EmptyState />;

  return (
    <Stagger className={GRID}>
      {properties.map((property, index) => (
        <StaggerItem key={property._id}>
          <PropertyCard
            property={property}
            locale={locale}
            priority={index < 3}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function EmptyState() {
  const t = useTranslations('properties.empty');

  return (
    <div className="rounded-card border border-dashed border-sand-400 bg-sand-100 px-6 py-20 text-center">
      <span
        className="mx-auto grid size-16 place-items-center rounded-full bg-sand-200 text-gold-600"
        aria-hidden="true"
      >
        <SearchX className="size-7" />
      </span>

      <h2 className="mt-6 font-display text-2xl font-bold text-navy-900">
        {t('title')}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-500">
        {t('description')}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {/* A bare /properties link is the canonical "no filters" URL, so this
            clears everything without needing client state. */}
        <ButtonLink href="/properties" variant="primary" size="md">
          {t('clear')}
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline" size="md">
          {t('contact')}
        </ButtonLink>
      </div>
    </div>
  );
}
