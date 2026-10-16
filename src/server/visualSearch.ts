import "server-only";
import { createHash } from "node:crypto";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { Product } from "@/lib/products";
import { getDb } from "./db";
import { getProducts } from "./catalog";
import { alignment, EXACT_ALIGNMENT, greyThumb, queryShape, type Grey } from "./nearDuplicate";

// Visual product search ("Google Lens" style), fully on our own server — customer photos are
// never sent to a third party and never stored.
//
// Model: CLIP (openai/clip-vit-base-patch32, quantised ONNX via transformers.js). CLIP maps
// images and text into the same space, so an uploaded photo can be compared with:
//   1. product PHOTOS (image ↔ image) — near-identical pictures, e.g. a screenshot of our own
//      Instagram post, score very high and are reported as an exact match;
//   2. product DESCRIPTIONS (image ↔ text) — "a photo of a girl wearing a pink hanbok party
//      dress" — which works even before real product photos are added.
// Embeddings for the catalogue are cached in MongoDB (`product_embeddings`) and in memory, and
// recomputed automatically when a product's text or photos change.

const MODEL_ID = "Xenova/clip-vit-base-patch32";
const DTYPE = "q8";

type Clip = {
  embedImage: (data: Buffer) => Promise<number[]>;
  embedTexts: (texts: string[]) => Promise<number[][]>;
};

type Globals = { clip?: Promise<Clip>; vectors?: Map<string, number[]>; thumbs?: Map<string, Grey> };
const g = globalThis as unknown as { __fkVisual?: Globals };
const state: Globals = (g.__fkVisual ??= {});
const memo = (state.vectors ??= new Map());
const thumbs = (state.thumbs ??= new Map());

export function modelCacheDir() {
  const base = process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data");
  return path.join(/*turbopackIgnore: true*/ base, "models");
}

const normalize = (v: ArrayLike<number>) => {
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  return Array.from(v, (x) => x / n);
};
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

/** Loads the model once per server process (first call downloads ~160 MB into data/models). */
function loadClip(): Promise<Clip> {
  state.clip ??= (async () => {
    const t = await import("@huggingface/transformers");
    t.env.cacheDir = modelCacheDir();
    const [processor, tokenizer, vision, text] = await Promise.all([
      t.AutoProcessor.from_pretrained(MODEL_ID),
      t.AutoTokenizer.from_pretrained(MODEL_ID),
      t.CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { dtype: DTYPE }),
      t.CLIPTextModelWithProjection.from_pretrained(MODEL_ID, { dtype: DTYPE }),
    ]);
    return {
      embedImage: async (data: Buffer) => {
        const image = await t.RawImage.fromBlob(new Blob([new Uint8Array(data)]));
        const { image_embeds } = await vision(await processor(image));
        return normalize(image_embeds.data as Float32Array);
      },
      embedTexts: async (texts: string[]) => {
        const inputs = tokenizer(texts, { padding: true, truncation: true });
        const { text_embeds } = await text(inputs);
        return (text_embeds.tolist() as number[][]).map(normalize);
      },
    };
  })().catch((err) => {
    state.clip = undefined; // allow a retry on the next request
    throw err;
  });
  return state.clip;
}

// ---------------------------------------------------------------------------------------
// Describing products in words CLIP understands
// ---------------------------------------------------------------------------------------

// Shop colour names → plain colour words.
const PLAIN_COLOUR: Record<string, string> = {
  rose: "pink",
  blush: "light pink",
  mint: "mint green",
  sage: "sage green",
  navy: "navy blue",
  "powder blue": "light blue",
  gold: "golden yellow",
  lilac: "light purple",
  cream: "cream white",
  pearl: "pearl white",
  charcoal: "dark grey",
};

