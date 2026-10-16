"use client";

import { useSearchParams } from "next/navigation";

// Names the current view so links like "Girls" or "New Arrivals" clearly land somewhere
// different from plain "Shop All".
export function collectionsTitle(params: URLSearchParams): string {
  const q = params.get("q");
  if (q) return `Results for “${q}”`;
  const parts = [
    params.get("new") === "1" && "New Arrivals",
    params.get("gender")?.split(",").join(" & "),
    params.get("category")?.split(",").join(" & "),
    params.get("age") && `Ages ${params.get("age")!.split(",").map((r) => r.replace(/ Years$/, "")).join(", ")}`,
  ].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return params.get("sort") === "popularity" ? "Best Sellers" : "Shop All";
}

export default function CollectionsHeading() {
  const params = useSearchParams();
  return <>{collectionsTitle(new URLSearchParams(params.toString()))}</>;
}
