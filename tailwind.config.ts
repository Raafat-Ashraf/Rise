import type { Config } from 'tailwindcss';

/**
 * Amjad design tokens.
 *
 * Every colour below is derived from `logo.png` by sampling its opaque pixels:
 *   gold  — mean of 49,087 saturated px in the "R" monogram + arc  -> #BC8F43
 *           gradient endpoints sampled at the 10th/90th lightness percentile
 *           -> #A06F1F (shade) and #DFB764 (highlight)
 *   navy  — mean of 55,156 dark-blue px in the towers + RISE wordmark -> #0B1425
 *           densest exact colour in that cluster -> #071023
 *   sand  — the logo's card background -> #FEFEFE, warmed toward the gold hue
 *
 * The rest of each ramp is interpolated from those anchors. No colour outside
 * this palette is used anywhere in the site.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './sanity/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EF',
          100: '#F5EBD7',
          200: '#EBD7AE',
          300: '#DFB764', // logo gradient highlight
          400: '#CDA254',
          500: '#BC8F43', // PRIMARY — logo gold mean
          600: '#A87C36',
          700: '#A06F1F', // logo gradient shade
          800: '#7D571A',
          900: '#5A3F13',
          950: '#33240B',
        },
        navy: {
          50: '#F2F4F7',
          100: '#E2E6EC',
          200: '#C3CAD6',
          300: '#94A0B4',
          400: '#5C6B85',
          500: '#33425C',
          600: '#1E2C42',
          700: '#142033',
          800: '#0F1C2F', // logo navy, 90th lightness pct
          900: '#0B1425', // DARK NEUTRAL — logo navy mean
          950: '#071023', // logo navy core
        },
        sand: {
          50: '#FEFEFE', // LIGHT NEUTRAL — logo background
          100: '#FAF8F4',
          200: '#F4F1EA',
          300: '#E9E3D7',
          400: '#D9D1BF',
        },
        // Semantic aliases -> CSS variables (see app/globals.css)
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        // Latin display + UI
        sans: ['var(--font-sora)', 'var(--font-cairo)', 'system-ui', 'sans-serif'],
        // Arabic-first stack (Cairo carries Latin fallback for mixed strings)
        arabic: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-cairo)', 'serif'],
      },
      fontSize: {
        // Fluid type scale — clamp(min, preferred, max)
        'display-xl': ['clamp(2.75rem, 1.5rem + 5.2vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 1.4rem + 3.6vw, 4.25rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.875rem, 1.3rem + 2.4vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.5rem, 1.2rem + 1.4vw, 2.125rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.75' }],
        'label': ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      spacing: {
        section: 'clamp(4.5rem, 3rem + 6vw, 9rem)',
        // Control height sitting between h-12 and h-14 — used by the
        // properties toolbar so search, sort and filters align exactly.
        13: '3.25rem',
      },
      maxWidth: {
        shell: '82.5rem',
      },
      borderRadius: {
        card: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(7 16 35 / 0.04), 0 12px 32px -12px rgb(7 16 35 / 0.14)',
        lift: '0 2px 4px rgb(7 16 35 / 0.05), 0 32px 64px -20px rgb(7 16 35 / 0.30)',
        gold: '0 12px 40px -12px rgb(188 143 67 / 0.55)',
        inset: 'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #DFB764 0%, #BC8F43 48%, #A06F1F 100%)',
        'gold-sheen':
          'linear-gradient(105deg, transparent 30%, rgb(223 183 100 / 0.55) 48%, transparent 62%)',
        'navy-depth': 'radial-gradient(120% 120% at 50% 0%, #142033 0%, #0B1425 55%, #071023 100%)',
      },
      transitionTimingFunction: {
        rise: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
