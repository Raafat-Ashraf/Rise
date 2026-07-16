import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowUpRight,
  Building2,
  Check,
  ClipboardCheck,
  Handshake,
  KeyRound,
  TrendingUp,
} from 'lucide-react';

import { locales } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl, cn } from '@/lib/utils';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.services' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/services`),
      languages: { ar: absoluteUrl('/ar/services'), en: absoluteUrl('/en/services') },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: absoluteUrl(`/${locale}/services`),
    },
  };
}

/** Each service gets its own photograph and icon; order drives the alternation. */
const services = [
  { key: 'investment', icon: TrendingUp, image: '/images/properties/tower-1.jpg' },
  { key: 'buying', icon: KeyRound, image: '/images/properties/villa-1.jpg' },
  { key: 'selling', icon: Handshake, image: '/images/properties/interior-1.jpg' },
  { key: 'management', icon: Building2, image: '/images/properties/compound-2.jpg' },
  { key: 'consulting', icon: ClipboardCheck, image: '/images/properties/office-1.jpg' },
] as const;

const featureKeys = ['one', 'two', 'three', 'four'] as const;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'services' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('services'), url: absoluteUrl(`/${locale}/services`) },
        ]}
      />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('lead')}
        image="/images/properties/office-2.jpg"
      />

      {services.map((service, index) => {
        const flipped = index % 2 === 1;

        return (
          <Section
            key={service.key}
            id={service.key}
            // Offset the anchor so the fixed header doesn't cover the heading
            // when arriving from /services#buying.
            tone={flipped ? 'warm' : 'light'}
            className="scroll-mt-20"
          >
            <div className="shell">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Image */}
                <Reveal
                  direction={flipped ? 'end' : 'start'}
                  className={cn(flipped && 'lg:order-2')}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-lift">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 48vw, 92vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent"
                    />

                    <span
                      aria-hidden="true"
                      className="numeric absolute bottom-5 start-5 font-display text-5xl
                                 font-extrabold text-sand-50/25"
                    >
                      0{index + 1}
                    </span>
                  </div>
                </Reveal>

                {/* Copy */}
                <Reveal
                  direction={flipped ? 'start' : 'end'}
                  className={cn(flipped && 'lg:order-1')}
                >
                  <span
                    className="grid size-12 place-items-center rounded-xl bg-navy-900 text-gold-400"
                    aria-hidden="true"
                  >
                    <service.icon className="size-6" />
                  </span>

                  <h2 className="mt-6 text-display-sm font-bold text-navy-900">
                    {t(`items.${service.key}.title`)}
                  </h2>
                  <p className="mt-2 font-medium text-gold-700">
                    {t(`items.${service.key}.tagline`)}
                  </p>
                  <p className="mt-5 text-body-lg leading-relaxed text-navy-600">
                    {t(`items.${service.key}.body`)}
                  </p>

                  <p className="mt-8 text-label font-semibold uppercase text-navy-400">
                    {t('featuresLabel')}
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {featureKeys.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full
                                     bg-gold-gradient text-navy-950"
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm text-navy-600">
                          {t(`items.${service.key}.features.${feature}`)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9">
                    <Magnetic strength={8}>
                      <ButtonLink href="/contact" size="md">
                        {t('cta.primary')}
                        <ArrowUpRight
                          className="size-4 rtl:-scale-x-100"
                          aria-hidden="true"
                        />
                      </ButtonLink>
                    </Magnetic>
                  </div>
                </Reveal>
              </div>
            </div>
          </Section>
        );
      })}

      {/* Closing CTA */}
      <section className="theme-dark relative isolate overflow-hidden bg-navy-depth py-section">
        <div className="rule-gold" aria-hidden="true" />

        <div className="shell">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-display-md font-extrabold text-sand-50">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-5 text-body-lg text-navy-300">
              {t('cta.description')}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/contact" size="lg">
                {t('cta.primary')}
              </ButtonLink>
              <ButtonLink href="/properties" size="lg" variant="onDark">
                {t('cta.secondary')}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
