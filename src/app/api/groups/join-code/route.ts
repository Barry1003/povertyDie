import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { generateGroupJoinCode } from "@/lib/group/join-code";
import { getViewer, groupMembership, isUuid, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  if (!isUuid(body?.groupId)) return NextResponse.json({ error: "Invalid group" }, { status: 400 });
  if (body?.action !== "regenerate" && body?.action !== "disable" && body?.action !== "enable") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const member = await groupMembership(viewer.id, body.groupId);
  if (member?.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const changes = body.action === "regenerate"
    ? { joinCode: generateGroupJoinCode(), joinCodeEnabled: true }
    : { joinCodeEnabled: body.action === "enable" };

  try {
    const [result] = await db.update(groups).set(changes)
      .where(eq(groups.id, body.groupId))
      .returning({ code: groups.joinCode, enabled: groups.joinCodeEnabled });
    if (!result) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to update group code" }, { status: 500 });
  }
}
