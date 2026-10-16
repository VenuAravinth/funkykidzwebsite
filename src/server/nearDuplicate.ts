import "server-only";
import sharp from "sharp";

// "Is this screenshot a picture of exactly this product photo?" — classic image alignment,
// no AI model needed. The query (borders / app bars trimmed) is compared with many windows of
// the product photo at different zoom levels and positions, using brightness-normalised
// greyscale thumbnails. Real screenshots (feed crops, stories with stickers, brighter phone
// captures) score 0.7–0.99; different products stay below ~0.56 in testing.
export const EXACT_ALIGNMENT = 0.68;

const N = 24; // thumbnail side
const REF_W = 160; // working width of the product photo

export type Grey = { px: Uint8Array; w: number; h: number };
export type QueryShape = { vec: Float32Array; aspect: number };

export async function greyThumb(input: Buffer): Promise<Grey> {
  const { data, info } = await sharp(input).rotate().greyscale().resize({ width: REF_W }).raw().toBuffer({ resolveWithObject: true });
  return { px: new Uint8Array(data), w: info.width, h: info.height };
}

// Area-average a window of the image into N×N, then zero-mean / unit-length.
function sample(img: Grey, x0: number, y0: number, ww: number, hh: number): Float32Array {
  const out = new Float32Array(N * N);
  let mean = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const xa = x0 + (i * ww) / N, xb = x0 + ((i + 1) * ww) / N;
      const ya = y0 + (j * hh) / N, yb = y0 + ((j + 1) * hh) / N;
      let s = 0, c = 0;
      for (let y = Math.floor(ya); y < Math.min(img.h, Math.ceil(yb)); y++)
        for (let x = Math.floor(xa); x < Math.min(img.w, Math.ceil(xb)); x++) {
          s += img.px[y * img.w + x];
          c++;
        }
      const v = c ? s / c : 0;
      out[j * N + i] = v;
      mean += v;
    }
  }
  mean /= N * N;
  let n = 0;
  for (let k = 0; k < out.length; k++) {
    out[k] -= mean;
    n += out[k] * out[k];
  }
  n = Math.sqrt(n) || 1;
  for (let k = 0; k < out.length; k++) out[k] /= n;
  return out;
}

export async function queryShape(input: Buffer): Promise<QueryShape> {
  // Trim uniform borders (white Instagram frame, black phone bars) before comparing.
  const trimmed = await sharp(input).rotate().trim({ threshold: 30 }).toBuffer().catch(() => input);
  const g = await greyThumb(trimmed);
  return { vec: sample(g, 0, 0, g.w, g.h), aspect: g.w / g.h };
}

const SCALES = [1, 0.92, 0.85, 0.78, 0.72, 0.66, 0.6, 0.55, 0.5, 0.45];
const STEPS = 7;

/** Best correlation between the query and any window of the product photo (−1…1). */
export function alignment(ref: Grey, q: QueryShape): number {
  let best = -1;
  for (const sx of SCALES) {
    for (const sy of SCALES) {
      const ww = ref.w * sx, hh = ref.h * sy;
      const ar = ww / hh;
      if (ar / q.aspect > 1.15 || q.aspect / ar > 1.15) continue; // window shape must resemble the query
      for (let a = 0; a < STEPS; a++) {
        for (let b = 0; b < STEPS; b++) {
          const v = sample(ref, ((ref.w - ww) * a) / (STEPS - 1), ((ref.h - hh) * b) / (STEPS - 1), ww, hh);
          let d = 0;
          for (let k = 0; k < v.length; k++) d += v[k] * q.vec[k];
          if (d > best) best = d;
        }
      }
    }
  }
  return best;
}
