// Browser-only: shrinks a photo before upload so phone-camera images (often 5–12 MB) become a
// few hundred KB, keeping uploads fast on mobile data. Never upscales.
export async function resizeImage(file: File, maxSide: number, quality = 0.86): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Could not encode image");
  return blob;
}

/** POSTs a file as the raw request body. Returns the parsed JSON or an error message. */
export async function uploadRaw<T>(url: string, body: Blob, contentType: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", body, headers: { "Content-Type": contentType }, credentials: "same-origin" });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "Upload failed. Please try again." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Upload failed. Check your connection and try again." };
  }
}
