// Tiny fetch wrapper for the app's own /api routes: JSON in, JSON out, errors as values.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number; body?: Record<string, unknown> };

export async function api<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, status: res.status, error: data?.error ?? "Something went wrong. Please try again.", body: data };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "You seem to be offline. Check your connection and try again." };
  }
}
