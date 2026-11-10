import "server-only";

// Email allowlisting was intentionally removed.
// Every Google account may authenticate through Neon Auth.
// When live group-finance routes are implemented, authorize them by
// memberships (groupId + userId + role), never by email domain or sign-in.
export {};
