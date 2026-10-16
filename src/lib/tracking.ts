// What a customer may see about their own order (no address or payment screenshot).
// Shared by the /api/orders/track route and the Track Order / My Account screens.

export type TrackedStatus = "Processing" | "Packed" | "In Transit" | "Delivered" | "Cancelled";

export type TrackedOrder = {
  orderNumber: string;
  placedAt: string;
  status: TrackedStatus;
  paymentStatus: "Pending Verification" | "Verified" | "Rejected";
  history: { status: string; at: string }[];
  items: { slug: string; name: string; colorwayName: string; size: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export const TRACKING_STEPS: { status: Exclude<TrackedStatus, "Cancelled">; label: string }[] = [
  { status: "Processing", label: "Order placed" },
  { status: "Packed", label: "Packed" },
  { status: "In Transit", label: "Shipped" },
  { status: "Delivered", label: "Delivered" },
];

export const normalizeOrderNumber = (input: string) => input.trim().replace(/^#/, "").replace(/\s/g, "");
// Last 10 digits, so "+91 98765 43210" and "9876543210" match.
export const normalizeMobile = (input: string) => input.replace(/\D/g, "").slice(-10);

export async function fetchTrackedOrder(
  orderNumber: string,
  phone: string,
): Promise<{ order: TrackedOrder } | { error: string }> {
  try {
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = (await res.json().catch(() => ({}))) as { order?: TrackedOrder; error?: string };
    if (res.ok && data.order) return { order: data.order };
    return { error: data.error ?? "Could not look up this order. Please try again." };
  } catch {
    return { error: "You seem to be offline. Check your connection and try again." };
  }
}
