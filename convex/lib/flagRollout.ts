// S0-7. The rule that decides whether a flag is on for one user. Pure, so it
// is tested directly (flags.test.ts) and shared by every caller.

export interface FlagRule {
  enabled: boolean;
  rolloutPercent: number;
  allowUserIds: readonly string[];
}

// FNV-1a, 32-bit. Deterministic on every platform and every Convex release,
// which is all a rollout bucket needs: not cryptographic, just stable.
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// 0..99, fixed for a given user and flag. Including the key means a user in
// the first 10% of one flag is not automatically in the first 10% of the next.
export function rolloutBucket(userId: string, key: string): number {
  return fnv1a(`${key}:${userId}`) % 100;
}

// Out-of-range or non-numeric percentages are read as the nearest sensible
// value rather than trusted: below 0 is 0, above 100 is 100, NaN is 0.
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

// `userId` is null for a caller with no Flipbook account yet: signed out, or
// signed in but not through onboarding. Those callers only get flags rolled
// out to everyone, since there is nothing stable to hash.
export function isFlagOn(rule: FlagRule, key: string, userId: string | null): boolean {
  if (!rule.enabled) return false;
  const percent = clampPercent(rule.rolloutPercent);
  if (userId === null) return percent >= 100;
  if (rule.allowUserIds.includes(userId)) return true;
  return rolloutBucket(userId, key) < percent;
}
