// Marketing → Convex bridge. The /waitlist HTTP endpoint
// (convex/http.ts) is CORS-open and accepts:
//   { email, audience: "reader"|"creator", qualifier?, creatorLink?, source? }
// Responses:
//   200 { ok: true, isNew: boolean, audience }
//   400 { ok: false, error: "invalid_email"|"missing_email"|"invalid_payload" }
//   500 { ok: false, error: string }
//
// The convex site URL is injected at build time via NEXT_PUBLIC_CONVEX_SITE_URL.

export type WaitlistAudience = "reader" | "creator";

export interface WaitlistPayload {
  email: string;
  audience: WaitlistAudience;
  qualifier?: string;
  creatorLink?: string;
  source?: string;
}

export type WaitlistResult =
  | { ok: true; isNew: boolean; audience: WaitlistAudience }
  | { ok: false; code: WaitlistErrorCode; message: string };

export type WaitlistErrorCode =
  | "invalid_email"
  | "missing_email"
  | "invalid_payload"
  | "network"
  | "config"
  | "unknown";

const ERROR_COPY: Record<WaitlistErrorCode, string> = {
  invalid_email: "That email doesn't look right — mind checking it?",
  missing_email: "An email helps us send the invite.",
  invalid_payload: "Couldn't reach the list right now. Try again in a moment?",
  network: "Couldn't reach the list right now. Try again in a moment?",
  config: "The list isn't open yet. Check back in a minute.",
  unknown: "Couldn't reach the list right now. Try again in a moment?",
};

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResult> {
  const base = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!base) {
    return { ok: false, code: "config", message: ERROR_COPY.config };
  }

  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, "")}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, code: "network", message: ERROR_COPY.network };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    return { ok: false, code: "unknown", message: ERROR_COPY.unknown };
  }

  if (res.ok && isOkBody(body)) {
    return { ok: true, isNew: body.isNew, audience: body.audience };
  }

  const code = isErrorBody(body) ? body.error : "unknown";
  const normalized: WaitlistErrorCode =
    code === "invalid_email" ||
    code === "missing_email" ||
    code === "invalid_payload"
      ? code
      : "unknown";
  return { ok: false, code: normalized, message: ERROR_COPY[normalized] };
}

function isOkBody(b: unknown): b is { ok: true; isNew: boolean; audience: WaitlistAudience } {
  return (
    typeof b === "object" &&
    b !== null &&
    (b as { ok?: unknown }).ok === true &&
    typeof (b as { isNew?: unknown }).isNew === "boolean"
  );
}

function isErrorBody(b: unknown): b is { ok: false; error: string } {
  return (
    typeof b === "object" &&
    b !== null &&
    (b as { ok?: unknown }).ok === false &&
    typeof (b as { error?: unknown }).error === "string"
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateEmail(value: string): WaitlistErrorCode | null {
  const trimmed = value.trim();
  if (!trimmed) return "missing_email";
  if (!EMAIL_RE.test(trimmed)) return "invalid_email";
  return null;
}

export function copyForError(code: WaitlistErrorCode): string {
  return ERROR_COPY[code];
}
