import { useTranslations } from 'next-intl';

import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';

const steps = ['brief', 'select', 'acquire', 'manage'] as const;

export function Process() {
  const t = useTranslations('home.process');

  return (
    <Section tone="light">
      <div className="shell">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          align="center"
        />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* The connecting rail — logical inset so it mirrors under RTL */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent
                       via-gold-500/40 to-transparent md:block"
          />

          {steps.map((step, index) => (
            <Reveal as="li" key={step} delay={index * 0.1} className="relative">
              <div className="flex flex-col items-center text-center md:items-start md:text-start">
                <span
                  className="relative z-10 grid size-14 place-items-center rounded-full border-2
                             border-gold-500/40 bg-sand-50 font-display text-lg font-extrabold
                             text-gold-700 shadow-card"
                >
                  <span className="numeric">{index + 1}</span>
                </span>

                <h3 className="mt-6 text-xl font-bold text-navy-900">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  {t(`steps.${step}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
