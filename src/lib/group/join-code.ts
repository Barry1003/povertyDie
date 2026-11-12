import { randomBytes } from "node:crypto";

// 32 unambiguous characters. Twelve random characters provide 60 bits of entropy.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const GROUP_JOIN_CODE_LENGTH = 12;

export function generateGroupJoinCode(): string {
  return Array.from(randomBytes(GROUP_JOIN_CODE_LENGTH), byte => ALPHABET[byte & 31]).join("");
}

export function normalizeGroupJoinCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toUpperCase();
  // Legacy groups are backfilled from cryptographic UUIDs (including 0/1).
  return /^[A-Z0-9]{12}$/.test(value) ? value : null;
}
