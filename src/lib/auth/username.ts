/**
 * Canonical, case-insensitive *display identity*. Neon Auth owns credentials.
 * Username is not a password or a substitute for the Neon Auth user ID.
 */
const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,23}$/;

const RESERVED = new Set([
  "admin", "administrator", "api", "auth", "billing", "dashboard", "finance",
  "group", "help", "investment", "login", "logout", "me", "neon", "official",
  "owner", "password", "povertydie", "reset", "root", "security", "settings",
  "sign_in", "sign_up", "signin", "signup", "staff", "support", "system", "team",
  "vercel", "verified",
]);

export function canonicalUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(normalized) || RESERVED.has(normalized)) return null;
  return normalized;
}

export function usernameError(value: unknown): string | null {
  if (typeof value !== "string") return "Enter a username";
  if (!/^[a-z][a-z0-9_]{2,23}$/.test(value.trim().toLowerCase()))
    return "Use 3–24 characters, starting with a letter, using only letters, numbers or underscores";
  if (RESERVED.has(value.trim().toLowerCase())) return "That username is reserved";
  return null;
}
