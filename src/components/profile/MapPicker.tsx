"use client";

import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiCrosshair } from "react-icons/fi";
import { SITE } from "@/lib/site";

// Opens on the shop's town until the customer pins their own spot.
const DEFAULT_CENTER: [number, number] = [SITE.geo.lat, SITE.geo.lng];

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="font-size:32px;line-height:32px;transform:translate(-50%,-92%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">📍</div>',
  iconSize: [0, 0],
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  height = 260,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number | string;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [locating, setLocating] = useState(false);
  const hasPin = lat !== null && lng !== null;
  const center: [number, number] = hasPin ? [lat, lng] : DEFAULT_CENTER;

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        mapRef.current?.flyTo([latitude, longitude], 16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-plum/15">
      <MapContainer
        center={center}
        zoom={hasPin ? 16 : 13}
        scrollWheelZoom
        ref={mapRef}
        style={{ height, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onChange} />
        {hasPin && (
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as L.Marker;
                const pos = marker.getLatLng();
                onChange(pos.lat, pos.lng);
              },
            }}
          />
        )}
      </MapContainer>

      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-plum shadow-md transition-colors hover:text-rose-dark disabled:opacity-60"
      >
        <FiCrosshair /> {locating ? "Locating…" : "Use my location"}
      </button>

      {!hasPin && (
        <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink/60 shadow-sm">
          Tap the map to drop a pin
        </div>
      )}
    </div>
  );
}
