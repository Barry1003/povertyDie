/**
 * Avoid open redirects after Google, email sign-in and password recovery.
 * Relative paths only; no protocol-relative URLs, escape sequences or auth API targets.
 */
export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string" || value.length > 600 ||
      !value.startsWith("/") || value.startsWith("//") ||
      value.includes("\\") || /[\u0000-\u001f]/.test(value)) return "/";
  try {
    const parsed = new URL(value, "https://povertydie.invalid");
    if (parsed.origin !== "https://povertydie.invalid" ||
      parsed.pathname.startsWith("/api/") ||
      parsed.pathname.startsWith("/sign-in") ||
      parsed.pathname.startsWith("/sign-up") ||
      parsed.pathname.startsWith("/forgot-password") ||
      parsed.pathname.startsWith("/reset-password")) return "/";
    return parsed.pathname + parsed.search;
  } catch {
    return "/";
  }
}
