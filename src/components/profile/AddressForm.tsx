"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { FiHome, FiBriefcase, FiMapPin, FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { useAddresses } from "@/context/AddressContext";
import { reverseGeocode } from "@/lib/geocode";
import type { Address, AddressLabel } from "@/lib/addresses";
import { DEFAULT_CUSTOMER_NAME } from "@/lib/auth";
import { SITE } from "@/lib/site";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[55vh] max-h-[460px] min-h-[300px] place-items-center rounded-xl border border-plum/15 bg-cream/40 text-sm text-ink/40">
      Loading map…
    </div>
  ),
});

const LABELS: { value: AddressLabel; icon: typeof FiHome }[] = [
  { value: "Home", icon: FiHome },
  { value: "Office", icon: FiBriefcase },
  { value: "Other", icon: FiMapPin },
];

type FormState = {
  label: AddressLabel;
  customLabel: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
};

function toFormState(address?: Address, fallbackName?: string, fallbackPhone?: string): FormState {
  if (address) {
    return {
      label: address.label,
      customLabel: address.customLabel ?? "",
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      lat: address.lat,
      lng: address.lng,
    };
  }
  return {
    label: "Home",
    customLabel: "",
    // The placeholder name isn't a real recipient, so leave the field for the customer.
    recipientName: fallbackName && fallbackName !== DEFAULT_CUSTOMER_NAME ? fallbackName : "",
    phone: fallbackPhone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    lat: null,
    lng: null,
  };
}

