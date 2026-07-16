'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * The scroll-driven city.
 *
 * Where the hero scene plays on a timer, this one is bound to the scrollbar:
 * scrubbing down lays foundations, stacks floors, courses bricks and drops
 * roofs; scrubbing back up un-builds it. Each structure gets its own
 * ScrollTrigger keyed to its own x-position, so it starts building as *it*
 * enters the viewport rather than all at once.
 *
 * Same contract as the hero: the markup is the finished city and every tween is
 * a `.from()`, so reduced-motion and no-JS visitors get the completed skyline.
 */

const NAVY_950 = '#071023';
const NAVY_800 = '#0F1C2F';
const NAVY_700 = '#142033';
const NAVY_600 = '#1E2C42';
const NAVY_500 = '#33425C';
const GOLD_700 = '#A06F1F';
const GOLD_500 = '#BC8F43';
const GOLD_300 = '#DFB764';

const GROUND = 360;

export function ScrollCity({ className }: { className?: string }) {
  const t = useTranslations('home.stats');
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      /**
       * Builds one structure on its own scrub trigger.
       * `horizontalBias` (0–1) shifts the trigger window so structures on the
       * right start slightly later, which reads as the city growing rightward.
       */
      const buildStructure = (selector: string, horizontalBias: number) => {
        const group = root.querySelector(selector);
        if (!group) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            // Scrub over the section's pass through the viewport, offset per
            // structure so they don't all fire on the same frame.
            start: `top ${88 - horizontalBias * 8}%`,
            end: `bottom ${62 - horizontalBias * 10}%`,
            scrub: 0.8,
          },
          defaults: { ease: 'power2.out' },
        });

        tl.from(`${selector} .sc-foundation`, {
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.5,
        })
          // Brick-by-brick: each course wipes in from the start edge.
          .from(`${selector} .sc-brick`, {
            scaleX: 0,
            opacity: 0,
            transformOrigin: 'left center',
            duration: 0.4,
            stagger: { each: 0.05, from: 'start' },
          }, '-=0.2')
          // Floor-by-floor for the taller blocks.
          .from(`${selector} .sc-floor`, {
            scaleY: 0,
            opacity: 0,
            transformOrigin: 'center bottom',
            duration: 0.5,
            stagger: 0.14,
            ease: 'back.out(1.2)',
          }, '-=0.3')
          .from(`${selector} .sc-roof`, {
            y: -40,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.6)',
          }, '-=0.25')
          .from(`${selector} .sc-window`, {
            fill: NAVY_600,
            opacity: 0,
            duration: 0.35,
            stagger: { each: 0.04, from: 'random' },
          }, '-=0.3')
          .from(`${selector} .sc-detail`, {
            opacity: 0,
            scale: 0,
            transformOrigin: 'center bottom',
            duration: 0.4,
            stagger: 0.05,
            ease: 'back.out(2.4)',
          }, '-=0.25');
      };

      buildStructure('.sc-house-a', 0);
      buildStructure('.sc-block-a', 0.25);
      buildStructure('.sc-villa-a', 0.45);
      buildStructure('.sc-block-b', 0.7);
      buildStructure('.sc-house-b', 0.9);

      // The ground line draws across the whole section as it passes.
      gsap.from('.sc-ground-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 92%',
          end: 'bottom 70%',
          scrub: 0.6,
        },
      });

      // Slow drift on the far skyline for depth.
      gsap.to('.sc-skyline', {
        xPercent: -4,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  /** A stack of brick courses for a wall. */
  const bricks = (x: number, width: number, height: number, courses: number) =>
    Array.from({ length: courses }).map((_, index) => {
      const courseHeight = height / courses;
      return (
        <rect
          key={`brick-${x}-${index}`}
          className="sc-brick"
          x={x}
          y={GROUND - height + index * courseHeight}
          width={width}
          height={courseHeight - 1}
          fill={index % 2 === 0 ? NAVY_700 : NAVY_800}
        />
      );
    });

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 1200 420"
      className={className}
      role="img"
      aria-label={t('description')}
      // See the matching comment in HeroScene.tsx — "meet" keeps every
      // structure in frame on a narrow viewport instead of cropping the
      // outer ones off the sides.
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="sc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_300} />
          <stop offset="100%" stopColor={GOLD_700} />
        </linearGradient>
        <linearGradient id="sc-glass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={GOLD_300} stopOpacity="0.45" />
          <stop offset="100%" stopColor={NAVY_600} stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Far skyline — parallax backdrop */}
      <g className="sc-skyline" opacity="0.28">
        {[
          { x: 60, w: 40, h: 120 },
          { x: 120, w: 30, h: 78 },
          { x: 300, w: 46, h: 150 },
          { x: 500, w: 34, h: 96 },
          { x: 700, w: 42, h: 132 },
          { x: 900, w: 30, h: 88 },
          { x: 1060, w: 48, h: 160 },
          { x: 1140, w: 34, h: 104 },
        ].map((building) => (
          <rect
            key={`skyline-${building.x}`}
            x={building.x}
            y={GROUND - building.h}
            width={building.w}
            height={building.h}
            fill={NAVY_600}
          />
        ))}
      </g>

      {/* ── House A ─────────────────────────────────── */}
      <g className="sc-house-a">
        <rect className="sc-foundation" x="72" y={GROUND - 6} width="130" height="6" fill={NAVY_950} />
        {bricks(82, 110, 76, 6)}
        <path className="sc-roof" d="M70 284 L137 246 L204 284 Z" fill="url(#sc-gold)" />
        <rect className="sc-window" x="96" y={GROUND - 64} width="22" height="20" rx="2" fill={GOLD_300} />
        <rect className="sc-window" x="152" y={GROUND - 64} width="22" height="20" rx="2" fill={GOLD_300} />
        <rect className="sc-window" x="124" y={GROUND - 32} width="22" height="32" rx="2" fill={GOLD_500} />
        <g className="sc-detail">
          <rect x="214" y={GROUND - 14} width="3" height="14" fill={GOLD_700} />
          <circle cx="215.5" cy={GROUND - 20} r="9" fill={GOLD_500} fillOpacity="0.45" />
        </g>
      </g>

      {/* ── Apartment block A — floor by floor ──────── */}
      <g className="sc-block-a">
        <rect className="sc-foundation" x="272" y={GROUND - 6} width="104" height="6" fill={NAVY_950} />
        {Array.from({ length: 7 }).map((_, index) => {
          const h = 30;
          const y = GROUND - 6 - (index + 1) * h;
          return (
            <g key={`block-a-floor-${index}`}>
              <rect
                className="sc-floor"
                x="282"
                y={y}
                width="84"
                height={h}
                fill={index % 2 === 0 ? NAVY_700 : NAVY_800}
                stroke={NAVY_600}
                strokeWidth="0.75"
              />
              {[0, 1, 2].map((column) => (
                <rect
                  key={`block-a-window-${index}-${column}`}
                  className="sc-window"
                  x={291 + column * 24}
                  y={y + 8}
                  width="15"
                  height="13"
                  rx="1.5"
                  fill={GOLD_300}
                />
              ))}
            </g>
          );
        })}
        <rect className="sc-roof" x="278" y={GROUND - 224} width="92" height="8" fill="url(#sc-gold)" />
      </g>

      {/* ── Villa A ─────────────────────────────────── */}
      <g className="sc-villa-a">
        <rect className="sc-foundation" x="452" y={GROUND - 6} width="184" height="6" fill={NAVY_950} />
        {bricks(462, 100, 82, 5)}
        <rect className="sc-floor" x="562" y={GROUND - 54} width="64" height="48" fill={NAVY_800} />
        <rect className="sc-roof" x="454" y={GROUND - 90} width="116" height="8" fill="url(#sc-gold)" />
        <rect className="sc-roof" x="556" y={GROUND - 62} width="78" height="8" fill={GOLD_700} />
        <rect className="sc-window" x="472" y={GROUND - 74} width="38" height="40" rx="2" fill="url(#sc-glass)" />
        <rect className="sc-window" x="516" y={GROUND - 74} width="38" height="40" rx="2" fill="url(#sc-glass)" />
        <rect className="sc-window" x="472" y={GROUND - 28} width="82" height="22" rx="2" fill="url(#sc-glass)" />
        <rect className="sc-window" x="574" y={GROUND - 44} width="42" height="38" rx="2" fill="url(#sc-glass)" />
        <g className="sc-detail">
          <rect x="452" y={GROUND + 8} width="92" height="12" rx="6" fill={GOLD_500} fillOpacity="0.4" />
        </g>
        {[648, 668].map((x, index) => (
          <g className="sc-detail" key={`villa-tree-${x}`}>
            <rect x={x - 1.5} y={GROUND - 12} width="3" height="12" fill={GOLD_700} />
            <circle cx={x} cy={GROUND - 17} r={index === 0 ? 9 : 7} fill={GOLD_500} fillOpacity="0.45" />
          </g>
        ))}
      </g>

      {/* ── Apartment block B — the tall one ────────── */}
      <g className="sc-block-b">
        <rect className="sc-foundation" x="740" y={GROUND - 6} width="128" height="6" fill={NAVY_950} />
        {Array.from({ length: 10 }).map((_, index) => {
          const h = 28;
          const y = GROUND - 6 - (index + 1) * h;
          return (
            <g key={`block-b-floor-${index}`}>
              <rect
                className="sc-floor"
                x="750"
                y={y}
                width="108"
                height={h}
                fill={index % 2 === 0 ? NAVY_800 : NAVY_700}
                stroke={NAVY_600}
                strokeWidth="0.75"
              />
              {[0, 1, 2, 3].map((column) => (
                <rect
                  key={`block-b-window-${index}-${column}`}
                  className="sc-window"
                  x={758 + column * 25}
                  y={y + 7}
                  width="16"
                  height="13"
                  rx="1.5"
                  fill={GOLD_300}
                />
              ))}
            </g>
          );
        })}
        <rect className="sc-roof" x="746" y={GROUND - 294} width="116" height="8" fill="url(#sc-gold)" />
        <rect className="sc-roof" x="798" y={GROUND - 322} width="10" height="28" fill={GOLD_700} />
      </g>

      {/* ── House B ─────────────────────────────────── */}
      <g className="sc-house-b">
        <rect className="sc-foundation" x="962" y={GROUND - 6} width="140" height="6" fill={NAVY_950} />
        {bricks(972, 120, 70, 5)}
        <path className="sc-roof" d="M960 290 L1032 252 L1104 290 Z" fill="url(#sc-gold)" />
        <rect className="sc-window" x="988" y={GROUND - 58} width="24" height="20" rx="2" fill={GOLD_300} />
        <rect className="sc-window" x="1052" y={GROUND - 58} width="24" height="20" rx="2" fill={GOLD_300} />
        <rect className="sc-window" x="1020" y={GROUND - 30} width="24" height="30" rx="2" fill={GOLD_500} />
        <g className="sc-detail">
          <rect x="1126" y={GROUND - 16} width="3" height="16" fill={GOLD_700} />
          <circle cx="1127.5" cy={GROUND - 23} r="11" fill={GOLD_500} fillOpacity="0.45" />
        </g>
        <g className="sc-detail">
          <rect x="936" y={GROUND - 40} width="3" height="40" fill={NAVY_500} />
          <circle cx="944" cy={GROUND - 46} r="3" fill={GOLD_300} />
        </g>
      </g>

      {/* Ground */}
      <line
        className="sc-ground-line"
        x1="0"
        y1={GROUND}
        x2="1200"
        y2={GROUND}
        stroke={GOLD_500}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
    </svg>
  );
}
