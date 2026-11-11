/**
 * Deterministic rotating custody schedule. Membership ordering must be
 * stable (joinedAt, userId); the next period advances one eligible member.
 * This helper is pure: it does not grant privileges or transfer any money.
 */
export type CustodyMember = {
  userId: string;
  joinedAt: string;
};

export function nextCustodian(
  roster: CustodyMember[],
  previousCustodianId: string | null,
): string {
  if (!Array.isArray(roster) || roster.length === 0) {
    throw new Error("At least one group member must exist");
  }

  const seen = new Set<string>();
  for (const m of roster) {
    if (!m.userId || seen.has(m.userId) || !Number.isFinite(Date.parse(m.joinedAt))) {
      throw new Error("Invalid group membership list");
    }
    seen.add(m.userId);
  }

  const ordered = [...roster].sort(
    (a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt) ||
      a.userId.localeCompare(b.userId),
  );
  const previous = ordered.findIndex(member => member.userId === previousCustodianId);
  return ordered[(previous + 1) % ordered.length].userId;
}

export function validPeriod(value: unknown): value is string {
  return typeof value === "string" && /^20\d{2}-(0[1-9]|1[0-2])$/.test(value);
}

export function currentPeriod(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function nextPeriod(month: string): string {
  if (!validPeriod(month)) throw new Error("Invalid custody period");
  const [year, number] = month.split("-").map(Number);
  return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, "0")}`;
}
