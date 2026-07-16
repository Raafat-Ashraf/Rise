'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { Counter } from '@/components/ui/Counter';
import { HeroScene } from './HeroScene';

/**
 * Homepage hero.
 *
 * Three depth planes drift at different rates as the page scrolls — photograph,
 * construction scene, then copy — which reads as parallax without any of it
 * leaving the GPU: every layer moves via `transform` only.
 */
export function Hero() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Springs take the jitter out of trackpad scrolling.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const photoY = useTransform(smooth, [0, 1], ['0%', '18%']);
  const photoScale = useTransform(smooth, [0, 1], [1, 1.14]);
  const sceneY = useTransform(smooth, [0, 1], ['0%', '-10%']);
  const copyY = useTransform(smooth, [0, 1], ['0%', '42%']);
  const copyOpacity = useTransform(smooth, [0, 0.65], [1, 0]);

  const stats = [
    { key: 'assets', value: 124, suffix: '+', decimals: 0 },
    { key: 'value', value: 2.4, suffix: 'B', decimals: 1 },
    { key: 'yield', value: 11.6, suffix: '%', decimals: 1 },
  ] as const;

  return (
    <section
      ref={sectionRef}
      className="theme-dark relative isolate flex min-h-[100svh] flex-col justify-center
                 overflow-hidden bg-navy-depth pt-[var(--header-height)]"
    >
      {/* Plane 1 — photography, deepest and slowest */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={prefersReduced ? undefined : { y: photoY, scale: photoScale }}
        aria-hidden="true"
      >
        <Image
          src="/images/properties/hero-city.jpg"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover opacity-25"
        />
        {/* Sinks the photo into the navy so the scene reads on top of it */}
        <div className="absolute inset-0 bg-navy-depth/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/85" />
      </motion.div>

      {/* Plane 2 — the construction scene.
          Given the lower ~70% of the hero so the city is building on first
          paint, not something you have to scroll to find. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[68%] sm:h-[72%]"
        style={prefersReduced ? undefined : { y: sceneY }}
      >
        <HeroScene className="size-full" />
        {/* Fades the skyline's feet into the section below */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950 to-transparent"
        />
      </motion.div>

      {/* Plane 3 — copy. The bottom padding is what holds it clear of the
          skyline; it grows with the viewport so the two never collide. */}
      <motion.div
        className="shell relative z-10 pb-48 pt-8 sm:pb-56 lg:pb-64"
        style={prefersReduced ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 text-label font-semibold uppercase text-gold-400"
          >
            <span aria-hidden="true" className="h-px w-10 bg-gold-500" />
            {t('eyebrow')}
          </motion.p>

          {/* Deliberately one step down from display-xl: the hero's job is to
              show the city building itself, and the headline has to leave it
              room above the fold. */}
          <h1 className="mt-5 text-display-lg font-extrabold text-sand-50">
            {[t('titleLine1'), t('titleLine2')].map((line, index) => (
              // Each line is masked and slides up from below, the way a
              // curtain reveal works — hence the overflow-hidden wrapper.
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 0.95,
                    delay: 0.12 + index * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {index === 1 ? (
                    <span className="text-gold-gradient">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={10}>
              <ButtonLink href="/properties" size="lg">
                {t('ctaPrimary')}
                <ArrowUpRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
              </ButtonLink>
            </Magnetic>

            <Magnetic strength={8}>
              <ButtonLink href="/contact" size="lg" variant="onDark">
                {t('ctaSecondary')}
              </ButtonLink>
            </Magnetic>
          </motion.div>

          {/* Proof points */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.56, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-sand-50/10 pt-6"
          >
            {stats.map((stat) => (
              <div key={stat.key}>
                <dt className="order-2 mt-1 text-xs font-medium uppercase tracking-widest text-navy-300">
                  {t(`stats.${stat.key}`)}
                </dt>
                <dd className="order-1 font-display text-3xl font-bold text-sand-50">
                  <Counter
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#featured"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        style={prefersReduced ? undefined : { opacity: copyOpacity }}
        className="group absolute inset-x-0 bottom-7 z-20 mx-auto flex w-fit flex-col items-center gap-2
                   rounded-full px-4 py-2 text-navy-300 transition-colors hover:text-gold-400
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em]">
          {t('scrollHint')}
        </span>
        <ArrowDown
          className="size-4 animate-float transition-transform group-hover:translate-y-1"
          aria-hidden="true"
        />
      </motion.a>
    </section>
  );
}
