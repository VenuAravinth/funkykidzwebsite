import "server-only";
import { ObjectId } from "mongodb";
import type { Address, AddressLabel } from "@/lib/addresses";
import { collections, type AddressDoc } from "./db";
import { str } from "./http";

const LABELS: AddressLabel[] = ["Home", "Office", "Other"];

export const toAddress = (d: AddressDoc): Address => ({
  id: d._id.toHexString(),
  userId: d.userId.toHexString(),
  label: d.label,
  customLabel: d.customLabel,
  recipientName: d.recipientName,
  phone: d.phone,
  line1: d.line1,
  line2: d.line2,
  city: d.city,
  state: d.state,
  postalCode: d.postalCode,
  country: d.country,
  lat: d.lat,
  lng: d.lng,
  isDefault: d.isDefault,
});

const coord = (v: unknown, limit: number) => (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit ? v : null);

export function validateAddress(body: Record<string, unknown>) {
  const label = LABELS.includes(body.label as AddressLabel) ? (body.label as AddressLabel) : "Home";
  const fields = {
    label,
    customLabel: label === "Other" ? str(body.customLabel, 40) || undefined : undefined,
    recipientName: str(body.recipientName, 100),
    phone: str(body.phone, 20).replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""),
    line1: str(body.line1, 200),
    line2: str(body.line2, 200) || undefined,
    city: str(body.city, 80),
    state: str(body.state, 80),
    postalCode: str(body.postalCode, 12),
    country: str(body.country, 60) || "India",
    lat: coord(body.lat, 90),
    lng: coord(body.lng, 180),
  };
  if (!fields.recipientName || !fields.line1 || !fields.city || !fields.state) return { error: "Please fill in the full address." } as const;
  if (!/^[6-9]\d{9}$/.test(fields.phone)) return { error: "Please enter a valid 10-digit mobile number." } as const;
  if (!/^\d{6}$/.test(fields.postalCode)) return { error: "Please enter a valid 6-digit PIN code." } as const;
  return { fields } as const;
}

export async function listAddresses(userId: ObjectId): Promise<Address[]> {
  const { addresses } = await collections();
  return (await addresses.find({ userId }).sort({ isDefault: -1, createdAt: 1 }).limit(50).toArray()).map(toAddress);
}

export const parseId = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null);
