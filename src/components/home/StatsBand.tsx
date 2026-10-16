import { Stagger, StaggerItem } from "@/components/Stagger";
import { getProducts } from "@/server/catalog";
import { DELIVERY_DAYS, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";

// Only figures the site can back up. Add a customer count here once you have real order data.

export default async function StatsBand() {
  const count = (await getProducts()).length;
  const STATS = [
  { value: String(count), label: "Styles online", note: "Korean-inspired designs" },
  { value: "0–15", label: "Years", note: "Sizes for babies to teens" },
  { value: `${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max}`, label: "Day delivery", note: "Across Tamil Nadu & India" },
  { value: String(RETURN_WINDOW_DAYS), label: "Day returns", note: "Unworn with tags" },
];
  return (
    <section className="relative overflow-hidden bg-plum py-14 text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(231,138,155,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(224,164,92,0.18),transparent_45%)]" />
      <Stagger className="relative mx-auto grid max-w-[1300px] grid-cols-2 gap-y-10 px-6 md:grid-cols-4 md:px-12">
        {STATS.map((s) => (
          <StaggerItem key={s.label} className="border-white/10 text-center md:border-l md:first:border-l-0">
            <p className="font-serif-display text-4xl font-bold md:text-5xl">{s.value}</p>
            <p className="mt-2 text-sm font-semibold tracking-wide text-rose-light">{s.label}</p>
            <p className="mt-1 text-xs text-white/50">{s.note}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
