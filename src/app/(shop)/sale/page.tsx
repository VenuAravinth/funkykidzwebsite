import { permanentRedirect } from "next/navigation";

// The sale page has been retired; keep old links and search results landing on the shop.
export default function SalePage() {
  permanentRedirect("/collections");
}
