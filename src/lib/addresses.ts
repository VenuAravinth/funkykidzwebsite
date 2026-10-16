export type AddressLabel = "Home" | "Office" | "Other";

export type Address = {
  id: string;
  userId: string;
  label: AddressLabel;
  customLabel?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null; // optional map pin
  lng: number | null;
  isDefault: boolean;
};

export function addressLabelText(address: Pick<Address, "label" | "customLabel">): string {
  if (address.label === "Other" && address.customLabel?.trim()) return address.customLabel.trim();
  return address.label;
}

export function formatAddress(address: Address): string {
  return [address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`, address.country]
    .filter(Boolean)
    .join(", ");
}
