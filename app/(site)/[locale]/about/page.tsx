import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Compass, Eye, Target } from 'lucide-react';

import { locales } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Timeline } from '@/components/about/Timeline';
import { CallToAction } from '@/components/home/CallToAction';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/utils';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.about' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/about`),
      languages: { ar: absoluteUrl('/ar/about'), en: absoluteUrl('/en/about') },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: absoluteUrl(`/${locale}/about`),
    },
  };
}

const values = ['one', 'two', 'three', 'four'] as const;
const members = ['one', 'two', 'three', 'four'] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('about'), url: absoluteUrl(`/${locale}/about`) },
        ]}
      />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('lead')}
        image="/images/properties/about-team.jpg"
      />

      {/* ── Story ─────────────────────────────────── */}
      <Section tone="light">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal direction="start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-lift">
                  <Image
                    src="/images/properties/tower-3.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className="object-cover"
                  />
                </div>

                {/* Founding-year plaque */}
                <div className="relative -mt-16 ms-6 w-fit rounded-2xl bg-navy-900 p-6 shadow-lift">
                  <p className="numeric font-display text-4xl font-extrabold text-gold-gradient">
                    2009
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-navy-300">
                    {t('timeline.items.2009.title')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="text-display-sm font-bold text-navy-900">
                  {t('story.title')}
                </h2>
                <div className="mt-6 space-y-5 text-body-lg leading-relaxed text-navy-600">
                  <p>{t('story.body1')}</p>
                  <p>{t('story.body2')}</p>
                  <p>{t('story.body3')}</p>
                </div>
              </Reveal>

              {/* Mission / vision */}
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {[
                  { icon: Target, title: t('mission.title'), body: t('mission.body') },
                  {
                    icon: Eye,
                    title: t('mission.vision.title'),
                    body: t('mission.vision.body'),
                  },
                ].map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.08}>
                    <div className="h-full rounded-card border border-sand-300 bg-sand-100 p-6">
                      <span
                        className="grid size-11 place-items-center rounded-xl bg-navy-900 text-gold-400"
                        aria-hidden="true"
                      >
                        <item.icon className="size-5" />
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-navy-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-navy-500">
                        {item.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Values ────────────────────────────────── */}
      <Section tone="warm">
        <div className="shell">
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={t('mission.values.title')}
            align="center"
          />

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <StaggerItem key={value} className="h-full">
                <Card interactive className="h-full">
                  <CardBody>
                    <span
                      className="numeric font-display text-sm font-bold text-gold-600"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-navy-900">
                      {t(`mission.values.items.${value}.title`)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-500">
                      {t(`mission.values.items.${value}.body`)}
                    </p>
                  </CardBody>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* ── Timeline ──────────────────────────────── */}
      <Section tone="dark">
        <div className="shell">
          <SectionHeader
            eyebrow={t('timeline.eyebrow')}
            title={t('timeline.title')}
            align="center"
          />
          <Timeline />
        </div>
      </Section>

      {/* ── Team ──────────────────────────────────── */}
      <Section tone="light">
        <div className="shell">
          <SectionHeader
            eyebrow={t('team.eyebrow')}
            title={t('team.title')}
            description={t('team.description')}
            align="center"
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => {
              const name = t(`team.members.${member}.name`);
              const initials = name
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('');

              return (
                <StaggerItem key={member}>
                  <div
                    className="group h-full rounded-card border border-sand-300 bg-sand-100 p-6
                               text-center transition-all duration-500 ease-rise
                               hover:-translate-y-2 hover:border-gold-500/60 hover:shadow-lift"
                  >
                    {/* Initials monogram rather than a stock headshot — we won't
                        put a stranger's face on a named team member. */}
                    <span
                      aria-hidden="true"
                      className="mx-auto grid size-20 place-items-center rounded-full bg-navy-900
                                 font-display text-xl font-bold text-gold-400 transition-all
                                 duration-500 ease-rise group-hover:bg-gold-gradient
                                 group-hover:text-navy-950"
                    >
                      {initials}
                    </span>

                    <h3 className="mt-5 text-lg font-bold text-navy-900">{name}</h3>
                    <p className="mt-1 text-sm font-medium text-gold-700">
                      {t(`team.members.${member}.role`)}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-navy-500">
                      {t(`team.members.${member}.bio`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal className="mt-14 text-center">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-navy-500">{t('cta.description')}</p>
            <div className="mt-7">
              <ButtonLink href="/contact" size="lg">
                {t('cta.primary')}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