export function productPrompts(p: Product): { colorway: string; prompt: string }[] {
  const subject = p.gender === "Boys" ? "a boy" : p.gender === "Girls" ? "a girl" : "a child";
  // "Girls' Hanbok Party Dress with Ribbon Waist" → "hanbok party dress with ribbon waist"
  const item = p.name
    .replace(/^(girls|boys)['’]?\s+/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return p.colorways.map((c) => {
    const colour = PLAIN_COLOUR[c.name.toLowerCase()] ?? c.name.toLowerCase();
    const prompt =
      p.category === "Accessories"
        ? `a photo of a ${colour} ${item}, a kids accessory`
        : `a photo of ${subject} wearing a ${colour} ${item}, korean style kids clothing`;
    return { colorway: c.name, prompt };
  });
}

// ---------------------------------------------------------------------------------------
// Catalogue embeddings (cached in MongoDB + memory)
// ---------------------------------------------------------------------------------------

type Entry = { slug: string; colorway: string; kind: "text" | "image"; vector: number[]; source: string };

const keyFor = (kind: string, source: string) => createHash("sha256").update(`${MODEL_ID}|${DTYPE}|${kind}|${source}`).digest("base64url");

async function loadPhoto(src: string): Promise<Buffer | null> {
  try {
    if (/^https?:\/\//.test(src)) {
      const res = await fetch(src);
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }
    // Local paths like "/products/rose-dress-1.webp" live in /public.
    return await fs.readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", src.replace(/^\/+/, "")));
  } catch {
    return null;
  }
}

async function catalogueEntries(products: Product[]): Promise<Entry[]> {
  const clip = await loadClip();
  const db = await getDb();
  const store = db.collection<{ _id: string; slug: string; colorway: string; kind: "text" | "image"; vector: number[]; createdAt: Date }>(
    "product_embeddings"
  );

  const wanted: { key: string; slug: string; colorway: string; kind: "text" | "image"; source: string }[] = [];
  for (const p of products) {
    for (const { colorway, prompt } of productPrompts(p)) wanted.push({ key: keyFor("text", prompt), slug: p.slug, colorway, kind: "text", source: prompt });
    for (const c of p.colorways)
      for (const img of c.images ?? []) wanted.push({ key: keyFor("image", img), slug: p.slug, colorway: c.name, kind: "image", source: img });
  }

  // 1) memory, 2) MongoDB, 3) compute now and save.
  const missing = wanted.filter((w) => !memo.has(w.key));
  if (missing.length) {
    const stored = await store.find({ _id: { $in: missing.map((m) => m.key) } }).toArray();
    for (const d of stored) memo.set(d._id, d.vector);
  }
  const toCompute = wanted.filter((w) => !memo.has(w.key));
  const texts = toCompute.filter((w) => w.kind === "text");
  if (texts.length) {
    const vectors = await clip.embedTexts(texts.map((t) => t.source));
    texts.forEach((t, i) => memo.set(t.key, vectors[i]));
  }
  for (const img of toCompute.filter((w) => w.kind === "image")) {
    const data = await loadPhoto(img.source);
    if (data) memo.set(img.key, await clip.embedImage(data));
  }
  const fresh = toCompute.filter((w) => memo.has(w.key));
  if (fresh.length) {
    await store.bulkWrite(
      fresh.map((w) => ({
        updateOne: {
          filter: { _id: w.key },
          update: { $set: { slug: w.slug, colorway: w.colorway, kind: w.kind, vector: memo.get(w.key)!, createdAt: new Date() } },
          upsert: true,
        },
      }))
    );
  }

  return wanted.filter((w) => memo.has(w.key)).map((w) => ({ slug: w.slug, colorway: w.colorway, kind: w.kind, vector: memo.get(w.key)!, source: w.source }));
}

// Generic descriptions used to tell "this is an outfit" from "this is something else".
const SCENE_PROMPTS = {
  clothing: ["a photo of a child wearing clothes", "a photo of kids clothing", "a photo of a dress", "a screenshot of a kids fashion post"],
  other: ["a photo of food", "a photo of a landscape", "a photo of a car", "a photo of a building", "a screenshot of text", "a photo of an animal"],
};

