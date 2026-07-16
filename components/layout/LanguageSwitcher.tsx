'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';

import {
  locales,
  localeLabels,
  usePathname,
  useRouter,
  type Locale,
} from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Switches locale while staying on the same page.
 *
 * `usePathname` from next-intl returns the path *without* the locale prefix, so
 * the router can re-render the identical route under the other locale — a
 * visitor reading a property in Arabic lands on that same property in English,
 * with their filters (the query string) intact.
 *
 * The query string is read from `window.location` inside the click handler
 * rather than via `useSearchParams()`. That hook would opt this component — and
 * therefore the header, and therefore every page — out of static rendering
 * unless wrapped in Suspense, and that Suspense boundary in turn causes Next to
 * flush a 200 before a page's `notFound()` can set a 404. Reading the query
 * lazily on click keeps the whole site statically rendered and 404s honest.
 */
export function LanguageSwitcher({ tone = 'dark', className }: LanguageSwitcherProps) {
  const t = useTranslations('nav');
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale: Locale) {
    if (nextLocale === activeLocale || isPending) return;

    // Safe: only ever runs from a user click, i.e. on the client.
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);

    startTransition(() => {
      router.replace(
        // @ts-expect-error — pathname is a resolved string; params carries any
        // dynamic segments (e.g. [slug]) so they survive the locale swap.
        { pathname, params, query: Object.keys(query).length > 0 ? query : undefined },
        { locale: nextLocale },
      );
    });
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center rounded-full border p-0.5',
        tone === 'light'
          ? 'border-sand-50/20 bg-sand-50/5'
          : 'border-sand-300 bg-sand-100',
        isPending && 'pointer-events-none opacity-70',
        className,
      )}
      role="group"
      aria-label={t('languageLabel')}
    >
      <Languages
        className={cn(
          'mx-2 size-4 shrink-0',
          tone === 'light' ? 'text-sand-200/70' : 'text-navy-400',
        )}
        aria-hidden="true"
      />

      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={isActive ? 'true' : undefined}
            /* The label is the language's own endonym, so a visitor who can't
               read the current locale can still find their own. */
            lang={locale}
            className={cn(
              'relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300',
              isActive
                ? 'bg-gold-gradient text-navy-950 shadow-[0_2px_10px_-2px_rgb(188_143_67/0.7)]'
                : tone === 'light'
                  ? 'text-sand-200 hover:text-sand-50'
                  : 'text-navy-500 hover:text-navy-900',
            )}
          >
            {localeLabels[locale].short}
            <span className="sr-only"> — {localeLabels[locale].native}</span>
          </button>
        );
      })}
    </div>
  );
}
