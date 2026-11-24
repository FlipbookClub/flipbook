// S0-9. What a development build is talking to, worked out from values that
// are safe to show (a key's prefix, never the key). Shown by
// DevEnvironmentBadge in Flipbook Dev only, and checked by the Maestro smoke
// flow before it signs in, so the flow can never run against production.
//
// Why the Clerk key is the check: a development Convex deployment only accepts
// sign-ins from the development Clerk instance (CLERK_JWT_ISSUER_DOMAIN), and
// production only from the production one. A `pk_test_` key therefore means
// this build cannot sign in to production at all.

export type ClerkInstance = "test" | "live" | "unknown";

export function clerkInstance(publishableKey: string | undefined): ClerkInstance {
  if (!publishableKey) return "unknown";
  if (publishableKey.startsWith("pk_test_")) return "test";
  if (publishableKey.startsWith("pk_live_")) return "live";
  return "unknown";
}

export interface DevEnvironment {
  env: string;
  clerk: ClerkInstance;
  // True only when both say development.
  safeForTests: boolean;
}

export function describeDevEnvironment(
  publicEnv: string | undefined,
  publishableKey: string | undefined,
): DevEnvironment {
  const env = publicEnv && publicEnv.length > 0 ? publicEnv : "unset";
  const clerk = clerkInstance(publishableKey);
  return { env, clerk, safeForTests: env === "development" && clerk === "test" };
}

// The badge's text. The smoke flow matches on "Clerk test" and "development",
// so keep those words if this changes.
export function devEnvironmentLabel(d: DevEnvironment): string {
  return `Flipbook Dev · ${d.env} · Clerk ${d.clerk}`;
}
