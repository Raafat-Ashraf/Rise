'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface CounterProps {
  value: number;
  /** Decimal places to hold while counting — 2.4 needs 1, 124 needs 0. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts from zero to `value` when scrolled into view.
 *
 * The final value is rendered server-side inside the element, so it is correct
 * with JS disabled and is what a crawler reads. GSAP resets it to zero only
 * once it has taken over. Digits are Latin in both locales — the design keeps
 * numerals consistent across the site (see `.numeric` in globals.css).
 */
export function Counter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const locale = useLocale() as Locale;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    // Leave the server-rendered final value untouched.
    if (prefersReduced) return;

    const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      numberingSystem: 'latn',
    });

    const counter = { current: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        current: value,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          once: true,
        },
        onUpdate: () => {
          element.textContent = `${prefix}${formatter.format(counter.current)}${suffix}`;
        },
        onStart: () => {
          element.textContent = `${prefix}${formatter.format(0)}${suffix}`;
        },
      });
    }, element);

    return () => ctx.revert();
  }, [value, decimals, prefix, suffix, duration, locale]);

  const initial = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: 'latn',
  }).format(value);

  return (
    <span ref={ref} className={cn('numeric inline-block tabular-nums', className)}>
      {`${prefix}${initial}${suffix}`}
    </span>
  );
}
