import "server-only";
import { listOrders, ORDER_STATUSES, type StoredOrder } from "./orderStore";

// Revenue only counts orders that weren't cancelled and whose payment wasn't rejected.
const counts = (o: StoredOrder) => o.status !== "Cancelled" && o.paymentStatus !== "Rejected";

const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD in IST

export async function getAnalytics(days = 30) {
  const orders = await listOrders();
  const valid = orders.filter(counts);

  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const verifiedRevenue = valid.filter((o) => o.paymentStatus === "Verified").reduce((s, o) => s + o.total, 0);
  const units = valid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

  // Daily series for the last N days (IST), zero-filled.
  const today = new Date();
  const series: { date: string; revenue: number; orders: number }[] = [];
  const index = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    index.set(dayKey(d), series.length);
    series.push({ date: dayKey(d), revenue: 0, orders: 0 });
  }
  for (const o of valid) {
    const i = index.get(dayKey(new Date(o.placedAt)));
    if (i !== undefined) {
      series[i].revenue += o.total;
      series[i].orders += 1;
    }
  }
  const half = Math.floor(days / 2);
  const recent = series.slice(half).reduce((s, d) => s + d.revenue, 0);
  const prior = series.slice(0, half).reduce((s, d) => s + d.revenue, 0);

  const productMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of valid) {
    for (const i of o.items) {
      const p = productMap.get(i.slug) ?? { name: i.name, units: 0, revenue: 0 };
      p.units += i.quantity;
      p.revenue += i.quantity * i.unitPrice;
      productMap.set(i.slug, p);
    }
  }

  const cityMap = new Map<string, number>();
  for (const o of valid) {
    const city = o.address.city.trim() || "Unknown";
    cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
  }

  return {
    totals: {
      orders: orders.length,
      revenue,
      verifiedRevenue,
      avgOrderValue: valid.length ? Math.round(revenue / valid.length) : 0,
      units,
      pendingVerification: orders.filter((o) => o.paymentStatus === "Pending Verification" && o.status !== "Cancelled").length,
      toShip: orders.filter((o) => o.status === "Processing" || o.status === "Packed").length,
      uniqueCustomers: new Set(orders.map((o) => o.phone)).size,
      trendPct: prior > 0 ? Math.round(((recent - prior) / prior) * 100) : null,
    },
    series,
    byStatus: ORDER_STATUSES.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length })),
    topProducts: [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    topCities: [...cityMap.entries()].map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    recentOrders: [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 6),
  };
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
