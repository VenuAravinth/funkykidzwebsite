import { NextResponse, type NextRequest } from "next/server";
import { adminEnv, isAdminConfigured } from "@/server/env";
import { COOKIE, cookieOptions, isValidAccessKey, signToken, verifyToken, type GateToken, type SessionToken } from "@/server/tokens";

// Outer wall of the admin area (inner checks still run in every admin page and API):
//   1. Admin URLs exist only on ADMIN_HOST (when set) — the public storefront domain returns 404.
//   2. Nobody sees anything until they open  /admin?key=<ADMIN_ACCESS_KEY>  once. A correct key
//      sets a signed, httpOnly "gate" cookie and redirects to the login page with the key removed
//      from the address bar. Wrong / missing key → the normal 404 page, so the area looks absent.
//   3. Past the gate, every page except login needs a signed session cookie.

const GATE_HOURS = 12;
const AUTH_API = "/api/admin/auth/";

// Small in-memory brake on key guessing per IP.
const keyFailures = new Map<string, { count: number; first: number }>();
const KEY_FAIL_LIMIT = 10;
const KEY_FAIL_WINDOW = 60 * 60_000;

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/") || p === "/api/admin" || p.startsWith("/api/admin/");

function hostOf(req: NextRequest) {
  return (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

function securityHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return res;
}

function notFound(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Render the site's ordinary 404 page — indistinguishable from any other missing URL.
  return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const onAdminHost = Boolean(adminEnv.host) && hostOf(req) === adminEnv.host;

  if (!isAdminPath(pathname)) {
    // The admin domain serves nothing but the admin area.
    if (onAdminHost) {
      if (pathname === "/" && searchParams.has("key")) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      return notFound(req);
    }
    return NextResponse.next();
  }

  if (!isAdminConfigured()) return notFound(req);
  if (adminEnv.host && !onAdminHost) return notFound(req);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  // --- 1. Access-key gate -------------------------------------------------
  const key = searchParams.get("key");
  if (key !== null) {
    const fails = keyFailures.get(ip);
    const blocked = fails && Date.now() - fails.first < KEY_FAIL_WINDOW && fails.count >= KEY_FAIL_LIMIT;
    if (blocked || !isValidAccessKey(key)) {
      if (!blocked) {
        const fresh = !fails || Date.now() - fails.first >= KEY_FAIL_WINDOW;
        keyFailures.set(ip, fresh ? { count: 1, first: Date.now() } : { count: fails.count + 1, first: fails.first });
      }
      return notFound(req);
    }
    keyFailures.delete(ip);
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const res = NextResponse.redirect(url);
    const maxAge = GATE_HOURS * 3600;
    res.cookies.set(COOKIE.gate, signToken({ typ: "gate", exp: Date.now() + maxAge * 1000 }), cookieOptions(maxAge));
    return securityHeaders(res);
  }

  if (!verifyToken<GateToken>(req.cookies.get(COOKIE.gate)?.value, "gate")) return notFound(req);

  // --- 2. Session check ---------------------------------------------------
  const isLogin = pathname === "/admin/login" || pathname.startsWith(AUTH_API);
  const hasSession = Boolean(verifyToken<SessionToken>(req.cookies.get(COOKIE.session)?.value, "session"));

  if (!isLogin && !hasSession) {
    if (pathname.startsWith("/api/")) return securityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return securityHeaders(NextResponse.redirect(url));
  }

  if (pathname === "/admin") {
    const url = req.nextUrl.clone();
    url.pathname = hasSession ? "/admin/dashboard" : "/admin/login";
    return securityHeaders(NextResponse.redirect(url));
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  // Runs on everything except static assets so the admin host can refuse storefront pages.
  // Review uploads skip it so customer videos aren't cut off by the proxy's 10 MB body buffer;
  // that route checks the customer session itself and isn't part of the admin area.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|api/reviews/media).*)"],
};
