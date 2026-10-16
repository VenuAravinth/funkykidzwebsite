export type TrackingStage = "Order Placed" | "Order Packed" | "In Transit" | "Out for Delivery";

export type OrderStatus = "Processing" | "Packed" | "In Transit" | "Delivered";

export type OrderItem = {
  slug: string;
  colorwayName: string;
  size: string;
  quantity: number;
};

export type Order = {
  orderNumber: string;
  phone: string;
  placedDate: string;
  deliveredDate: string | null;
  status: OrderStatus;
  currentStage: number;
  stageDates: (string | null)[];
  items: OrderItem[];
  discount: number;
  deliveryFee: number;
};

// Labels shown on the shipping page and the tracking timeline.
export const TRACKING_STAGES: TrackingStage[] = ["Order Placed", "Order Packed", "In Transit", "Out for Delivery"];
