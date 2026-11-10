import "server-only";

// The Google account can exist in Neon Auth without being admitted into
// Poverty Die. Application access must fail closed when the list is empty.
export function isInvitedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
