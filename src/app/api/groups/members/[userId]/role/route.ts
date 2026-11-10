import { and, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { getViewer, groupMembership, isUuid, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  const { userId } = await context.params;
  if (!isUuid(body?.groupId) || !userId || userId.length > 160 ||
    (body?.role !== "member" && body?.role !== "reviewer")) {
    return NextResponse.json({ error: "Invalid role or group" }, { status: 400 });
  }

  const membership = await groupMembership(viewer.id, body.groupId);
  if (membership?.role !== "admin") return NextResponse.json({ error: "Only admins can assign reviewers" }, { status: 403 });
  if (userId === viewer.id) return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });

  const updated = await db.update(memberships).set({ role: body.role })
    .where(and(
      eq(memberships.userId, userId),
      eq(memberships.groupId, body.groupId),
      ne(memberships.role, "admin"),
    ))
    .returning({ id: memberships.id });

  if (updated.length === 0) return NextResponse.json({ error: "Member not found or cannot modify an admin" }, { status: 404 });
  return NextResponse.json({ updated: true, role: body.role });
}
