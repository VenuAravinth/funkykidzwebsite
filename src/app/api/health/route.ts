import { connection } from "next/server";
import { getDb } from "@/server/db";
import pkg from "../../../../package.json";

// GET /api/health — for uptime monitors. Checks the shop's own MongoDB and the ERP Backend that
// serves the product catalogue. 200 when everything answers; 503 when the database is down
// ("down") or the catalogue backend is unreachable ("degraded"). Never exposes hosts or secrets.

const TIMEOUT_MS = 3000;

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

const elapsed = (started: number) => Math.round(performance.now() - started);

async function checkDatabase() {
  const started = performance.now();
  try {
    // The first connection also prepares indexes, so allow it a little longer.
    const db = await timeout(getDb(), TIMEOUT_MS * 2);
    await timeout(db.command({ ping: 1 }), TIMEOUT_MS);
    return { status: "up" as const, database: db.databaseName, latencyMs: elapsed(started) };
  } catch (err) {
    const reason = err instanceof Error && err.message === "timeout" ? "No answer in time" : "Connection failed";
    return { status: "down" as const, error: reason, latencyMs: elapsed(started) };
  }
}

async function checkCatalogBackend() {
  const base = process.env.ERP_API_URL?.trim().replace(/\/+$/, "");
  if (!base) return { status: "not_configured" as const };
  const started = performance.now();
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const body = (await res.json().catch(() => null)) as { status?: string } | null;
    return { status: res.ok ? ("up" as const) : ("down" as const), reported: body?.status ?? null, latencyMs: elapsed(started) };
  } catch {
    return { status: "down" as const, error: "Unreachable", latencyMs: elapsed(started) };
  }
}

export async function GET() {
  await connection(); // always run at request time, never prerendered
  const [database, catalogBackend] = await Promise.all([checkDatabase(), checkCatalogBackend()]);
  const status = database.status !== "up" ? "down" : catalogBackend.status === "up" ? "ok" : "degraded";

  return Response.json(
    {
      status,
      service: "funkykidz-website",
      version: pkg.version,
      environment: process.env.NODE_ENV === "production" ? "production" : "development",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        server: { status: "up" },
        database,
        catalogBackend,
      },
    },
    { status: status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
