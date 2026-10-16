import { sizeToAgeBucket } from "./categories";
import { byPopularity, isInStock, type Product } from "./products";

// Keyword search over the catalogue: name, category, gender, description, fabric, fit, colours,
// sizes and ages, plus everyday words parents use ("frock", "pants", "baby"). Every word of the
// query must match for a product to count as a result; results are ordered by relevance.

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/\b(years?|yrs?)\b/g, "y")
    .replace(/\b(months?|mos?)\b/g, "m")
    .replace(/(\d)\s+(y|m)\b/g, "$1$2");

// Crude singular form so "dresses", "girls" and "sets" match "dress", "girl" and "set".
const stem = (t: string) => (t.length > 3 ? t.replace(/(ss|sh|ch|x)es$/, "$1").replace(/s$/, "") : t);

// Everyday words → words that appear in the catalogue.
const SYNONYMS: Record<string, string[]> = {
  frock: ["dress"],
  gown: ["dress"],
  skirt: ["chima", "dress"],
  pant: ["bottom", "trouser", "pant"],
  trouser: ["trouser", "bottom"],
  jean: ["bottom", "trouser"],
  shirt: ["top", "jeogori", "jacket"],
  tshirt: ["top"],
  jacket: ["jacket", "top"],
  coat: ["jacket"],
  vest: ["vest", "top"],
  baby: ["0-1", "0-3m", "3-6m", "6-9m", "9-12m"],
  infant: ["0-1", "0-3m"],
  newborn: ["0-3m"],
  toddler: ["1-2y", "2-3y", "1-3"],
  teen: ["12-13y", "13-14y", "14-15y"],
  korean: ["hanbok", "korean"],
  traditional: ["hanbok", "traditional"],
  ethnic: ["hanbok"],
  festive: ["hanbok", "festive", "festival"],
  party: ["party", "celebration"],
  birthday: ["party", "birthday", "celebration"],
  wedding: ["hanbok", "celebration"],
  hair: ["ribbon", "accessor"],
  accessory: ["accessor"],
  accessorie: ["accessor"],
  pink: ["rose"],
  blue: ["navy", "powder blue"],
  green: ["mint"],
  purple: ["lilac"],
  yellow: ["gold"],
  white: ["cream"],
  boy: ["boy"],
  girl: ["girl"],
  son: ["boy"],
  daughter: ["girl"],
};

type Indexed = { product: Product; name: string; category: string; rest: string };

function index(p: Product): Indexed {
  const ages = p.sizes.map((s) => sizeToAgeBucket(s) ?? "");
  // Expand "5-6Y" into "5y 6y" so a single-age query like "6 years" matches.
  const singleAges = p.sizes.flatMap((s) => {
    const m = s.match(/^(\d+)-(\d+)([YM])$/);
    if (!m) return [];
    const [, from, to, unit] = m;
    const out: string[] = [];
    for (let n = Number(from); n <= Number(to); n++) out.push(`${n}${unit}`);
    return out;
  });
  return {
    product: p,
    name: normalize(p.name),
    category: normalize(`${p.category} ${p.gender}`),
    rest: normalize(
      [p.shortDescription, p.description, p.fabric, p.fit, ...p.colorways.map((c) => c.name), ...p.sizes, ...ages, ...singleAges].join(" ")
    ),
  };
}

const tokenize = (q: string) =>
  normalize(q)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 0 && !["for", "and", "the", "with", "kid", "kids", "child", "children", "a", "of"].includes(t))
    .map(stem);

/** Points for one query word against one product (0 = no match). Name hits count most. */
function tokenScore(ix: Indexed, token: string): number {
  const variants = [token, ...(SYNONYMS[token] ?? [])];
  let best = 0;
  for (const v of variants) {
    const exact = v === token ? 1 : 0.8; // synonyms count a little less
    if (ix.name.includes(v)) best = Math.max(best, 3 * exact);
    else if (ix.category.includes(v)) best = Math.max(best, 2 * exact);
    else if (ix.rest.includes(v)) best = Math.max(best, 1 * exact);
  }
  return best;
}

/** Products matching every word of the query, most relevant first. */
export function searchProducts(products: Product[], query: string): Product[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return products;
  return products
    .map((p) => {
      const ix = index(p);
      const scores = tokens.map((t) => tokenScore(ix, t));
      return { p, ok: scores.every((s) => s > 0), score: scores.reduce((a, b) => a + b, 0) };
    })
    .filter((r) => r.ok)
    .sort((a, b) => b.score - a.score || byPopularity(a.p, b.p))
    .map((r) => r.p);
}

// --- "No results" suggestions ---------------------------------------------------------

/** Edit distance ≤ 1 (one typo), for words of 4+ letters: "hanbk" → "hanbok". */
function nearMatch(a: string, b: string): boolean {
  if (a.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Products related to a query that had no exact results: anything matching at least one word
 * (or a one-letter typo of it), best matches first. Falls back to best sellers so the shopper
 * always has something to look at.
 */
export function relatedProducts(products: Product[], query: string, limit = 8): Product[] {
  const tokens = tokenize(query);
  const inStock = products.filter(isInStock);
  const scored = inStock
    .map((p) => {
      const ix = index(p);
      const words = `${ix.name} ${ix.category} ${ix.rest}`.split(/[^a-z0-9-]+/);
      const score = tokens.reduce((sum, t) => {
        const direct = tokenScore(ix, t);
        if (direct) return sum + direct;
        return sum + (words.some((w) => nearMatch(t, stem(w))) ? 1 : 0);
      }, 0);
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || byPopularity(a.p, b.p))
    .map((r) => r.p);
  if (scored.length >= limit) return scored.slice(0, limit);
  const filler = [...inStock].sort(byPopularity).filter((p) => !scored.includes(p));
  return [...scored, ...filler].slice(0, limit);
}
