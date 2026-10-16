import "server-only";
import type { NextRequest } from "next/server";

/** Parsed JSON object body, or {} for anything else (bad JSON, arrays, oversized bodies). */
export async function readBody(req: NextRequest, maxBytes = 64 * 1024): Promise<Record<string, unknown>> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return {};
  const body = await req.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
