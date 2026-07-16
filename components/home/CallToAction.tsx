import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';

export function CallToAction() {
  const t = useTranslations('home.cta');

  return (
    <section className="theme-dark relative isolate overflow-hidden bg-navy-950">
      <Image
        src="/images/properties/tower-1.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover opacity-20"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy-depth/85" />

      {/* Gold rules top and bottom, echoing the arc in the logo */}
      <div className="rule-gold" aria-hidden="true" />

      <div className="shell py-section">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-label font-semibold uppercase text-gold-400">
            {t('eyebrow')}
          </p>

          <h2 className="mt-5 text-display-lg font-extrabold text-sand-50">
            {t('title')}
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-body-lg text-navy-300">
            {t('description')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic strength={10}>
              <ButtonLink href="/contact" size="lg">
                {t('primary')}
                <ArrowUpRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
              </ButtonLink>
            </Magnetic>

            <ButtonLink href="/properties" size="lg" variant="onDark">
              {t('secondary')}
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <div className="rule-gold" aria-hidden="true" />
    </section>
  );
}
