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
// How much the visitor has to scroll, in pixels, for the hero's parallax to
// play out fully. Deliberately a fixed distance rather than a fraction of the
// section's own height — see the note below on why that matters.
const PARALLAX_RANGE = 600;

export function Hero() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  /*
   * `useScroll` is called with no `target`, tracking the page's own scroll
   * position in pixels rather than this section's scroll-through progress.
   *
   * It was previously targeted at this section with a [0,1] fractional range
   * ('start start' → 'end start'), which reads naturally but has a sharp
   * edge: that range is `sectionHeight - viewportHeight`. Once the hero's
   * content is short enough to fit inside one screen — exactly what trimming
   * it for mobile did — that range collapses to zero, the fraction becomes
   * 0/0, and Framer Motion resolves the degenerate case by snapping straight
   * to the *end* of every transform. `copyOpacity` (built on the same
   * progress value) landed on 0 before a single frame rendered: the entire
   * headline, CTAs and stat counters were invisible from first paint, on any
   * viewport short enough for the trimmed hero to fit in it.
   *
   * Driving the same transforms off raw scroll pixels instead removes the
   * section's own height from the equation entirely, so this can't recur no
   * matter how the copy above is edited later.
   */
  const { scrollY } = useScroll();

  // Springs take the jitter out of trackpad scrolling.
  const smooth = useSpring(scrollY, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.5,
  });

  const photoY = useTransform(smooth, [0, PARALLAX_RANGE], ['0%', '18%']);
  const photoScale = useTransform(smooth, [0, PARALLAX_RANGE], [1, 1.14]);
  const sceneY = useTransform(smooth, [0, PARALLAX_RANGE], ['0%', '-10%']);
  const copyY = useTransform(smooth, [0, PARALLAX_RANGE], ['0%', '42%']);
  const copyOpacity = useTransform(smooth, [0, PARALLAX_RANGE * 0.65], [1, 0]);

  const stats = [
    { key: 'assets', value: 124, suffix: '+', decimals: 0 },
    { key: 'value', value: 2.4, suffix: 'B', decimals: 1 },
    { key: 'yield', value: 11.6, suffix: '%', decimals: 1 },
  ] as const;

  return (
    <section
      ref={sectionRef}
      // `dvh` (dynamic viewport height) rather than `svh`: on mobile, `svh` is
      // pinned to the *smallest* possible viewport (address bar fully
      // expanded). The moment the visitor scrolls and the browser chrome
      // collapses, the actual viewport grows past that fixed height, and the
      // next section's light background peeks in underneath as a stray white
      // strip. `dvh` tracks the real viewport live, so the section always
      // fills exactly what's visible.
      className="theme-dark relative isolate flex min-h-dvh flex-col justify-center
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
          skyline; it grows with the viewport so the two never collide.
          Deliberately `y` only, not `opacity`: this holds the page's most
          important content (headline, CTAs, stat counters), and a
          scroll-driven MotionValue can read as its resting value for a beat
          before Framer's scroll listener has actually measured anything —
          binding visibility to it risked a real flash of invisible content on
          first paint. A drift-on-scroll effect is worth the polish; hiding the
          hero's whole call to action behind one is not. */}
      <motion.div
        className="shell relative z-10 pb-48 pt-8 sm:pb-56 lg:pb-64"
        style={prefersReduced ? undefined : { y: copyY }}
      >
        <div className="max-w-3xl">
          {/* No eyebrow line here — "Real Investment & Smart Estates" already
              sits under the logo in the header, right above this. Repeating it
              here was redundant, and dropping it also buys the mobile layout
              back some vertical room for the construction scene below. */}

          {/* Deliberately one step down from display-xl: the hero's job is to
              show the city building itself, and the headline has to leave it
              room above the fold. */}
          <h1 className="text-display-lg font-extrabold text-sand-50">
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

          {/* Proof points.
              A fixed 3-column grid rather than flex-wrap: at narrow widths,
              flex-wrap orphaned the third stat onto its own left-aligned row
              instead of keeping all three level — a grid holds the trio
              together at every viewport. */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.56, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid grid-cols-3 gap-x-4 gap-y-5 border-t border-sand-50/10 pt-6 sm:gap-x-10"
          >
            {stats.map((stat) => (
              <div key={stat.key}>
                <dt className="order-2 mt-1 text-xs font-medium uppercase tracking-widest text-navy-300">
                  {t(`stats.${stat.key}`)}
                </dt>
                <dd className="order-1 font-display text-2xl font-bold text-sand-50 sm:text-3xl">
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

      {/* Scroll hint.
          Entrance only, via `animate` — no scroll-linked fade tied to
          `copyOpacity`. It's `position: absolute` inside the hero section, so
          it already scrolls away with everything else once the visitor moves
          past; layering a second, scroll-driven opacity on top only risked
          fighting the mount animation for the same property (see the note on
          the copy wrapper above for why that's a real, not theoretical, risk). */}
      <motion.a
        href="#featured"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
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
