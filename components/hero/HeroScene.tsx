'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';

/**
 * The hero construction scene.
 *
 * An SVG skyline that assembles itself: a house, an apartment tower, a luxury
 * villa, a gated compound and a commercial building each build piece by piece,
 * while a crane swings blocks into place, scaffolding drops away as each
 * structure tops out, and trees, streetlights and cars settle in around them.
 *
 * Two decisions worth knowing about:
 *
 *  1. The markup *is* the finished city. Every tween is a `.from()`, so the
 *     scene's resting state is the completed skyline. That means no-JS, a failed
 *     hydration, and `prefers-reduced-motion` all land on the polished scene
 *     rather than an empty lot — we simply never start the timeline.
 *
 *  2. Only `transform`, `opacity` and `fill` are animated. The first two are
 *     composited off the main thread; nothing here triggers layout, so the whole
 *     scene holds 60fps even with ~120 animated nodes.
 *
 * Every colour is a logo token: navy #0B1425/#142033, gold #BC8F43/#DFB764.
 */

// Palette — kept as constants so the SVG can't drift from the Tailwind theme.
const NAVY_950 = '#071023';
const NAVY_900 = '#0B1425';
const NAVY_800 = '#0F1C2F';
const NAVY_700 = '#142033';
const NAVY_600 = '#1E2C42';
const NAVY_500 = '#33425C';
const GOLD_700 = '#A06F1F';
const GOLD_500 = '#BC8F43';
const GOLD_300 = '#DFB764';

const GROUND = 470;

/**
 * Playback speed of the build.
 *
 * Applied with `timeScale` rather than by shortening each tween: it scales the
 * whole timeline — including every stagger and overlap — uniformly, so the
 * choreography keeps its shape and only the pace changes. Raise it to build
 * faster; 1 is the original tempo.
 */
const BUILD_SPEED = 1.6;