export default function AddressForm({
  userId,
  fallbackName,
  fallbackPhone,
  existing,
  onSaved,
  onCancel,
}: {
  userId: string;
  fallbackName?: string;
  fallbackPhone?: string;
  existing?: Address;
  onSaved: (address: Address) => void;
  onCancel: () => void;
}) {
  const { addAddress, updateAddress } = useAddresses();
  const [form, setForm] = useState<FormState>(() => toFormState(existing, fallbackName, fallbackPhone));
  const [error, setError] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  // New addresses start by pinning the spot on the map; edits go straight to the details.
  const [step, setStep] = useState<"map" | "details">(existing ? "details" : "map");
  // Where the pin sits on the map step, before it's confirmed into the form.
  const [pin, setPin] = useState<{ lat: number; lng: number }>(() =>
    existing?.lat != null && existing.lng != null ? { lat: existing.lat, lng: existing.lng } : { lat: SITE.geo.lat, lng: SITE.geo.lng }
  );

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Confirm Location: lock in the pin and fill the area, city, state and PIN code from it.
  async function confirmLocation() {
    setError("");
    setGeocoding(true);
    const result = await reverseGeocode(pin.lat, pin.lng);
    setGeocoding(false);
    setForm((prev) => ({
      ...prev,
      lat: pin.lat,
      lng: pin.lng,
      line2: result?.line1 || prev.line2,
      city: result?.city || prev.city,
      state: result?.state || prev.state,
      postalCode: result?.postalCode?.replace(/\s/g, "") || prev.postalCode,
      country: result?.country || prev.country,
    }));
    setStep("details");
  }

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.label === "Other" && !form.customLabel.trim()) {
      setError("Please give this location a name, e.g. \"Grandma's House\".");
      return;
    }
    if (!form.recipientName.trim() || !form.phone.trim()) {
      setError("Please add a recipient name and phone number.");
      return;
    }
    if (!form.line1.trim()) {
      setError("Please add your house / flat number and building.");
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
      setError("Please fill in the full address.");
      return;
    }
    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const input = {
      label: form.label,
      customLabel: form.label === "Other" ? form.customLabel.trim() : undefined,
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim() || "India",
      lat: form.lat,
      lng: form.lng,
    };

    setSaving(true);
    const result = existing ? await updateAddress(existing.id, input) : await addAddress(userId, input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.address);
  }

  if (step === "map") {
    return (
      <div className="rounded-2xl border border-rose-light/60 bg-white p-4 shadow-sm sm:p-6 md:p-8">
        <h3 className="font-serif-display text-xl font-bold text-plum">{existing ? "Change Location" : "Add New Address"}</h3>
        <p className="mt-1 text-sm text-ink/55">
          Tap the map or drag the pin to your exact delivery spot, or use your current location. Then confirm.
        </p>
        <div className="mt-4">
          <MapPicker lat={pin.lat} lng={pin.lng} onChange={(lat, lng) => setPin({ lat, lng })} height="min(55vh, 460px)" />
        </div>
        <p className="mt-2 text-[11px] text-ink/40">
          Pinned at {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={existing ? () => setStep("details") : onCancel}
            className="rounded-full border border-plum/15 px-7 py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-rose-dark hover:text-rose-dark"
          >
            {existing ? "Back" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={confirmLocation}
            disabled={geocoding}
            className="flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:opacity-60 sm:ml-auto"
          >
            <FiMapPin /> {geocoding ? "Finding address…" : "Confirm Location"}
          </button>
        </div>
        {!existing && (
          <button type="button" onClick={() => setStep("details")} className="mt-4 text-xs font-semibold text-ink/45 underline underline-offset-4 hover:text-rose-dark">
            Map not working? Enter the address manually
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">
        {existing ? "Edit Address" : "Add New Address"}
      </h3>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-plum/10 bg-cream/40 px-4 py-3">
        {form.lat !== null && form.lng !== null ? (
          <>
            <FiCheckCircle className="shrink-0 text-lg text-emerald-600" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-plum">Location confirmed on map</p>
              <p className="truncate text-xs text-ink/50">
                {[form.line2, form.city].filter(Boolean).join(", ") || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
              </p>
            </div>
          </>
        ) : (
          <>
            <FiMapPin className="shrink-0 text-lg text-rose-dark" />
            <p className="min-w-0 text-sm text-ink/60">No map location yet. Pinning it helps our delivery partner find you.</p>
          </>
        )}
        <button
          type="button"
          onClick={() => setStep("map")}
          className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-semibold text-rose-dark hover:underline"
        >
          <FiEdit2 /> {form.lat !== null ? "Change" : "Pin on map"}
        </button>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
          Save As
        </label>
        <div className="flex gap-2">
          {LABELS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("label", value)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                form.label === value
                  ? "border-rose-dark bg-rose-light/50 text-rose-dark"
                  : "border-plum/15 text-ink/60 hover:border-rose-dark/50"
              }`}
            >
              <Icon /> {value}
            </button>
          ))}
        </div>
        {form.label === "Other" && (
          <input
            type="text"
            value={form.customLabel}
            onChange={(e) => update("customLabel", e.target.value)}
            placeholder="Label this location, e.g. Grandma's House"
            className="mt-3 w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Recipient Name
          </label>
          <input
            required
            type="text"
            autoComplete="name"
            value={form.recipientName}
            onChange={(e) => update("recipientName", e.target.value)}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Phone</label>
          <input
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
          House / Flat No., Building
        </label>
        <input
          required
          type="text"
          autoComplete="address-line1"
          value={form.line1}
          onChange={(e) => update("line1", e.target.value)}
          placeholder="e.g. 12B, Lakshmi Apartments"
          className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
        />
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
          Street, Area / Landmark
        </label>
        <input
          type="text"
          autoComplete="address-line2"
          value={form.line2}
          onChange={(e) => update("line2", e.target.value)}
          placeholder="Street, area or nearby landmark"
          className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">City</label>
          <input
            required
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            State
          </label>
          <input
            required
            type="text"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            PIN Code
          </label>
          <input
            required
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-dark"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-rose-dark">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-rose disabled:opacity-60 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          {saving ? "Saving…" : existing ? "Save Changes" : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-plum/15 px-7 py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-rose-dark hover:text-rose-dark"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
