import { useTranslations } from 'next-intl';
import { ArrowLeft, Building2 } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <section className="theme-dark relative isolate grid min-h-dvh place-items-center overflow-hidden bg-navy-depth px-5">
      {/* Oversized 404, sunk into the background */}
      <p
        aria-hidden="true"
        className="numeric pointer-events-none absolute inset-0 -z-10 grid select-none place-items-center
                   font-display text-[38vw] font-extrabold leading-none text-sand-50/[0.03]"
      >
        {t('code')}
      </p>

      <div className="max-w-lg py-24 text-center">
        <span
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-gold-gradient text-navy-950"
          aria-hidden="true"
        >
          <Building2 className="size-8" />
        </span>

        <p className="numeric mt-8 font-display text-sm font-bold uppercase tracking-[0.3em] text-gold-500">
          {t('code')}
        </p>

        <h1 className="mt-4 text-display-md font-extrabold text-sand-50">{t('title')}</h1>

        <p className="mt-5 text-body-lg text-navy-300">{t('description')}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/" size="lg">
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {t('home')}
          </ButtonLink>
          <ButtonLink href="/properties" size="lg" variant="onDark">
            {t('properties')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
