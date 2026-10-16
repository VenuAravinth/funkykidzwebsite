// Central business + SEO config. Every page, sitemap and JSON-LD block reads from here,
// so the store name, address and keywords stay consistent (Google rewards consistent NAP data).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://funkykidz.in").replace(/\/$/, "");

export const SITE = {
  name: "FunkyKidz",
  legalName: "Funky Kidz Wear",
  tagline: "Korean-style kids' clothing, ages 0–15",
  description:
    "FunkyKidz sells Korean-style kids' clothing for boys and girls aged 0–15 — dresses, hanbok sets, party wear and everyday outfits. Shop in-store at Jawahar Bazaar, Karur or order online with delivery across Tamil Nadu and India.",
  phone: "+91 9342422170",
  whatsapp: "919342422170",
  // Orders: placing, changing or chasing an order. Support: everything else (sizing, returns, policies).
  ordersEmail: "orders@funkykidz.com",
  supportEmail: "support@funkykidz.com",
  // TODO: replace with the shop's real UPI ID (or set NEXT_PUBLIC_UPI_ID). Customers pay to this.
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "funkykidz@upi",
  upiPayeeName: "FunkyKidz",
  address: {
    street: "Shiva Textiles Backside, Parking Road, Jawahar Bazaar",
    locality: "Karur",
    region: "Tamil Nadu",
    regionCode: "TN",
    postalCode: "639001",
    country: "IN",
  },
  // Approximate coordinates of Jawahar Bazaar, Karur.
  geo: { lat: 10.9601, lng: 78.0766 },
  // TODO: confirm real shop timings before going live.
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:30", closes: "21:30" },
    { days: ["Sunday"], opens: "10:00", closes: "21:00" },
  ],
  priceRange: "₹₹",
  socials: [] as string[],
  areasServed: ["Karur", "Tiruchirappalli", "Namakkal", "Erode", "Dindigul", "Salem", "Coimbatore", "Madurai", "Tamil Nadu", "India"],
};

export const SEO_KEYWORDS = [
  "kids dresses Karur",
  "kids fashion Karur",
  "Karur fashion",
  "kids dress shop in Karur",
  "kids clothing store Karur",
  "baby dress shop Karur",
  "girls party wear Karur",
  "boys dress Karur",
  "Korean fashion",
  "Korean kids fashion",
  "Korean style kids dresses",
  "Korean kids clothes online India",
  "kids hanbok India",
  "fashionable kids dresses",
  "trendy kids wear online",
  "kids dresses online Tamil Nadu",
  "kids wear Jawahar Bazaar",
  "birthday dress for girls",
  "baby frock online",
  "FunkyKidz",
  "Funky Kidz Karur",
];

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const fullAddress = () => {
  const a = SITE.address;
  return `${a.street}, ${a.locality}, ${a.region} ${a.postalCode}`;
};

export const whatsappLink = (text = "Hi FunkyKidz! I'd like to know more about your kids collection.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
