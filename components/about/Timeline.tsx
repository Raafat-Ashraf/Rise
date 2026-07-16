'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const years = ['2009', '2013', '2016', '2019', '2022', '2025'] as const;

/**
 * Company timeline.
 *
 * The gold spine draws itself as the section scrolls (scaleY scrub), and each
 * milestone fades in as its marker is reached. `scaleY` on the spine rather
 * than a height animation keeps it off the layout path.
 */
export function Timeline() {
  const t = useTranslations('about.timeline');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-spine',
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 70%',
            end: 'bottom 75%',
            scrub: 0.6,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('.timeline-marker').forEach((marker) => {
        gsap.from(marker, {
          scale: 0,
          duration: 0.5,
          ease: 'back.out(2.4)',
          scrollTrigger: { trigger: marker, start: 'top 85%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative mt-14">
      {/* The spine — logical inset keeps it on the correct side under RTL */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 start-[1.4375rem] w-0.5 bg-navy-600/40 md:start-1/2 md:-ms-px"
      />
      <div
        aria-hidden="true"
        className="timeline-spine absolute inset-y-0 start-[1.4375rem] w-0.5 origin-top
                   bg-gold-gradient md:start-1/2 md:-ms-px"
      />

      <ol className="space-y-12">
        {years.map((year, index) => (
          <li
            key={year}
            className="timeline-item relative ps-16 md:ps-0"
          >
            <div
              className={`md:grid md:grid-cols-2 md:gap-12 ${
                // Alternate sides on desktop.
                index % 2 === 0 ? '' : 'md:[&>*:first-child]:col-start-2'
              }`}
            >
              <div
                className={
                  index % 2 === 0
                    ? 'md:pe-12 md:text-end'
                    : 'md:ps-12 md:col-start-2'
                }
              >
                <p className="numeric font-display text-3xl font-extrabold text-gold-gradient">
                  {t(`items.${year}.year`)}
                </p>
                <h3 className="mt-2 text-xl font-bold text-sand-50">
                  {t(`items.${year}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-300">
                  {t(`items.${year}.body`)}
                </p>
              </div>
            </div>

            {/* Marker */}
            <span
              aria-hidden="true"
              className="timeline-marker absolute start-[1.4375rem] top-2 grid size-3.5 -translate-x-1/2
                         place-items-center rounded-full bg-gold-500 shadow-[0_0_0_4px_rgb(11_20_37)]
                         rtl:translate-x-1/2 md:start-1/2"
            >
              <span className="size-1.5 rounded-full bg-navy-950" />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
