// P5-T5. Signed unsubscribe links.
//
// The person clicking an unsubscribe link is, by definition, not signed in —
// they are in a mail client. So the link itself has to carry its authority,
// and it must not be guessable: a bare ?user=<id> would let anyone unsubscribe
// anyone whose id they could enumerate.
//
// Each link carries an HMAC over "<userId>:<pref>", so a signature is only
// valid for that user and that specific preference. No expiry: an unsubscribe
// link that has gone stale is worse than one that lasts, because the failure
// mode is mail someone asked to stop receiving.
//
// EMAIL_UNSUB_SECRET must be set on the deployment. Without it the send path
// throws rather than mailing an unsubscribe link that cannot be honoured.
//   npx convex env set EMAIL_UNSUB_SECRET "$(openssl rand -hex 32)" --prod

export type EmailPrefKey = "weeklyDigest" | "progressNote";

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const secret = process.env.EMAIL_UNSUB_SECRET;
  if (!secret) {
    throw new Error("[email] EMAIL_UNSUB_SECRET not set on this deployment.");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(mac);
}

export async function unsubscribeToken(
  userId: string,
  pref: EmailPrefKey,
): Promise<string> {
  return sign(`${userId}:${pref}`);
}

// Constant-time compare, so a timing signal cannot be used to hunt for a
// valid signature one byte at a time.
export async function verifyUnsubscribeToken(
  userId: string,
  pref: EmailPrefKey,
  token: string,
): Promise<boolean> {
  const expected = await sign(`${userId}:${pref}`);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export async function unsubscribeUrl(
  userId: string,
  pref: EmailPrefKey,
): Promise<string> {
  // CONVEX_SITE_URL is the deployment's public HTTP-action origin, which is
  // where convex/http.ts serves the endpoint from.
  const base = process.env.CONVEX_SITE_URL ?? "";
  const token = await unsubscribeToken(userId, pref);
  return `${base}/email/unsubscribe?u=${encodeURIComponent(userId)}&p=${pref}&k=${token}`;
}
