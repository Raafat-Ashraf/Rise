import { useTranslations } from 'next-intl';

import { Counter } from '@/components/ui/Counter';
import { Reveal } from '@/components/ui/Reveal';
import { ScrollCity } from './ScrollCity';

/**
 * Stats band.
 *
 * The counters sit above the scroll-driven city: as the section passes through
 * the viewport the skyline builds behind the numbers while the numbers count up
 * — the two are deliberately on the same scroll beat.
 */
export function StatsSection() {
  const t = useTranslations('home.stats');

  const stats = [
    { key: 'assets', value: 124, decimals: 0, suffix: '+' },
    { key: 'value', value: 2.4, decimals: 1, suffix: '' },
    { key: 'clients', value: 890, decimals: 0, suffix: '+' },
    { key: 'yield', value: 11.6, decimals: 1, suffix: '%' },
  ] as const;

  return (
    <section className="theme-dark relative isolate overflow-hidden bg-navy-depth py-section text-sand-50">
      {/* The city builds behind the numbers */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] opacity-70"
        aria-hidden="true"
      >
        <ScrollCity className="size-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-navy-950/70" />
      </div>

      <div className="shell relative">
        <Reveal className="max-w-2xl">
          <p className="mb-4 flex items-center gap-3 text-label font-semibold uppercase text-gold-400">
            <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
            {t('eyebrow')}
          </p>
          <h2 className="text-display-md font-bold text-sand-50">{t('title')}</h2>
          <p className="mt-5 text-body-lg text-navy-300">{t('description')}</p>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <Reveal key={stat.key} delay={index * 0.08}>
              <div className="border-t border-gold-500/30 pt-5">
                <dd className="font-display text-4xl font-extrabold text-gold-gradient sm:text-5xl">
                  <Counter
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                  {/* The "B EGP" / "مليار ج.م" unit is part of the label copy,
                      so it stays translatable rather than baked into the digit. */}
                  {stat.key === 'value' ? (
                    <span className="ms-1 text-2xl sm:text-3xl">
                      {t('items.value.suffix')}
                    </span>
                  ) : null}
                </dd>
                <dt className="mt-2 text-sm font-medium text-navy-300">
                  {t(`items.${stat.key}.label`)}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
