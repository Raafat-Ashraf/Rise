/**
 * Derives the header/footer logo assets from the master lock-up.
 *
 *   npm run logo:assets
 *
 * Input:   AmjadLogo.jpg — the supplied artwork: the "AMJAD" serif wordmark
 *          over a tracked "DEVELOPMENTS" caption, dark-brown ink on a warm
 *          cream field.
 * Outputs: public/logo-mark.png        wordmark cut out, paper knocked out,
 *                                       original espresso ink (for light bg)
 *          public/logo-mark-light.png  same cut-out recoloured to cream
 *                                       (for the dark header/footer)
 *          app/icon.png                256px favicon — the "A" glyph on an
 *                                       espresso tile
 *
 * Why derivatives rather than the raw JPG: the artwork sits on an opaque cream
 * field, which would show as a pale plate behind the logo on the site's dark
 * header. Knocking the paper out to transparency — and providing a light-ink
 * variant so the wordmark doesn't vanish against espresso — is what lets it sit
 * cleanly on either background. Re-run this if AmjadLogo.jpg is replaced.
 */

import fs from 'node:fs';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'AmjadLogo.jpg');

// Ink vs paper split, measured off the source: ink pixels sit far below the
// cream field's ~L87%. Anything under this lightness is treated as ink.
const INK_L = 45;

// Sampled anchors (see the brand-palette notes in tailwind.config.ts).
const CREAM: [number, number, number] = [251, 250, 249]; // cream-50
const ESPRESSO: [number, number, number] = [49, 27, 12]; // espresso-900

const ICON_SIZE = 256;
const ICON_INSET = 30;

function lightness(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  return ((Math.max(rn, gn, bn) + Math.min(rn, gn, bn)) / 2) * 100;
}

interface Decoded {
  width: number;
  height: number;
  data: Uint8Array;
}

const isInk = (img: Decoded, x: number, y: number): boolean => {
  const i = (img.width * y + x) * 4;
  return lightness(img.data[i], img.data[i + 1], img.data[i + 2]) < INK_L;
};

