import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

import { locales, type Locale } from '@/i18n/routing';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';

// `nodejs` (not `edge`) so the font files can be read from disk at build time.
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Fonts must be supplied explicitly: next/og's built-in font is Latin-only and
 * throws outright when asked to draw Arabic. These are the site's own brand
 * faces, committed under /assets as static TTFs — satori can't read woff2, and
 * next/font's copies aren't reachable from here.
 */
async function loadFont(file: string) {
  return readFile(path.join(process.cwd(), 'assets', 'fonts', file));
}

/**
 * Messages are read straight from the JSON rather than through
 * `getTranslations`. next-intl's server APIs need the request scope, which
 * isn't set up inside metadata-file exports like `generateImageMetadata` — it
 * throws "not supported in Client Components" there. The files are static, so
 * importing them costs nothing and keeps this route self-contained.
 */
const messages = { ar, en } as const;

const copy = (locale: string) => messages[(locale as Locale) in messages ? (locale as Locale) : 'ar'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateImageMetadata({
  params,
}: {
  // Next 15 passes params as a Promise, including to metadata-file exports.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { brand } = copy(locale);

  return [
    {
      id: 'default',
      size,
      contentType,
      alt: `${brand.name} — ${brand.tagline}`,
    },
  ];
}

/**
 * Social share card, generated per locale at build time.
 *
 * It lives inside `[locale]` rather than at the app root for three reasons: the
 * root path would be caught by the locale middleware and redirected; the card
 * can be authored in the visitor's language; and Next injects it into every
 * page's metadata automatically from here, so no page has to hardcode the URL.
 *
 * Drawn rather than shipped as a static PNG so it stays in sync with the brand
 * palette — the same navy, gold gradient and skyline motif taken from logo.png.
 * next/og runs a mini layout engine: only inline styles and flex are safe here
 * (no Tailwind, no CSS grid).
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { brand, hero } = copy(locale);
  const isRtl = locale === 'ar';

  // Each locale gets its own brand face: Cairo carries Arabic, Sora carries
  // Latin. Picking by locale rather than relying on glyph fallback keeps the
  // result deterministic.
  const family = isRtl ? 'Cairo' : 'Sora';
  const [regular, bold] = await Promise.all([
    loadFont(isRtl ? 'Cairo-Regular.ttf' : 'Sora-Regular.ttf'),
    loadFont(isRtl ? 'Cairo-Bold.ttf' : 'Sora-Bold.ttf'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(120% 120% at 50% 0%, #142033 0%, #0B1425 55%, #071023 100%)',
          padding: 72,
          fontFamily: family,
          position: 'relative',
          direction: isRtl ? 'rtl' : 'ltr',
        }}
      >
        {/* Gold rule, echoing the arc beneath the logo's towers */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #DFB764 0%, #BC8F43 50%, #A06F1F 100%)',
          }}
        />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              width: 18,
              height: 64,
              background: 'linear-gradient(180deg, #DFB764 0%, #A06F1F 100%)',
              borderRadius: 3,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: '#FEFEFE',
                letterSpacing: isRtl ? 0 : -1,
                lineHeight: 1.2,
              }}
            >
              {brand.name}
            </div>
            <div style={{ fontSize: 20, color: '#BC8F43', marginTop: 6 }}>
              {brand.tagline}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
          <div
            style={{
              fontSize: isRtl ? 58 : 66,
              fontWeight: 800,
              color: '#FEFEFE',
              lineHeight: 1.25,
              letterSpacing: isRtl ? 0 : -2,
            }}
          >
            {hero.titleLine1}
          </div>
          <div
            style={{
              fontSize: isRtl ? 58 : 66,
              fontWeight: 800,
              color: '#DFB764',
              lineHeight: 1.25,
              letterSpacing: isRtl ? 0 : -2,
            }}
          >
            {hero.titleLine2}
          </div>
        </div>

        {/* Skyline motif, echoing the hero scene.
            Widths + gaps are tuned to span the full 1056px content box, and the
            unlit towers use navy-500 rather than navy-700 — against this
            background anything darker reads as empty space, leaving the gold
            cap lines floating on their own. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 10,
            height: 130,
            width: '100%',
          }}
        >
          {[
            { w: 62, h: 54, gold: false },
            { w: 48, h: 112, gold: true },
            { w: 96, h: 44, gold: false },
            { w: 40, h: 78, gold: false },
            { w: 54, h: 96, gold: true },
            { w: 110, h: 62, gold: false },
            { w: 44, h: 130, gold: true },
            { w: 58, h: 38, gold: false },
            { w: 104, h: 70, gold: false },
            { w: 50, h: 104, gold: true },
            { w: 42, h: 58, gold: false },
            { w: 88, h: 48, gold: false },
            { w: 60, h: 88, gold: true },
            { w: 70, h: 42, gold: false },
          ].map((tower, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                width: tower.w,
                height: tower.h,
                background: tower.gold
                  ? 'linear-gradient(180deg, #DFB764 0%, #A06F1F 100%)'
                  : '#33425C',
                borderTop: tower.gold ? 'none' : '3px solid #BC8F43',
                borderRadius: '3px 3px 0 0',
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: family, data: regular, weight: 400, style: 'normal' },
        { name: family, data: bold, weight: 800, style: 'normal' },
      ],
    },
  );
}
