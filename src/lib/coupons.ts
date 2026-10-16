// Redeem codes as the browser sees them. Validation and pricing always happen on the server.
export type AppliedCoupon = {
  code: string;
  discount: number; // rupees off the item subtotal
  label: string; // e.g. "₹100 off" or "10% off"
};

/** Upper-case, no spaces: "welcome 100" → "WELCOME100". */
export const normalizeCouponCode = (code: string) => code.toUpperCase().replace(/\s+/g, "").slice(0, 24);

export const COUPON_CODE_PATTERN = /^[A-Z0-9-]{3,24}$/;
