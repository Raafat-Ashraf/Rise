import { useTranslations } from 'next-intl';
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Handshake,
  KeyRound,
  TrendingUp,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import { Section, SectionHeader } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';

const services = [
  { key: 'investment', icon: TrendingUp },
  { key: 'buying', icon: KeyRound },
  { key: 'selling', icon: Handshake },
  { key: 'management', icon: Building2 },
  { key: 'consulting', icon: ClipboardCheck },
] as const;

export function ServicesPreview() {
  const t = useTranslations('home.services');
  const tServices = useTranslations('services.items');

  return (
    <Section tone="warm">
      <div className="shell">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={
            <ButtonLink href="/services" variant="outline">
              {t('cta')}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </ButtonLink>
          }
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <StaggerItem
              key={service.key}
              // The last card spans the empty column on 3-up so the grid
              // doesn't end ragged.
              className={index === services.length - 1 ? 'lg:col-span-1' : undefined}
            >
              <Link
                href={`/services#${service.key}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-card border
                           border-sand-300 bg-sand-50 p-7 shadow-card transition-all duration-500
                           ease-rise hover:-translate-y-2 hover:border-gold-500/60 hover:shadow-lift
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                {/* Gold wash that blooms from the corner on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-16 -top-16 size-40 rounded-full
                             bg-gold-500/0 blur-2xl transition-all duration-700 ease-rise
                             group-hover:bg-gold-500/20"
                />

                <span
                  className="grid size-12 place-items-center rounded-xl bg-navy-900 text-gold-400
                             transition-all duration-500 ease-rise group-hover:bg-gold-gradient
                             group-hover:text-navy-950"
                >
                  <service.icon className="size-6" aria-hidden="true" />
                </span>

                <h3 className="mt-6 text-xl font-bold text-navy-900">
                  {tServices(`${service.key}.title`)}
                </h3>
                <p className="mt-1 text-sm font-medium text-gold-700">
                  {tServices(`${service.key}.tagline`)}
                </p>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-navy-500">
                  {tServices(`${service.key}.body`)}
                </p>

                <span
                  aria-hidden="true"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900
                             transition-colors group-hover:text-gold-700"
                >
                  <ArrowUpRight
                    className="size-4 transition-transform duration-500 ease-rise
                               group-hover:translate-x-1 group-hover:-translate-y-1
                               rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
