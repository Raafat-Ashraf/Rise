import { useTranslations } from 'next-intl';

import { PropertyCardSkeleton } from './PropertyCard';

/**
 * Placeholder for the whole toolbar + filter rail + results block.
 *
 * Mirrors the real layout's geometry (control heights, column spans, card
 * aspect) so the swap from skeleton to content doesn't shift anything.
 */
export function PropertiesShellSkeleton({ count = 6 }: { count?: number }) {
  const t = useTranslations('properties');

  return (
    <div role="status" aria-label={t('loading')}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="skeleton h-13 flex-1 rounded-full" />
        <div className="flex gap-3">
          <div className="skeleton h-13 w-40 rounded-full" />
          <div className="skeleton h-13 w-32 rounded-full lg:hidden" />
        </div>
      </div>

      <div className="mt-5 skeleton h-4 w-28 rounded-md" />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Filter rail */}
        <div className="hidden lg:col-span-4 lg:block xl:col-span-3">
          <div className="skeleton h-[34rem] rounded-card" />
        </div>

        {/* Results */}
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8 xl:col-span-9 xl:grid-cols-3">
          {Array.from({ length: count }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}
