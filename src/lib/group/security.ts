import "server-only";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { memberships, profiles } from "@/db/schema";

export type Viewer = {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
};

export async function getViewer(): Promise<Viewer | null> {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  const name = (user.name || user.email.split("@")[0] || "Member").slice(0, 100);
  const email = user.email.trim().toLowerCase();

  // Profile data is derived from a verified Neon session only, never a browser body.
  await db.insert(profiles).values({
    userId: user.id, displayName: name, email, avatarSeed: user.id,
  }).onConflictDoUpdate({
    target: profiles.userId,
    set: { displayName: name, email, updatedAt: new Date() },
  });

  return { id: user.id, name, email, avatarSeed: user.id };
}

export async function groupMembership(userId: string, groupId: string) {
  const [membership] = await db.select({
    role: memberships.role,
    groupId: memberships.groupId,
  }).from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.groupId, groupId)))
    .limit(1);
  return membership ?? null;
}

export function hashInvite(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Mutations are only accepted from the app's own interactive browser.
  return !!origin && origin === request.nextUrl.origin;
}

export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (raw.length > 4096) return null;
  try {
    const body: unknown = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function textInput(input: unknown, max: number): string | null {
  if (typeof input !== "string") return null;
  const result = input.trim();
  return result.length > 0 && result.length <= max ? result : null;
}

/** Drizzle neon-http returns either rows or {rows} depending on query path. */
export function hasReturnedRow(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object" && "rows" in value) {
    return Array.isArray(value.rows) && value.rows.length > 0;
  }
  return false;
}
