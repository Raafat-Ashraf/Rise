'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Section, SectionHeader } from '@/components/ui/Section';
import { cn } from '@/lib/utils';

const items = ['one', 'two', 'three', 'four'] as const;
const AUTOPLAY_MS = 7000;

export function Testimonials() {
  const t = useTranslations('home.testimonials');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const isRtl = locale === 'ar';

  const [index, setIndex] = useState(0);
  // Which way the incoming card should fly in from.
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex((next + items.length) % items.length);
  }, []);

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const previous = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  const active = items[index];

  /* Slide direction is flipped under RTL so "next" always travels the way the
     reader's eye does. */
  const enterX = (isRtl ? -1 : 1) * direction * 56;

  return (
    <Section tone="warm">
      <div className="shell">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          align="center"
        />

        <div
          className="relative mx-auto mt-14 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            className="relative overflow-hidden rounded-card border border-sand-300 bg-sand-50
                       p-8 shadow-card sm:p-12"
            /* Announces each new quote to screen readers as it rotates. */
            aria-live="polite"
            aria-atomic="true"
          >
            <Quote
              className="absolute end-8 top-8 size-16 text-gold-500/15 rtl:-scale-x-100"
              aria-hidden="true"
            />

            <AnimatePresence mode="wait" custom={enterX}>
              <motion.figure
                key={active}
                initial={{ opacity: 0, x: enterX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -enterX * 0.5 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <blockquote className="text-xl font-medium leading-relaxed text-navy-800 sm:text-2xl">
                  {t(`items.${active}.quote`)}
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-4">
                  {/* Initials monogram — we'd rather show a real mark than a
                      stock headshot standing in for a named client. */}
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-navy-900
                               font-display text-sm font-bold text-gold-400"
                  >
                    {t(`items.${active}.name`)
                      .split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')}
                  </span>

                  <div>
                    <p className="font-bold text-navy-900">{t(`items.${active}.name`)}</p>
                    <p className="text-sm text-navy-400">{t(`items.${active}.role`)}</p>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={previous}
              aria-label={tCommon('previous')}
              className="grid size-11 place-items-center rounded-full border border-sand-300
                         bg-sand-50 text-navy-700 transition-all duration-300 hover:-translate-y-0.5
                         hover:border-gold-500 hover:text-gold-700"
            >
              <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>

            <ul className="flex items-center gap-2.5">
              {items.map((item, itemIndex) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => go(itemIndex, itemIndex > index ? 1 : -1)}
                    aria-label={`${itemIndex + 1} ${tCommon('of')} ${items.length}`}
                    aria-current={itemIndex === index ? 'true' : undefined}
                    className={cn(
                      'h-2 rounded-full transition-all duration-500 ease-rise',
                      itemIndex === index
                        ? 'w-8 bg-gold-gradient'
                        : 'w-2 bg-navy-900/20 hover:bg-navy-900/40',
                    )}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={next}
              aria-label={tCommon('next')}
              className="grid size-11 place-items-center rounded-full border border-sand-300
                         bg-sand-50 text-navy-700 transition-all duration-300 hover:-translate-y-0.5
                         hover:border-gold-500 hover:text-gold-700"
            >
              <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