/** Contiguous runs of rows/columns that contain ink, ignoring speckle. */
function bands(profile: number[], minRun: number, floor: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start: number | null = null;
  for (let i = 0; i < profile.length; i++) {
    const has = profile[i] > floor;
    if (has && start === null) start = i;
    if (!has && start !== null) {
      if (i - start >= minRun) out.push([start, i - 1]);
      start = null;
    }
  }
  if (start !== null) out.push([start, profile.length - 1]);
  return out;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`\n  Missing ${SRC}\n`);
    process.exit(1);
  }

  const img = jpeg.decode(fs.readFileSync(SRC), { useTArray: true }) as Decoded;
  const { width: W, height: H } = img;

  // ── Bounding box of the whole lock-up (wordmark + caption) ───────────────
  const rowInk: number[] = [];
  for (let y = 0; y < H; y++) {
    let c = 0;
    for (let x = 0; x < W; x += 2) if (isInk(img, x, y)) c++;
    rowInk.push(c);
  }
  const rowBands = bands(rowInk, 5, 3);
  const y0 = rowBands[0][0];
  const y1 = rowBands[rowBands.length - 1][1];

  const colInk: number[] = [];
  for (let x = 0; x < W; x++) {
    let c = 0;
    for (let y = y0; y <= y1; y++) if (isInk(img, x, y)) c++;
    colInk.push(c);
  }
  const colBands = bands(colInk, 4, 1);
  const x0 = colBands[0][0];
  const x1 = colBands[colBands.length - 1][1];

  const PAD = Math.round((y1 - y0) * 0.12);

  /**
   * Alpha ramps from 0 (paper) to 255 (ink) across a soft band around the
   * threshold, so glyph edges stay smooth rather than aliased. `recolor`, when
   * given, replaces the ink colour (used for the light variant).
   */
  const cut = (recolor?: [number, number, number]) => {
    const bx0 = Math.max(0, x0 - PAD);
    const by0 = Math.max(0, y0 - PAD);
    const bx1 = Math.min(W - 1, x1 + PAD);
    const by1 = Math.min(H - 1, y1 + PAD);
    const w = bx1 - bx0 + 1;
    const h = by1 - by0 + 1;

    const out = new PNG({ width: w, height: h });
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const si = (W * (y + by0) + (x + bx0)) * 4;
        const di = (w * y + x) * 4;
        const r = img.data[si];
        const g = img.data[si + 1];
        const b = img.data[si + 2];
        const l = lightness(r, g, b);

        // Alpha: fully opaque well below the threshold, fading to 0 above it.
        const alpha = Math.round(255 * Math.min(1, Math.max(0, (INK_L + 10 - l) / 20)));

        if (recolor) {
          out.data[di] = recolor[0];
          out.data[di + 1] = recolor[1];
          out.data[di + 2] = recolor[2];
        } else {
          out.data[di] = r;
          out.data[di + 1] = g;
          out.data[di + 2] = b;
        }
        out.data[di + 3] = alpha;
      }
    }
    return out;
  };

  const mark = cut();
  const markLight = cut(CREAM);
  fs.writeFileSync(path.join(ROOT, 'public/logo-mark.png'), PNG.sync.write(mark));
  fs.writeFileSync(path.join(ROOT, 'public/logo-mark-light.png'), PNG.sync.write(markLight));

  // ── Favicon: the "A" glyph (first column band) on an espresso tile ───────
  const [ax0, ax1] = colBands[0];
  // The caption row sits below the wordmark; restrict the favicon to the
  // wordmark's own (tallest) row band so the "A" isn't shrunk by the caption.
  const mainRow = rowBands.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
  const gx0 = ax0;
  const gx1 = ax1;
  const gy0 = mainRow[0];
  const gy1 = mainRow[1];
  const gw = gx1 - gx0 + 1;
  const gh = gy1 - gy0 + 1;
  const glyphSide = Math.max(gw, gh);
  const gOffX = Math.floor((glyphSide - gw) / 2);
  const gOffY = Math.floor((glyphSide - gh) / 2);

  const icon = new PNG({ width: ICON_SIZE, height: ICON_SIZE });
  const scale = glyphSide / (ICON_SIZE - ICON_INSET * 2);
  for (let y = 0; y < ICON_SIZE; y++) {
    for (let x = 0; x < ICON_SIZE; x++) {
      const o = (ICON_SIZE * y + x) * 4;
      let [r, g, b] = ESPRESSO;

      // Map back into the source glyph, box-filtering to avoid shimmer.
      const sx0 = Math.floor((x - ICON_INSET) * scale) - gOffX + gx0;
      const sy0 = Math.floor((y - ICON_INSET) * scale) - gOffY + gy0;
      const sx1 = Math.floor((x - ICON_INSET + 1) * scale) - gOffX + gx0;
      const sy1 = Math.floor((y - ICON_INSET + 1) * scale) - gOffY + gy0;

      let cover = 0;
      let n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          if (sx < 0 || sy < 0 || sx >= W || sy >= H) {
            n++;
            continue;
          }
          const si = (W * sy + sx) * 4;
          const l = lightness(img.data[si], img.data[si + 1], img.data[si + 2]);
          cover += Math.min(1, Math.max(0, (INK_L + 10 - l) / 20));
          n++;
        }
      }
      if (n > 0) {
        const c = cover / n; // ink coverage → tint toward cream
        r = CREAM[0] * c + ESPRESSO[0] * (1 - c);
        g = CREAM[1] * c + ESPRESSO[1] * (1 - c);
        b = CREAM[2] * c + ESPRESSO[2] * (1 - c);
      }

      icon.data[o] = Math.round(r);
      icon.data[o + 1] = Math.round(g);
      icon.data[o + 2] = Math.round(b);
      icon.data[o + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(ROOT, 'app/icon.png'), PNG.sync.write(icon));

  const kb = (p: string) => `${(fs.statSync(path.join(ROOT, p)).size / 1024).toFixed(1)}kb`;
  console.log(`\n  lock-up box: x ${x0}..${x1}, y ${y0}..${y1}  (pad ${PAD})`);
  console.log(`  mark        ${mark.width}x${mark.height}  ${kb('public/logo-mark.png')}`);
  console.log(`  mark-light  ${markLight.width}x${markLight.height}  ${kb('public/logo-mark-light.png')}`);
  console.log(`  icon        ${ICON_SIZE}x${ICON_SIZE}  ${kb('app/icon.png')}\n`);
}

main();
