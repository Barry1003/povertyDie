import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { getViewer } from "@/lib/group/security";

export const runtime = "nodejs";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await db.select({
    groupId: memberships.groupId,
    role: memberships.role,
  }).from(memberships).where(eq(memberships.userId, viewer.id));
  return NextResponse.json({ user: viewer, memberships: groups }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
