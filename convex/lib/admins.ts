// Hardcoded admin allow-list. For MVP this is just the founder so that
// rare ops like DMCA takedowns can be performed without a full admin UI.
// Replace with a real role system if/when there's more than one admin.
//
// Emails are normalized to lowercase before comparison.

const ADMIN_EMAILS = new Set([
  "everytalentdeveloper@gmail.com",
  "vikmoks01@gmail.com",
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
