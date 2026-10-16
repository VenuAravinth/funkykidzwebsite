import { Readable } from "node:stream";
import { ObjectId } from "mongodb";
import { currentUser } from "@/server/customerAuth";
import { findMedia, mediaBucket } from "@/server/media";

// Serves an uploaded photo or video. Product and published review media are public; a review
// draft's uploads are visible only to the customer writing it. Supports Range requests so
// videos can seek and play on iOS Safari.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return new Response(null, { status: 404 });
  const file = await findMedia(new ObjectId(id));
  const meta = file?.metadata as { kind?: string; userId?: string; contentType?: string } | undefined;
  if (!file || !meta?.contentType) return new Response(null, { status: 404 });

  const isPublic = meta.kind === "product" || meta.kind === "review";
  if (!isPublic) {
    const user = await currentUser();
    if (!user || user._id.toHexString() !== meta.userId) return new Response(null, { status: 404 });
  }

  const size = file.length;
  const headers: Record<string, string> = {
    "Content-Type": meta.contentType,
    "Accept-Ranges": "bytes",
    // File ids never change content, so cache aggressively (privately for drafts).
    "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  const bucket = await mediaBucket();
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    start = Math.max(0, start);
    const stream = bucket.openDownloadStream(file._id, { start, end: end + 1 });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = bucket.openDownloadStream(file._id);
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers: { ...headers, "Content-Length": String(size) } });
}
