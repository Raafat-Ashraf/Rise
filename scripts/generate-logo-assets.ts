/**
 * Derives the header/footer logo assets from the master lock-up.
 *
 *   npm run logo:assets
 *
 * Inputs:  logo.png — the supplied artwork: mark + wordmark + slogan on white.
 * Outputs: public/logo-mark.png        mark only, paper knocked out
 *          public/logo-mark-light.png  same, navy recoloured to sand
 *          app/icon.png                256px favicon, mark on a navy tile
 *
 * Why this exists rather than a hand-cropped file: the derivatives stay
 * reproducible and their provenance stays obvious. Re-run it if `logo.png` is
 * ever replaced, then eyeball the three outputs.
 *
 * Two things this gets right that a naive crop does not:
 *
 *  1. **The paper is knocked out, all of it.** Every near-white pixel becomes
 *     transparent — including the counters enclosed inside the R. They were
 *     white-on-white in the original, so letting the page colour through is
 *     what the design already assumed.
 *
 *  2. **The mark is two-tone, so it needs two cut-outs.** Its towers are the
 *     brand navy and would vanish against the navy header. The `-light`
 *     variant recolours navy to sand and leaves the gold untouched.
 */

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'logo.png');

/**
 * The mark's bounding box within the lock-up, found by scanning for bands of
 * rows containing ink: band 0 is the towers + R + arc, bands 1-3 are "RISE",
 * "REAL ESTATE" and the slogan. Hardcoded because the artwork is fixed; if the
 * logo is replaced, re-derive these with the band scan below.
 */
const MARK_BOX = { x0: 263, y0: 168, x1: 978, y1: 699 };
const PAD = 8;

const SAND: [number, number, number] = [254, 254, 254];
const NAVY: [number, number, number] = [11, 20, 37];

const ICON_SIZE = 256;
const ICON_INSET = 26;

function hsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

/**
 * Gold is identified by hue + saturation, never by lightness: the logo's dark
 * gold (#A06F1F, L=37%) is darker than you'd guess, and a lightness test
 * misfiles it as navy and then recolours it to sand.
 */
function isGold(r: number, g: number, b: number): boolean {
  const [h, s] = hsl(r, g, b);
  return h >= 20 && h <= 62 && s >= 25;
}

const isPaper = (r: number, g: number, b: number) => r >= 240 && g >= 240 && b >= 240;

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`\n  Missing ${SRC}\n`);
    process.exit(1);
  }

  const src = PNG.sync.read(fs.readFileSync(SRC));
  const W = src.width;

  const x0 = Math.max(0, MARK_BOX.x0 - PAD);
  const y0 = Math.max(0, MARK_BOX.y0 - PAD);
  const x1 = Math.min(src.width - 1, MARK_BOX.x1 + PAD);
  const y1 = Math.min(src.height - 1, MARK_BOX.y1 + PAD);

  // Pad the crop to a square so the mark keeps its proportions in a square box.
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const side = Math.max(cw, ch);
  const offX = Math.floor((side - cw) / 2);
  const offY = Math.floor((side - ch) / 2);

  const build = (recolorNavy: boolean) => {
    const out = new PNG({ width: side, height: side });
    out.data.fill(0);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = (W * y + x) << 2;
        const r = src.data[i];
        const g = src.data[i + 1];
        const b = src.data[i + 2];
        const a = src.data[i + 3];

        const o = (side * (y - y0 + offY) + (x - x0 + offX)) << 2;

        if (a < 128 || isPaper(r, g, b)) {
          out.data[o + 3] = 0;
          continue;
        }

        if (recolorNavy && !isGold(r, g, b)) {
          [out.data[o], out.data[o + 1], out.data[o + 2]] = SAND;
        } else {
          out.data[o] = r;
          out.data[o + 1] = g;
          out.data[o + 2] = b;
        }
        out.data[o + 3] = 255;
      }
    }
    return out;
  };

  const mark = build(false);
  const markLight = build(true);

  fs.writeFileSync(path.join(ROOT, 'public/logo-mark.png'), PNG.sync.write(mark));
  fs.writeFileSync(
    path.join(ROOT, 'public/logo-mark-light.png'),
    PNG.sync.write(markLight),
  );

  // ── Favicon: box-filter downscale of the light mark onto a navy tile ──────
  // A box filter (rather than nearest-neighbour) is what keeps the towers from
  // shimmering apart at 16x reduction.
  const icon = new PNG({ width: ICON_SIZE, height: ICON_SIZE });
  const scale = side / (ICON_SIZE - ICON_INSET * 2);

  for (let y = 0; y < ICON_SIZE; y++) {
    for (let x = 0; x < ICON_SIZE; x++) {
      const o = (ICON_SIZE * y + x) << 2;
      let [r, g, b] = NAVY;

      const sx0 = Math.floor((x - ICON_INSET) * scale);
      const sy0 = Math.floor((y - ICON_INSET) * scale);
      const sx1 = Math.floor((x - ICON_INSET + 1) * scale);
      const sy1 = Math.floor((y - ICON_INSET + 1) * scale);

      if (sx0 >= 0 && sy0 >= 0 && sx1 <= side && sy1 <= side && sx1 > sx0 && sy1 > sy0) {
        let ar = 0;
        let ag = 0;
        let ab = 0;
        let aa = 0;
        let n = 0;

        for (let sy = sy0; sy < sy1; sy++) {
          for (let sx = sx0; sx < sx1; sx++) {
            const i = (side * sy + sx) << 2;
            const al = markLight.data[i + 3] / 255;
            ar += markLight.data[i] * al;
            ag += markLight.data[i + 1] * al;
            ab += markLight.data[i + 2] * al;
            aa += al;
            n++;
          }
        }

        if (n > 0 && aa > 0) {
          const cov = aa / n; // ink coverage of this target pixel
          r = (ar / aa) * cov + NAVY[0] * (1 - cov);
          g = (ag / aa) * cov + NAVY[1] * (1 - cov);
          b = (ab / aa) * cov + NAVY[2] * (1 - cov);
        }
      }

      icon.data[o] = Math.round(r);
      icon.data[o + 1] = Math.round(g);
      icon.data[o + 2] = Math.round(b);
      icon.data[o + 3] = 255;
    }
  }

  fs.writeFileSync(path.join(ROOT, 'app/icon.png'), PNG.sync.write(icon));

  const kb = (p: string) => `${(fs.statSync(path.join(ROOT, p)).size / 1024).toFixed(1)}kb`;
  console.log(`\n  mark        ${side}x${side}  ${kb('public/logo-mark.png')}`);
  console.log(`  mark-light  ${side}x${side}  ${kb('public/logo-mark-light.png')}`);
  console.log(`  icon        ${ICON_SIZE}x${ICON_SIZE}  ${kb('app/icon.png')}\n`);
}

main();