// ---------------------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------------------

export type VisualMatch = { slug: string; colorway: string; score: number; match: "exact" | "similar" };
export type VisualSearchResult = { matches: VisualMatch[]; looksLikeClothing: boolean; usedPhotos: boolean };

// How many of the closest product photos (by CLIP) get the precise alignment check.
const ALIGNMENT_CANDIDATES = 6;

export async function visualSearch(image: Buffer, limit = 12): Promise<VisualSearchResult> {
  const clip = await loadClip();
  const [query, products] = await Promise.all([clip.embedImage(image), getProducts()]);
  const entries = await catalogueEntries(products);

  const sceneKeys = [...SCENE_PROMPTS.clothing, ...SCENE_PROMPTS.other];
  const sceneVectors = await Promise.all(
    sceneKeys.map(async (s) => {
      const key = keyFor("text", s);
      if (!memo.has(key)) memo.set(key, (await clip.embedTexts([s]))[0]);
      return memo.get(key)!;
    })
  );
  const sceneSims = sceneVectors.map((v) => dot(query, v));
  const bestClothing = Math.max(...sceneSims.slice(0, SCENE_PROMPTS.clothing.length));
  const bestOther = Math.max(...sceneSims.slice(SCENE_PROMPTS.clothing.length));
  const looksLikeClothing = bestClothing >= bestOther - 0.01;

  // Best score per product (over its colourways). Text sims sit around 0.15–0.35 and image
  // sims around 0.5–1.0, so each is mapped onto a common 0–1 scale before combining.
  const best = new Map<string, { colorway: string; text: number; image: number }>();
  for (const e of entries) {
    const sim = dot(query, e.vector);
    const cur = best.get(e.slug) ?? { colorway: e.colorway, text: 0, image: 0 };
    if (e.kind === "text" && sim > cur.text) {
      cur.text = sim;
      if (!cur.image) cur.colorway = e.colorway;
    }
    if (e.kind === "image" && sim > cur.image) {
      cur.image = sim;
      cur.colorway = e.colorway;
    }
    best.set(e.slug, cur);
  }

  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const usedPhotos = entries.some((e) => e.kind === "image");

  // Exact match: run the precise alignment check on the few most similar product photos.
  const exact = new Map<string, { colorway: string; score: number }>();
  if (usedPhotos) {
    const shape = await queryShape(image);
    const candidates = entries
      .filter((e) => e.kind === "image")
      .map((e) => ({ e, sim: dot(query, e.vector) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, ALIGNMENT_CANDIDATES);
    for (const { e } of candidates) {
      let ref = thumbs.get(e.source);
      if (!ref) {
        const data = await loadPhoto(e.source);
        if (!data) continue;
        ref = await greyThumb(data);
        thumbs.set(e.source, ref);
      }
      const a = alignment(ref, shape);
      if (a >= EXACT_ALIGNMENT && a > (exact.get(e.slug)?.score ?? 0)) exact.set(e.slug, { colorway: e.colorway, score: a });
    }
  }

  const matches: VisualMatch[] = [...best.entries()]
    .map(([slug, s]) => {
      const hit = exact.get(slug);
      const textScore = clamp((s.text - 0.15) / 0.2);
      const imageScore = s.image ? clamp((s.image - 0.6) / 0.35) : 0;
      const score = hit ? 1 + hit.score : s.image ? Math.max(textScore, 0.6 * imageScore + 0.4 * textScore) : textScore;
      return {
        slug,
        colorway: hit?.colorway ?? s.colorway,
        score: Math.round(score * 1000) / 1000,
        match: (hit ? "exact" : "similar") as VisualMatch["match"],
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { matches, looksLikeClothing, usedPhotos };
}

/** Downloads the model and pre-computes catalogue embeddings (run once after deploying). */
export async function warmUpVisualSearch() {
  const products = await getProducts();
  await catalogueEntries(products);
}
