'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RotateCw } from 'lucide-react';

import { Button, ButtonLink } from '@/components/ui/Button';

/**
 * Route-level error boundary. Catches render/data errors below the locale
 * layout, so the header, footer and translations are all still available here.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    // In production this is where an error reporter would go.
    console.error('[rise] route error:', error);
  }, [error]);

  return (
    <section className="theme-dark grid min-h-dvh place-items-center bg-navy-depth px-5">
      <div className="max-w-lg py-24 text-center">
        <span
          className="mx-auto grid size-16 place-items-center rounded-2xl border border-gold-500/40
                     bg-gold-500/10 text-gold-400"
          aria-hidden="true"
        >
          <AlertTriangle className="size-8" />
        </span>

        <h1 className="mt-8 text-display-sm font-extrabold text-sand-50">{t('title')}</h1>
        <p className="mt-5 text-navy-300">{t('description')}</p>

        {error.digest ? (
          <p className="numeric mt-4 font-mono text-xs text-navy-500">{error.digest}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" onClick={reset}>
            <RotateCw className="size-4" aria-hidden="true" />
            {t('retry')}
          </Button>
          <ButtonLink href="/" size="lg" variant="onDark">
            {t('home')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
