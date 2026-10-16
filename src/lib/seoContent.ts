// Search-focused copy for the home page and the Karur / Korean fashion landing pages.
// Written for parents first; keywords appear naturally, never stuffed.

import { SITE } from "./site";

const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const storeHours = SITE.openingHours
  .map((h) => `${h.days.length > 1 ? `${h.days[0]} to ${h.days[h.days.length - 1]}` : h.days[0]} ${to12h(h.opens)} – ${to12h(h.closes)}`)
  .join(", ");

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  {
    q: "Where is the best kids dress shop in Karur?",
    a: "FunkyKidz is located at Shiva Textiles Backside, Parking Road, Jawahar Bazaar, Karur 639001. We stock Korean-style kids dresses, hanbok sets, party frocks and everyday wear for babies up to 15 years.",
  },
  {
    q: "Can I buy FunkyKidz kids dresses online?",
    a: "Yes. You can order online from this website. Pay securely by UPI and we deliver across Tamil Nadu and India in 3–5 business days, with free shipping on orders over ₹1,999.",
  },
  {
    q: "What is Korean kids fashion?",
    a: "Korean kids fashion blends soft pastel colours, clean minimal cuts and playful details like ribbons, puff sleeves and layered sets. It also includes the traditional hanbok, worn for birthdays, Doljanchi (first birthday) and festivals.",
  },
  {
    q: "Which age groups do you have dresses for?",
    a: "We carry sizes from 0–3 months up to 14–15 years for girls and boys. Use our size guide or message us on WhatsApp and our Karur team will help you pick the right fit.",
  },
  {
    q: "Do you deliver kids clothes to Trichy, Erode, Namakkal and Coimbatore?",
    a: "Yes — we ship from Karur to every district in Tamil Nadu, including Trichy, Erode, Namakkal, Dindigul, Salem, Coimbatore and Madurai, and to the rest of India.",
  },
  {
    q: "Can I return or exchange a dress?",
    a: "Unworn items with tags attached can be returned or exchanged within 7 days. Online orders can start a return from our Returns page, or you can exchange in person at our Karur store.",
  },
];

export const KARUR_FAQS: Faq[] = [
  {
    q: "What are the FunkyKidz store timings in Karur?",
    a: `We are open ${storeHours} at Jawahar Bazaar, Karur.`,
  },
  {
    q: "How do I find the FunkyKidz store in Karur?",
    a: "We are on Parking Road, right behind Shiva Textiles in Jawahar Bazaar, Karur 639001. Tap \"Get directions\" on this page to open Google Maps.",
  },
  {
    q: "Do you have birthday and party dresses for girls in Karur?",
    a: "Yes — party frocks, princess hanbok dresses, tutu dresses and festive sets for girls, plus kurta, shirt and hanbok sets for boys. New designs arrive every month.",
  },
  {
    q: "Can I check if a dress is in stock before visiting?",
    a: "Message us on WhatsApp at +91 93424 22170 with the product name or a screenshot and we will confirm sizes and colours available in the store.",
  },
];

export const KOREAN_FAQS: Faq[] = [
  {
    q: "Where can I buy Korean kids clothes online in India?",
    a: "FunkyKidz sells Korean-style kids dresses, hanbok sets, tops, bottoms and accessories online with delivery across India. Prices start under ₹1,000 and you can pay by any UPI app.",
  },
  {
    q: "What is a hanbok for kids?",
    a: "A hanbok is traditional Korean clothing. For girls it is a short jeogori jacket with a full chima skirt; for boys it is a jeogori with baji trousers. Kids wear them for first birthdays, festivals and family photos.",
  },
  {
    q: "Are Korean style dresses comfortable for Indian weather?",
    a: "Our Korean-inspired outfits use breathable cotton and cotton-blend fabrics chosen for the Tamil Nadu climate, so they look festive while staying comfortable all day.",
  },
  {
    q: "Do you have matching Korean outfits for siblings?",
    a: "Yes. Many of our styles come in coordinating colourways for brothers and sisters — perfect for festivals and photoshoots.",
  },
];
