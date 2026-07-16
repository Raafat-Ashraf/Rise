import { setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { Hero } from '@/components/hero/Hero';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { ServicesPreview } from '@/components/home/ServicesPreview';
import { StatsSection } from '@/components/home/StatsSection';
import { WhyRise } from '@/components/home/WhyRise';
import { Process } from '@/components/home/Process';
import { Testimonials } from '@/components/home/Testimonials';
import { CallToAction } from '@/components/home/CallToAction';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <OrganizationJsonLd locale={locale as Locale} />
      <WebSiteJsonLd locale={locale as Locale} />

      <Hero />
      <FeaturedProperties locale={locale as Locale} />
      <ServicesPreview />
      <StatsSection />
      <WhyRise />
      <Process />
      <Testimonials />
      <CallToAction />
    </>
  );
}
