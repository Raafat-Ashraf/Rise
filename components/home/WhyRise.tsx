import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Calculator, HardHat, Receipt, ShieldCheck } from 'lucide-react';

import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';

const pillars = [
  { key: 'underwriting', icon: Calculator },
  { key: 'delivery', icon: HardHat },
  { key: 'management', icon: ShieldCheck },
  { key: 'transparency', icon: Receipt },
] as const;

export function WhyRise() {
  const t = useTranslations('home.why');

  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Sticky image column — holds while the pillars scroll past */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal direction="start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-navy-600">
                  <Image
                    src="/images/properties/villa-3.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"
                  />

                  {/* Floating proof card */}
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="glass rounded-2xl p-5">
                      <p className="font-display text-3xl font-extrabold text-gold-gradient">
                        <span className="numeric">94%</span>
                      </p>
                      <p className="mt-1 text-sm text-navy-200">
                        {t('items.management.title')}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Pillars */}
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow={t('eyebrow')}
              title={t('title')}
              description={t('description')}
            />

            <ul className="mt-12 space-y-5">
              {pillars.map((pillar, index) => (
                <Reveal
                  key={pillar.key}
                  as="li"
                  delay={index * 0.07}
                  direction="end"
                >
                  <div
                    className="group relative flex gap-5 rounded-card border border-navy-600/70
                               bg-navy-800/50 p-6 transition-all duration-500 ease-rise
                               hover:-translate-y-1 hover:border-gold-500/50 hover:bg-navy-800"
                  >
                    {/* Gold rail that grows on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-6 start-0 w-0.5 origin-top scale-y-0 rounded-full
                                 bg-gold-gradient transition-transform duration-500 ease-rise
                                 group-hover:scale-y-100"
                    />

                    <span
                      className="grid size-12 shrink-0 place-items-center rounded-xl border
                                 border-gold-500/30 bg-gold-500/10 text-gold-400 transition-colors
                                 duration-500 group-hover:bg-gold-gradient group-hover:text-navy-950"
                    >
                      <pillar.icon className="size-5" aria-hidden="true" />
                    </span>

                    <div>
                      <h3 className="text-lg font-bold text-sand-50">
                        {t(`items.${pillar.key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-navy-300">
                        {t(`items.${pillar.key}.body`)}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className="numeric absolute end-6 top-5 font-display text-sm font-bold text-navy-600
                                 transition-colors group-hover:text-gold-700"
                    >
                      0{index + 1}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
