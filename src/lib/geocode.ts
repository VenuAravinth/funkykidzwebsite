export type ReverseGeocodeResult = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;

    const data: { display_name?: string; address?: NominatimAddress } = await res.json();
    const addr = data.address ?? {};

    return {
      line1: [addr.house_number, addr.road].filter(Boolean).join(" ") || data.display_name?.split(",")[0] || "",
      city: addr.city || addr.town || addr.village || addr.suburb || "",
      state: addr.state || "",
      postalCode: addr.postcode || "",
      country: addr.country || "",
    };
  } catch {
    return null;
  }
}
