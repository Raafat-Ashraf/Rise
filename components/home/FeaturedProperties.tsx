import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Section, SectionHeader } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getFeaturedProperties } from '@/lib/properties';

export async function FeaturedProperties({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.featured' });
  const properties = await getFeaturedProperties(6);

  if (properties.length === 0) return null;

  return (
    <Section id="featured" tone="light" className="scroll-mt-24">
      <div className="shell">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={
            <ButtonLink href="/properties" variant="outline" size="md">
              {t('cta')}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </ButtonLink>
          }
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property, index) => (
            <StaggerItem key={property._id}>
              <PropertyCard
                property={property}
                locale={locale}
                // Only the first row is plausibly above the fold.
                priority={index < 3}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
