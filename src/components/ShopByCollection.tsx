import type { StaticImageData } from "next/image";
import CategoryRail, { type CategoryTile } from "@/components/CategoryRail";
import { productPhotos } from "@/lib/products";
import { getCategories, getProducts, type ShopCategory } from "@/server/catalog";
import bestImg1 from "@/assets/img/home/best-seller/best-img-1.png";
import bestImg2 from "@/assets/img/home/best-seller/best-img-2.png";
import bestImg3 from "@/assets/img/home/best-seller/best-img-3.png";
import bestImg4 from "@/assets/img/home/best-seller/best-img-4.png";
import bestImg5 from "@/assets/img/home/best-seller/best-img-5.png";
import bestImg6 from "@/assets/img/home/best-seller/best-img-6.png";
import girlImg from "@/assets/img/img-w1.png";
import boyImg from "@/assets/img/img-b1.png";

// The categories, their order and which are active all come from ERP Admin → Categories.
// Each tile shows the image uploaded there. Until one is uploaded, the original categories keep
// the picture the site shipped with; any other category shows its first product's photo.
const BUNDLED: Record<string, { image: StaticImageData; focus?: string }> = {
  "little princess": { image: girlImg, focus: "50% 20%" },
  "little champ": { image: boyImg, focus: "50% 20%" },
  "party wear": { image: bestImg2 },
  "t-shirts": { image: bestImg6 },
  shirts: { image: bestImg4 },
  jackets: { image: bestImg3 },
  toddler: { image: bestImg5 },
  "little kids": { image: bestImg1 },
};

const BACKGROUNDS = ["#f7e2df", "#eef0f7", "#f4f0e8", "#f4ede0"];

async function loadCategories(): Promise<ShopCategory[] | null> {
  try {
    return await getCategories();
  } catch (err) {
    console.error("Shop by Category: couldn't load categories from the ERP Backend.", err);
    return null;
  }
}

export default async function ShopByCollection() {
  const [categories, products] = await Promise.all([loadCategories(), getProducts().catch(() => [])]);
  // Nothing to show (ERP unreachable, or no active categories): leave the section out.
  if (!categories?.length) return null;

  const tiles: CategoryTile[] = categories.map((c, i) => {
    const bundled = BUNDLED[c.name.toLowerCase()];
    const productPhoto = products.find((p) => p.category === c.name && productPhotos(p).length);
    return {
      label: c.name,
      href: `/collections?${new URLSearchParams({ category: c.name })}`,
      image: c.image ?? bundled?.image ?? (productPhoto ? productPhotos(productPhoto)[0] : null),
      focus: c.image ? undefined : bundled?.focus,
      bg: BACKGROUNDS[i % BACKGROUNDS.length],
      // Active but nothing published in it yet.
      disabled: c.productCount === 0,
    };
  });

  return <CategoryRail tiles={tiles} />;
}
