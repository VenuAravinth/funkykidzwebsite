// Single source for shipping and returns facts. Every banner, policy page and JSON-LD block
// reads these, so changing a number here changes it everywhere.
export const FREE_SHIPPING_THRESHOLD = 1999;
export const DELIVERY_FEE = 99;
export const DELIVERY_DAYS = { min: 3, max: 5 }; // business days from order to doorstep
export const RETURN_WINDOW_DAYS = 7;

export function calcDelivery(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
}

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++; // couriers don't deliver on Sunday
  }
  return d;
}

export function deliveryWindow(now = new Date()): { from: Date; to: Date } {
  return { from: addBusinessDays(now, DELIVERY_DAYS.min), to: addBusinessDays(now, DELIVERY_DAYS.max) };
}

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export function deliveryWindowLabel(now = new Date()): string {
  const { from, to } = deliveryWindow(now);
  return `${fmt(from)} – ${fmt(to)}`;
}
