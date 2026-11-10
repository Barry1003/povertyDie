/**
 * Financial quantities are stored as PostgreSQL NUMERIC(18,2) strings.
 * Parse and add integer kobo; never use floating point for accounting math.
 */
export function toKobo(value: string): bigint {
  if (!/^(0|[1-9]\d{0,15})(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Invalid decimal money value");
  }
  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fractional.padEnd(2, "0"));
}

export function koboToDecimal(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  return `${sign}${abs / 100n}.${String(abs % 100n).padStart(2, "0")}`;
}

export function formatNaira(value: string | bigint): string {
  const amount = typeof value === "bigint" ? value : toKobo(value);
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const whole = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractional = (abs % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}₦${whole}.${fractional}`;
}

export function normalizeAmount(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value)) return null;
  const kobo = toKobo(value);
  if (kobo < 100n || kobo > 1_000_000_000_00n) return null;
  return koboToDecimal(kobo);
}
