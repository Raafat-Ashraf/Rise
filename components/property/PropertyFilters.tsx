'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';

import { usePathname, useRouter, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { countActiveFilters, serializeFilters } from '@/lib/filters';
import { SHOW_PRICES } from '@/lib/site-config';
import {
  PROPERTY_STATUS_VALUES,
  PROPERTY_TYPE_VALUES,
  SORT_VALUES,
  type PropertyFacets,
  type PropertyFilters as Filters,
  type PropertyStatus,
  type PropertyType,
  type SortValue,
} from '@/lib/types';
import { cn, formatPrice } from '@/lib/utils';

interface PropertyFiltersProps {
  /** Parsed from the URL on the server — the source of truth on first paint. */
  initialFilters: Filters;
  facets: PropertyFacets;
  resultCount: number;
  /**
   * The results grid. It stays a server component and is passed straight
   * through, so filtering never ships the property data to the client — this
   * component owns the toolbar/sidebar layout, not the results themselves.
   */
  children: React.ReactNode;
}

const SEARCH_DEBOUNCE_MS = 350;
const bedBathOptions = [1, 2, 3, 4, 5] as const;

export function PropertyFilters({
  initialFilters,
  facets,
  resultCount,
  children,
}: PropertyFiltersProps) {
  const t = useTranslations('properties');
  const tTypes = useTranslations('propertyTypes');
  const tStatus = useTranslations('propertyStatus');
  const locale = useLocale() as Locale;

  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  /**
   * The URL is the source of truth, so a back/forward press (or a shared link)
   * must win over local state. `initialFilters` is re-derived on the server for
   * every navigation, so syncing on its identity keeps the controls honest.
   */
  const serializedInitial = serializeFilters(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedInitial]);

  /** Writes filters to the URL; the server component re-renders the results. */
  const commit = useCallback(
    (next: Filters) => {
      startTransition(() => {
        router.replace(`${pathname}${serializeFilters(next)}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filters, ...patch };
      setFilters(next);
      commit(next);
    },
    [commit, filters],
  );

  // ── Search, debounced ────────────────────────────────
  const [searchDraft, setSearchDraft] = useState(initialFilters.q);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchDraft(initialFilters.q);
  }, [initialFilters.q]);

  const onSearchChange = (value: string) => {
    setSearchDraft(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    // Typing shouldn't push a history entry per keystroke.
    searchTimer.current = setTimeout(() => {
      const next = { ...filters, q: value };
      setFilters(next);
      commit(next);
    }, SEARCH_DEBOUNCE_MS);
  };

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  // ── Multi-select toggles ─────────────────────────────
  const toggleType = (type: PropertyType) =>
    update({
      type: filters.type.includes(type)
        ? filters.type.filter((item) => item !== type)
        : [...filters.type, type],
    });

  const toggleStatus = (status: PropertyStatus) =>
    update({
      status: filters.status.includes(status)
        ? filters.status.filter((item) => item !== status)
        : [...filters.status, status],
    });

  const clearAll = () => {
    const cleared: Filters = { q: '', type: [], status: [], sort: filters.sort };
    setSearchDraft('');
    setFilters(cleared);
    commit(cleared);
  };

  const activeCount = countActiveFilters(filters);

  // Sliders are uncontrolled by the URL until the user moves them, so an
  // untouched slider spans the full facet range rather than pinning a value.
  const priceValue = useMemo<[number, number]>(
    () => [filters.minPrice ?? facets.minPrice, filters.maxPrice ?? facets.maxPrice],
    [facets.maxPrice, facets.minPrice, filters.maxPrice, filters.minPrice],
  );

  const areaValue = useMemo<[number, number]>(
    () => [filters.minArea ?? facets.minArea, filters.maxArea ?? facets.maxArea],
    [facets.maxArea, facets.minArea, filters.maxArea, filters.minArea],
  );

  const priceStep = Math.max(
    100_000,
    Math.round((facets.maxPrice - facets.minPrice) / 100 / 100_000) * 100_000,
  );

  // "Sort by price" is meaningless — and a giveaway — when no price is shown.
  const sortOptions = SHOW_PRICES
    ? SORT_VALUES
    : SORT_VALUES.filter((sort) => !sort.startsWith('price-'));

  const filterPanel = (
    <div className="space-y-8">
      {/* Status */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-800">
          {t('filters.status')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_STATUS_VALUES.map((status) => (
            <FilterChip
              key={status}
              active={filters.status.includes(status)}
              onClick={() => toggleStatus(status)}
            >
              {tStatus(status)}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      {/* Type */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-800">
          {t('filters.type')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPE_VALUES.map((type) => (
            <FilterChip
              key={type}
              active={filters.type.includes(type)}
              onClick={() => toggleType(type)}
            >
              {tTypes(type)}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      {/* Price — hidden in "price on request" mode: the slider's handle labels
          would print real figures, which is exactly what we're withholding. */}
      {SHOW_PRICES ? (
        <RangeSlider
          label={t('filters.price')}
          min={facets.minPrice}
          max={facets.maxPrice}
          step={priceStep}
          value={priceValue}
          minLabel={t('filters.min')}
          maxLabel={t('filters.max')}
          format={(value) => formatPrice(value, locale, { abbreviate: true })}
          onChange={([min, max]) =>
            update({
              // Snapping back to the facet bound clears the filter, so the URL
              // stays free of no-op params.
              minPrice: min <= facets.minPrice ? undefined : min,
              maxPrice: max >= facets.maxPrice ? undefined : max,
            })
          }
        />
      ) : null}

      {/* Area */}
      <RangeSlider
        label={t('filters.area')}
        min={facets.minArea}
        max={facets.maxArea}
        step={10}
        value={areaValue}
        minLabel={t('filters.min')}
        maxLabel={t('filters.max')}
        format={(value) => `${value}`}
        onChange={([min, max]) =>
          update({
            minArea: min <= facets.minArea ? undefined : min,
            maxArea: max >= facets.maxArea ? undefined : max,
          })
        }
      />

      {/* Bedrooms */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-800">
          {t('filters.bedrooms')}
        </legend>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filters.bedrooms === undefined}
            onClick={() => update({ bedrooms: undefined })}
          >
            {t('filters.any')}
          </FilterChip>
          {bedBathOptions.map((count) => (
            <FilterChip
              key={count}
              active={filters.bedrooms === count}
              onClick={() =>
                update({ bedrooms: filters.bedrooms === count ? undefined : count })
              }
            >
              <span className="numeric">{t('filters.plus', { count })}</span>
            </FilterChip>
          ))}
        </div>
      </fieldset>

      {/* Bathrooms */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-800">
          {t('filters.bathrooms')}
        </legend>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filters.bathrooms === undefined}
            onClick={() => update({ bathrooms: undefined })}
          >
            {t('filters.any')}
          </FilterChip>
          {bedBathOptions.map((count) => (
            <FilterChip
              key={count}
              active={filters.bathrooms === count}
              onClick={() =>
                update({ bathrooms: filters.bathrooms === count ? undefined : count })
              }
            >
              <span className="numeric">{t('filters.plus', { count })}</span>
            </FilterChip>
          ))}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-navy-300"
            aria-hidden="true"
          />
          <label htmlFor="property-search" className="sr-only">
            {t('search.label')}
          </label>
          <input
            id="property-search"
            type="search"
            value={searchDraft}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('search.placeholder')}
            className="h-13 w-full rounded-full border border-sand-300 bg-sand-50 py-3.5 ps-12 pe-12
                       text-navy-900 placeholder:text-navy-300 transition-colors
                       focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          />
          {isPending ? (
            <Loader2
              className="absolute end-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-gold-600"
              aria-hidden="true"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <label htmlFor="property-sort" className="sr-only">
            {t('sort.label')}
          </label>
          <select
            id="property-sort"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value as SortValue })}
            className="h-13 cursor-pointer rounded-full border border-sand-300 bg-sand-50 px-5
                       text-sm font-medium text-navy-800 transition-colors focus:border-gold-500
                       focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          >
            {sortOptions.map((sort) => (
              <option key={sort} value={sort}>
                {t(
                  `sort.${
                    sort === 'price-asc'
                      ? 'priceAsc'
                      : sort === 'price-desc'
                        ? 'priceDesc'
                        : sort === 'area-desc'
                          ? 'areaDesc'
                          : 'newest'
                  }`,
                )}
              </option>
            ))}
          </select>

          {/* Mobile sheet trigger */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            className="relative flex h-13 items-center gap-2 rounded-full border border-sand-300
                       bg-sand-50 px-5 text-sm font-semibold text-navy-800 transition-colors
                       hover:border-gold-500 lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {t('filters.open')}
            {activeCount > 0 ? (
              <span
                className="numeric grid size-5 place-items-center rounded-full bg-gold-gradient
                           text-[0.65rem] font-bold text-navy-950"
              >
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Result count + clear */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-navy-500" aria-live="polite">
          <span className="numeric">{t('resultCount', { count: resultCount })}</span>
        </p>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1.5
                       text-xs font-semibold text-navy-600 transition-colors hover:border-gold-500
                       hover:text-gold-700"
          >
            <X className="size-3.5" aria-hidden="true" />
            {t('filters.clear')}
            <span className="numeric">({activeCount})</span>
          </button>
        ) : null}
      </div>

      {/* ── Sidebar + results ───────────────────────── */}
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <aside
          className="hidden lg:col-span-4 lg:block xl:col-span-3"
          aria-label={t('filters.title')}
        >
          <div
            className="rounded-card border border-sand-300 bg-sand-50 p-7 shadow-card
                       lg:sticky lg:top-28 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto"
          >
            {filterPanel}
          </div>
        </aside>

        <div
          className={cn(
            'lg:col-span-8 xl:col-span-9',
            // Dim the grid while the server re-renders, so a slow filter change
            // reads as "working" rather than "broken".
            isPending && 'opacity-60 transition-opacity duration-200',
          )}
        >
          {children}
        </div>
      </div>

      {/* ── Mobile sheet ────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('filters.title')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl
                         border-t border-sand-300 bg-sand-50 p-6 pb-8"
            >
              {/* Grab handle */}
              <div
                aria-hidden="true"
                className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-sand-300"
              />

              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-navy-900">
                  {t('filters.title')}
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label={t('filters.close')}
                  className="grid size-10 place-items-center rounded-full bg-sand-200 text-navy-700"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              {filterPanel}

              <div className="sticky bottom-0 -mx-6 mt-8 flex gap-3 border-t border-sand-200 bg-sand-50 px-6 pt-4">
                <Button variant="outline" size="md" onClick={clearAll} className="flex-1">
                  {t('filters.clear')}
                </Button>
                <Button size="md" onClick={() => setSheetOpen(false)} className="flex-1">
                  {t('filters.apply')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-rise',
        active
          ? 'border-gold-500 bg-gold-gradient text-navy-950 shadow-[0_4px_14px_-4px_rgb(188_143_67/0.6)]'
          : 'border-sand-300 bg-sand-50 text-navy-600 hover:border-gold-500/60 hover:text-navy-900',
      )}
    >
      {children}
    </button>
  );
}
