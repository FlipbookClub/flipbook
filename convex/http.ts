import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// CORS — the marketing site is hosted off-Convex (Vercel/Cloudflare). Allow
// any origin for the waitlist endpoint since it's intentionally public.
// Tighten this when we have a stable production marketing domain.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

http.route({
  path: "/waitlist",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

// Public signup count for the landing page's social-proof line. Returns the
// raw row count; the marketing site adds its display offset (see
// components/SignupCount.tsx). No identifiable data leaves here.
http.route({
  path: "/waitlist/count",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const count = await ctx.runQuery(api.waitlist.publicCount, {});
    return json({ count }, 200);
  }),
});

http.route({
  path: "/waitlist/count",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/waitlist",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    if (typeof payload !== "object" || payload === null) {
      return json({ ok: false, error: "invalid_payload" }, 400);
    }
    const body = payload as Record<string, unknown>;

    const email = typeof body.email === "string" ? body.email : "";
    if (!email) {
      return json({ ok: false, error: "missing_email" }, 400);
    }

    const audience: "reader" | "creator" =
      body.audience === "creator" ? "creator" : "reader";

    const qualifier =
      typeof body.qualifier === "string" ? body.qualifier : undefined;
    const creatorLink =
      typeof body.creatorLink === "string" ? body.creatorLink : undefined;
    const source = typeof body.source === "string" ? body.source : undefined;

    const referrer =
      req.headers.get("referer") || req.headers.get("origin") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    // Best-effort client IP. Convex sits behind a proxy, so the first hop
    // in x-forwarded-for is what we want. Hash it so we never store raw IPs.
    const xff = req.headers.get("x-forwarded-for") || "";
    const clientIp = xff.split(",")[0]?.trim();
    const ipHash = clientIp ? await sha256Hex(clientIp) : undefined;

    try {
      const result = await ctx.runMutation(internal.waitlist.recordSignup, {
        email,
        audience,
        qualifier,
        creatorLink,
        source,
        referrer,
        userAgent,
        ipHash,
      });
      return json(
        {
          ok: true,
          isNew: result.isNew,
          audience: result.audience,
        },
        200,
      );
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { code?: string } }).data?.code ?? "unknown")
          : "unknown";
      const status = code === "invalid_email" ? 400 : 500;
      return json({ ok: false, error: code }, status);
    }
  }),
});

export default http;
