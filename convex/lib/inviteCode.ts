// Crockford-style base32 without I, O, 0, 1 to avoid OCR/typing confusion.
// 6 chars from a 32-symbol alphabet → 32^6 ≈ 1 billion permutations, plenty
// of headroom for the MVP. Caller is responsible for retrying on collision.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateInviteCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