export function HeroScene({ className }: { className?: string }) {
  const t = useTranslations('hero');
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The markup already is the finished scene — leave it be.
    if (prefersReduced) return;

    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        // A beat of breathing room so the hero copy lands first.
        delay: 0.35,
        // Build the city, hold the finished skyline for a moment, then do it
        // all again. Every tween is a `.from()`, so restarting simply returns
        // the scene to bare ground and re-runs — no reset bookkeeping needed.
        repeat: -1,
        // Scaled by BUILD_SPEED along with everything else, so this is ~1.6s of
        // real time — long enough to read the finished skyline before it goes.
        repeatDelay: 2.6,
      });

      tl.timeScale(BUILD_SPEED);

      // ── Ground ───────────────────────────────────────────
      tl.from('.scene-ground', {
        scaleX: 0,
        transformOrigin: 'center center',
        duration: 0.9,
        ease: 'power2.inOut',
      }).from(
        '.scene-ground-line',
        // DrawSVG is a paid GSAP plugin; a scaleX wipe reads the same here and
        // keeps the project on the free tier.
        { scaleX: 0, opacity: 0, transformOrigin: 'center center', duration: 0.6 },
        '<0.2',
      );

      // ── Crane arrives first, as it would on a real site ──
      tl.from(
        '.crane-mast',
        { scaleY: 0, transformOrigin: 'center bottom', duration: 0.7 },
        '-=0.4',
      )
        .from('.crane-jib', { scaleX: 0, transformOrigin: 'left center', duration: 0.6 }, '-=0.25')
        .from('.crane-counter', { opacity: 0, scale: 0, transformOrigin: 'center center', duration: 0.35 }, '<0.2')
        .from('.crane-cable', { scaleY: 0, transformOrigin: 'top center', duration: 0.3 }, '-=0.2')
        .from('.crane-hook', { opacity: 0, duration: 0.2 }, '<');

      // The jib sweeps across the plot for the whole build, and keeps a slow
      // idle sway afterwards so the finished scene never feels frozen.
      tl.to('.crane-swing', {
        rotation: -14,
        transformOrigin: '350px 132px',
        duration: 5.2,
        ease: 'sine.inOut',
      }, 'build');

      // ── 1. Single-family house ───────────────────────────
      tl.from('.house-foundation', {
        scaleY: 0,
        transformOrigin: 'center bottom',
        duration: 0.45,
      }, 'build')
        .from('.house-scaffold', { opacity: 0, duration: 0.3 }, '<0.1')
        .from('.house-wall', {
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.1')
        // The roof is craned in — it drops from above and settles.
        .from('.house-roof', {
          y: -110,
          opacity: 0,
          duration: 0.7,
          ease: 'back.out(1.6)',
        }, '-=0.2')
        .from('.house-detail', {
          opacity: 0,
          scale: 0.6,
          transformOrigin: 'center center',
          duration: 0.4,
          stagger: 0.07,
        }, '-=0.3')
        // Scaffolding comes down once it's topped out.
        .to('.house-scaffold', { opacity: 0, y: 6, duration: 0.5 }, '-=0.1');

      // ── 2. Apartment tower — floors stack, then lights on ─
      tl.from('.tower-foundation', {
        scaleY: 0,
        transformOrigin: 'center bottom',
        duration: 0.4,
      }, 'build+=0.5')
        .from('.tower-scaffold', { opacity: 0, duration: 0.3 }, '<')
        .from('.tower-floor', {
          // Each slab is lifted in: it arrives from the crane side and drops.
          scaleY: 0,
          x: -26,
          opacity: 0,
          transformOrigin: 'center bottom',
          duration: 0.42,
          stagger: 0.13,
          ease: 'back.out(1.2)',
        }, '-=0.1')
        .from('.tower-crown', { y: -40, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.2')
        // Windows light up floor by floor, from the bottom up.
        .from('.tower-window', {
          fill: NAVY_600,
          duration: 0.35,
          stagger: { each: 0.045, from: 'end' },
        }, '-=0.35')
        .to('.tower-scaffold', { opacity: 0, y: 8, duration: 0.5 }, '-=0.4');

      // ── 3. Luxury villa — wide footprint, glass, pool ────
      tl.from('.villa-foundation', {
        scaleY: 0,
        transformOrigin: 'center bottom',
        duration: 0.45,
      }, 'build+=1.35')
        .from('.villa-wall', {
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.55,
          stagger: 0.1,
        }, '-=0.15')
        .from('.villa-roof', { scaleX: 0, transformOrigin: 'center center', duration: 0.5 }, '-=0.2')
        // The full-height glazing wipes up into place.
        .from('.villa-glass', {
          scaleY: 0,
          opacity: 0,
          transformOrigin: 'center bottom',
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out',
        }, '-=0.25')
        // Pool fills, garden grows.
        .from('.villa-pool', { scaleX: 0, transformOrigin: 'left center', duration: 0.55 }, '-=0.3')
        .from('.villa-garden', {
          opacity: 0,
          scale: 0,
          transformOrigin: 'center bottom',
          duration: 0.45,
          stagger: 0.06,
          ease: 'back.out(2.4)',
        }, '-=0.35');

      // ── 4. Gated compound — units, gate, roads, greenery ─
      tl.from('.compound-road', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.6,
        ease: 'power2.inOut',
      }, 'build+=2.1')
        .from('.compound-unit', {
          scaleY: 0,
          opacity: 0,
          transformOrigin: 'center bottom',
          duration: 0.45,
          // Units rise from the middle of the cluster outward.
          stagger: { each: 0.1, from: 'center' },
          ease: 'back.out(1.4)',
        }, '-=0.3')
        .from('.compound-roof', {
          y: -30,
          opacity: 0,
          duration: 0.4,
          stagger: { each: 0.09, from: 'center' },
          ease: 'back.out(1.8)',
        }, '-=0.35')
        .from('.compound-window', { opacity: 0, duration: 0.3, stagger: 0.04 }, '-=0.25')
        // The gate closes the compound off last.
        .from('.compound-gate-post', {
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.4,
          stagger: 0.08,
        }, '-=0.3')
        .from('.compound-gate-arch', { scaleX: 0, transformOrigin: 'center center', duration: 0.4 }, '-=0.1')
        .from('.compound-green', {
          opacity: 0,
          scale: 0,
          transformOrigin: 'center bottom',
          duration: 0.4,
          stagger: 0.05,
          ease: 'back.out(2.6)',
        }, '-=0.3');

      // ── 5. Commercial — curtain wall + sign ──────────────
      tl.from('.mall-foundation', {
        scaleY: 0,
        transformOrigin: 'center bottom',
        duration: 0.45,
      }, 'build+=2.85')
        .from('.mall-scaffold', { opacity: 0, duration: 0.3 }, '<')
        .from('.mall-core', {
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.2')
        .from('.mall-podium', { scaleX: 0, transformOrigin: 'center center', duration: 0.5 }, '-=0.4')
        // Curtain-wall panels clad the frame column by column.
        .from('.mall-glass', {
          opacity: 0,
          scaleY: 0,
          transformOrigin: 'center top',
          duration: 0.5,
          stagger: { each: 0.03, from: 'start' },
        }, '-=0.35')
        .from('.mall-mullion', { opacity: 0, duration: 0.4, stagger: 0.02 }, '-=0.4')
        .to('.mall-scaffold', { opacity: 0, y: 8, duration: 0.5 }, '-=0.2')
        // The sign flickers on, the way real neon does.
        .from('.mall-sign-plate', { scaleX: 0, transformOrigin: 'center center', duration: 0.4 }, '-=0.3')
        .from('.mall-sign-glow', { opacity: 0, duration: 0.15 }, '-=0.05')
        .to('.mall-sign-glow', { opacity: 0.25, duration: 0.08 })
        .to('.mall-sign-glow', { opacity: 1, duration: 0.1 })
        .to('.mall-sign-glow', { opacity: 0.4, duration: 0.06 })
        .to('.mall-sign-glow', { opacity: 1, duration: 0.25, ease: 'power2.out' });

      // ── Street life settles in last ──────────────────────
      tl.from('.prop-tree', {
        opacity: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.5,
        stagger: 0.06,
        ease: 'back.out(2.6)',
      }, 'build+=3.5')
        .from('.prop-lamp', {
          opacity: 0,
          scaleY: 0,
          transformOrigin: 'center bottom',
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.8)',
        }, '-=0.35')
        .from('.prop-lamp-glow', { opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.2')
        // Cars drive in from off-canvas.
        .from('.prop-car-start', { x: -180, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.5')
        .from('.prop-car-end', { x: 180, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.8')
        .from('.prop-bird', {
          opacity: 0,
          x: -30,
          duration: 0.6,
          stagger: 0.1,
        }, '-=0.6');

      /*
       * The finished city holds for `repeatDelay`, then rebuilds.
       *
       * There is deliberately no separate "idle life" phase here. Spawning
       * infinite tweens (crane sway, flickering windows, pulsing sign) at the
       * end of the timeline would re-spawn them on every single repeat, each
       * loop stacking another set of forever-running tweens on the same nodes
       * until they fight each other and leak. The rebuild is the life.
       */

      // An always-running loop has no business burning frames while it's
      // scrolled out of sight, so it only ticks while the scene is on screen.
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tl.play();
          else tl.pause();
        },
        { threshold: 0 },
      );
      observer.observe(root);
    }, root);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 1200 560"
      className={className}
      role="img"
      aria-label={t('sceneLabel')}
      /*
       * `slice`, not `meet`: the viewBox (1200×560) is wide and short. On a
       * tall narrow phone, "meet" shrinks the whole scene down to fit the
       * available width, which leaves it as a thin strip stranded at the
       * bottom of its container with empty space above — exactly the "barely
       * visible until you scroll" symptom. "slice" instead scales the scene up
       * to fill the container's full height (cropping the sides, the same way
       * object-cover crops a photo), so the skyline actually occupies the
       * space it's given on every screen size.
       */
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="rise-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_300} />
          <stop offset="48%" stopColor={GOLD_500} />
          <stop offset="100%" stopColor={GOLD_700} />
        </linearGradient>

        <linearGradient id="rise-glass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={GOLD_300} stopOpacity="0.5" />
          <stop offset="55%" stopColor={GOLD_500} stopOpacity="0.18" />
          <stop offset="100%" stopColor={NAVY_600} stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id="rise-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NAVY_800} />
          <stop offset="100%" stopColor={NAVY_950} />
        </linearGradient>

        <linearGradient id="rise-water" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD_500} stopOpacity="0.28" />
          <stop offset="100%" stopColor={GOLD_300} stopOpacity="0.5" />
        </linearGradient>

        <radialGradient id="rise-lamp-glow">
          <stop offset="0%" stopColor={GOLD_300} stopOpacity="0.85" />
          <stop offset="100%" stopColor={GOLD_300} stopOpacity="0" />
        </radialGradient>

        <filter id="rise-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ══ Ground ══════════════════════════════════════ */}
      <g>
        <rect
          className="scene-ground"
          x="0"
          y={GROUND}
          width="1200"
          height="90"
          fill="url(#rise-ground)"
        />
        <line
          className="scene-ground-line"
          x1="0"
          y1={GROUND}
          x2="1200"
          y2={GROUND}
          stroke={GOLD_500}
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
      </g>

      {/* ══ 1. Single-family house ══════════════════════ */}
      <g>
        <rect className="house-foundation" x="72" y={GROUND - 8} width="136" height="8" fill={NAVY_950} />
        <rect className="house-wall" x="82" y={GROUND - 82} width="116" height="74" fill={NAVY_700} />

        {/* Pitched roof, craned in */}
        <path
          className="house-roof"
          d="M70 388 L140 344 L210 388 Z"
          fill="url(#rise-gold)"
        />

        {/* Windows + door */}
        <rect className="house-detail" x="98" y={GROUND - 68} width="24" height="22" rx="2" fill={GOLD_300} />
        <rect className="house-detail" x="158" y={GROUND - 68} width="24" height="22" rx="2" fill={GOLD_300} />
        <rect className="house-detail" x="128" y={GROUND - 38} width="24" height="30" rx="2" fill={GOLD_500} />
        <rect className="house-detail" x="98" y={GROUND - 30} width="24" height="18" rx="2" fill={NAVY_500} />
        <rect className="house-detail" x="158" y={GROUND - 30} width="24" height="18" rx="2" fill={NAVY_500} />

        {/* Scaffolding — removed once the house tops out */}
        <g className="house-scaffold" stroke={GOLD_500} strokeOpacity="0.45" strokeWidth="1.5" fill="none">
          <rect x="74" y={GROUND - 92} width="132" height="92" />
          <line x1="74" y1={GROUND - 62} x2="206" y2={GROUND - 62} />
          <line x1="74" y1={GROUND - 32} x2="206" y2={GROUND - 32} />
          <line x1="118" y1={GROUND - 92} x2="118" y2={GROUND} />
          <line x1="162" y1={GROUND - 92} x2="162" y2={GROUND} />
        </g>
      </g>

      {/* ══ 2. Apartment tower ═════════════════════════ */}
      <g>
        <rect className="tower-foundation" x="238" y={GROUND - 8} width="112" height="8" fill={NAVY_950} />

        {/* Ten stacked floors, bottom-up */}
        {Array.from({ length: 10 }).map((_, index) => {
          const floorHeight = 28;
          const y = GROUND - 8 - (index + 1) * floorHeight;
          return (
            <g key={`tower-floor-${index}`}>
              <rect
                className="tower-floor"
                x="248"
                y={y}
                width="92"
                height={floorHeight}
                fill={index % 2 === 0 ? NAVY_700 : NAVY_800}
                stroke={NAVY_600}
                strokeWidth="0.75"
              />
              {/* Three windows per floor */}
              {[0, 1, 2].map((column) => (
                <rect
                  key={`tower-window-${index}-${column}`}
                  className="tower-window"
                  x={258 + column * 26}
                  y={y + 7}
                  width="16"
                  height="14"
                  rx="1.5"
                  fill={GOLD_300}
                />
              ))}
            </g>
          );
        })}

        <rect className="tower-crown" x="256" y={GROUND - 300} width="76" height="10" fill="url(#rise-gold)" />
        <rect className="tower-crown" x="288" y={GROUND - 330} width="12" height="30" fill={GOLD_700} />

        <g className="tower-scaffold" stroke={GOLD_500} strokeOpacity="0.4" strokeWidth="1.5" fill="none">
          <rect x="240" y={GROUND - 292} width="108" height="292" />
          <line x1="294" y1={GROUND - 292} x2="294" y2={GROUND} />
          {[0, 1, 2, 3, 4].map((index) => (
            <line
              key={`tower-scaffold-${index}`}
              x1="240"
              y1={GROUND - 56 * (index + 1)}
              x2="348"
              y2={GROUND - 56 * (index + 1)}
            />
          ))}
        </g>
      </g>

      {/* ══ Crane ══════════════════════════════════════ */}
      <g>
        {/* Lattice mast */}
        <g className="crane-mast">
          <rect x="344" y="132" width="12" height={GROUND - 132} fill={GOLD_700} />
          {Array.from({ length: 10 }).map((_, index) => (
            <line
              key={`crane-rung-${index}`}
              x1="344"
              y1={160 + index * 32}
              x2="356"
              y2={176 + index * 32}
              stroke={GOLD_500}
              strokeWidth="1.5"
            />
          ))}
          <rect x="332" y={GROUND - 12} width="36" height="12" fill={NAVY_950} />
        </g>

        {/* Jib + counterweight sweep together around the mast head */}
        <g className="crane-swing">
          <g className="crane-jib">
            <rect x="350" y="128" width="180" height="7" fill={GOLD_500} />
            <path
              d="M350 128 L440 108 L530 128 Z"
              fill="none"
              stroke={GOLD_500}
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          </g>
          <g className="crane-counter">
            <rect x="288" y="126" width="62" height="7" fill={GOLD_700} />
            <rect x="286" y="120" width="22" height="20" rx="2" fill={NAVY_800} stroke={GOLD_700} strokeWidth="1.5" />
          </g>
          {/* Cable + a slab hanging from the hook */}
          <line className="crane-cable" x1="470" y1="135" x2="470" y2="196" stroke={GOLD_300} strokeWidth="1.25" />
          <g className="crane-hook">
            <rect x="452" y="196" width="36" height="11" rx="2" fill={NAVY_600} stroke={GOLD_500} strokeWidth="1.25" />
          </g>
        </g>

        <rect x="336" y="118" width="28" height="18" rx="2" fill={NAVY_700} stroke={GOLD_500} strokeWidth="1.25" />
      </g>

      {/* ══ 3. Luxury villa ════════════════════════════ */}
      <g>
        <rect className="villa-foundation" x="392" y={GROUND - 6} width="196" height="6" fill={NAVY_950} />

        {/* Two-storey mass, wider than the house */}
        <rect className="villa-wall" x="402" y={GROUND - 96} width="112" height="90" fill={NAVY_700} />
        <rect className="villa-wall" x="514" y={GROUND - 62} width="66" height="56" fill={NAVY_800} />

        <rect className="villa-roof" x="394" y={GROUND - 104} width="128" height="9" fill="url(#rise-gold)" />
        <rect className="villa-roof" x="508" y={GROUND - 70} width="80" height="8" fill={GOLD_700} />

        {/* Large glass frontage */}
        <rect className="villa-glass" x="412" y={GROUND - 88} width="42" height="46" rx="2" fill="url(#rise-glass)" />
        <rect className="villa-glass" x="460" y={GROUND - 88} width="42" height="46" rx="2" fill="url(#rise-glass)" />
        <rect className="villa-glass" x="412" y={GROUND - 36} width="90" height="30" rx="2" fill="url(#rise-glass)" />
        <rect className="villa-glass" x="524" y={GROUND - 52} width="46" height="46" rx="2" fill="url(#rise-glass)" />

        {/* Pool + garden */}
        <rect className="villa-pool" x="398" y={GROUND + 12} width="104" height="16" rx="8" fill="url(#rise-water)" />
        {[
          { x: 520, r: 9 },
          { x: 545, r: 7 },
          { x: 568, r: 10 },
        ].map((tree) => (
          <g className="villa-garden" key={`villa-tree-${tree.x}`}>
            <rect x={tree.x - 1.5} y={GROUND + 8} width="3" height="12" fill={GOLD_700} />
            <circle cx={tree.x} cy={GROUND + 6} r={tree.r} fill={GOLD_500} fillOpacity="0.55" />
          </g>
        ))}
      </g>

      {/* ══ 4. Gated compound ══════════════════════════ */}
      <g>
        {/* Internal road */}
        <rect className="compound-road" x="608" y={GROUND + 10} width="224" height="10" rx="5" fill={NAVY_700} />
        <g className="compound-road">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <rect
              key={`compound-dash-${index}`}
              x={624 + index * 36}
              y={GROUND + 14}
              width="16"
              height="2"
              fill={GOLD_500}
              fillOpacity="0.5"
            />
          ))}
        </g>

        {/* Four townhouse units in a terrace */}
        {[0, 1, 2, 3].map((index) => {
          const x = 660 + index * 44;
          return (
            <g key={`compound-unit-${index}`}>
              <rect
                className="compound-unit"
                x={x}
                y={GROUND - 62}
                width="38"
                height="62"
                fill={index % 2 === 0 ? NAVY_700 : NAVY_800}
                stroke={NAVY_600}
                strokeWidth="0.75"
              />
              <path
                className="compound-roof"
                d={`M${x - 3} ${GROUND - 62} L${x + 19} ${GROUND - 80} L${x + 41} ${GROUND - 62} Z`}
                fill={index % 2 === 0 ? GOLD_500 : GOLD_700}
              />
              <rect className="compound-window" x={x + 7} y={GROUND - 52} width="10" height="10" rx="1" fill={GOLD_300} />
              <rect className="compound-window" x={x + 22} y={GROUND - 52} width="10" height="10" rx="1" fill={GOLD_300} />
              <rect className="compound-window" x={x + 14} y={GROUND - 26} width="11" height="26" rx="1" fill={NAVY_500} />
            </g>
          );
        })}

        {/* The gate */}
        <rect className="compound-gate-post" x="612" y={GROUND - 56} width="10" height="56" fill={GOLD_700} />
        <rect className="compound-gate-post" x="640" y={GROUND - 56} width="10" height="56" fill={GOLD_700} />
        <rect className="compound-gate-arch" x="606" y={GROUND - 66} width="50" height="10" rx="3" fill="url(#rise-gold)" />
        <rect className="compound-gate-arch" x="622" y={GROUND - 34} width="18" height="34" fill={NAVY_600} />

        {/* Greenery around the units */}
        {[840, 856, 648, 632].map((x, index) => (
          <g className="compound-green" key={`compound-tree-${x}`}>
            <rect x={x - 1.5} y={GROUND - 14} width="3" height="14" fill={GOLD_700} />
            <circle cx={x} cy={GROUND - 18} r={index % 2 === 0 ? 9 : 7} fill={GOLD_500} fillOpacity="0.5" />
          </g>
        ))}
        <rect className="compound-green" x="656" y={GROUND - 3} width="180" height="3" rx="1.5" fill={GOLD_500} fillOpacity="0.35" />
      </g>

      {/* ══ 5. Commercial building ═════════════════════ */}
      <g>
        <rect className="mall-foundation" x="882" y={GROUND - 8} width="256" height="8" fill={NAVY_950} />

        {/* Office tower core */}
        <rect className="mall-core" x="940" y={GROUND - 262} width="140" height="254" fill={NAVY_800} />

        {/* Curtain-wall glazing */}
        {Array.from({ length: 5 }).map((_, column) =>
          Array.from({ length: 8 }).map((__, row) => (
            <rect
              key={`mall-glass-${column}-${row}`}
              className="mall-glass"
              x={948 + column * 26}
              y={GROUND - 254 + row * 30}
              width="22"
              height="26"
              rx="1.5"
              fill="url(#rise-glass)"
            />
          )),
        )}
        {/* Mullions */}
        {Array.from({ length: 4 }).map((_, index) => (
          <line
            key={`mall-mullion-v-${index}`}
            className="mall-mullion"
            x1={972 + index * 26}
            y1={GROUND - 258}
            x2={972 + index * 26}
            y2={GROUND - 10}
            stroke={GOLD_500}
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        ))}

        {/* Retail podium */}
        <rect className="mall-podium" x="890" y={GROUND - 62} width="240" height="54" fill={NAVY_700} />
        <rect className="mall-podium" x="890" y={GROUND - 66} width="240" height="6" fill={GOLD_700} />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <rect
            key={`mall-podium-glass-${index}`}
            className="mall-glass"
            x={900 + index * 38}
            y={GROUND - 52}
            width="28"
            height="44"
            rx="2"
            fill="url(#rise-glass)"
          />
        ))}

        {/* Scaffolding — struck once the curtain wall is clad */}
        <g className="mall-scaffold" stroke={GOLD_500} strokeOpacity="0.4" strokeWidth="1.5" fill="none">
          <rect x="934" y={GROUND - 268} width="152" height="268" />
          <line x1="1010" y1={GROUND - 268} x2="1010" y2={GROUND} />
          {[0, 1, 2, 3, 4].map((index) => (
            <line
              key={`mall-scaffold-${index}`}
              x1="934"
              y1={GROUND - 52 * (index + 1)}
              x2="1086"
              y2={GROUND - 52 * (index + 1)}
            />
          ))}
        </g>

        {/* The sign that lights up */}
        <rect className="mall-sign-plate" x="964" y={GROUND - 292} width="92" height="26" rx="4" fill={NAVY_950} stroke={GOLD_700} strokeWidth="1.25" />
        <g className="mall-sign-glow" filter="url(#rise-soft-glow)">
          <rect x="972" y={GROUND - 285} width="76" height="12" rx="2" fill="url(#rise-gold)" />
        </g>
        <rect className="mall-sign-plate" x="1004" y={GROUND - 266} width="12" height="6" fill={GOLD_700} />
      </g>

      {/* ══ Street life ════════════════════════════════ */}
      <g>
        {/* Trees */}
        {[
          { x: 232, r: 11 },
          { x: 372, r: 9 },
          { x: 596, r: 12 },
          { x: 870, r: 10 },
          { x: 1156, r: 12 },
          { x: 44, r: 10 },
        ].map((tree) => (
          <g className="prop-tree" key={`tree-${tree.x}`}>
            <rect x={tree.x - 2} y={GROUND - 16} width="4" height="16" fill={GOLD_700} />
            <circle cx={tree.x} cy={GROUND - 22} r={tree.r} fill={GOLD_500} fillOpacity="0.45" />
            <circle cx={tree.x - tree.r * 0.4} cy={GROUND - 16} r={tree.r * 0.6} fill={GOLD_500} fillOpacity="0.35" />
          </g>
        ))}

        {/* Streetlights */}
        {[168, 428, 760, 1096].map((x) => (
          <g key={`lamp-${x}`}>
            <g className="prop-lamp">
              <rect x={x - 1.5} y={GROUND - 46} width="3" height="46" fill={NAVY_500} />
              <path
                d={`M${x} ${GROUND - 46} q0 -10 12 -10`}
                fill="none"
                stroke={NAVY_500}
                strokeWidth="3"
              />
            </g>
            <circle
              className="prop-lamp-glow"
              cx={x + 12}
              cy={GROUND - 55}
              r="14"
              fill="url(#rise-lamp-glow)"
            />
            <circle className="prop-lamp-glow" cx={x + 12} cy={GROUND - 56} r="3" fill={GOLD_300} />
          </g>
        ))}

        {/* Cars on the ground line */}
        <g className="prop-car-start">
          <rect x="470" y={GROUND + 32} width="42" height="12" rx="4" fill={GOLD_700} />
          <path d={`M478 ${GROUND + 32} l6 -8 h16 l6 8 z`} fill={GOLD_500} />
          <circle cx="480" cy={GROUND + 45} r="3.5" fill={NAVY_950} />
          <circle cx="502" cy={GROUND + 45} r="3.5" fill={NAVY_950} />
        </g>
        <g className="prop-car-end">
          <rect x="880" y={GROUND + 32} width="48" height="12" rx="4" fill={NAVY_600} />
          <path d={`M888 ${GROUND + 32} l6 -8 h20 l6 8 z`} fill={NAVY_500} />
          <circle cx="892" cy={GROUND + 45} r="3.5" fill={NAVY_950} />
          <circle cx="918" cy={GROUND + 45} r="3.5" fill={NAVY_950} />
          <rect x="876" y={GROUND + 36} width="4" height="3" rx="1.5" fill={GOLD_300} />
        </g>

        {/* Birds, for depth */}
        {[
          { x: 150, y: 120 },
          { x: 178, y: 138 },
          { x: 640, y: 96 },
        ].map((bird) => (
          <path
            className="prop-bird"
            key={`bird-${bird.x}`}
            d={`M${bird.x} ${bird.y} q6 -5 12 0 q6 -5 12 0`}
            fill="none"
            stroke={GOLD_500}
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
