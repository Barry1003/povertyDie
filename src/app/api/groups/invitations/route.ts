import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groupInvitations } from "@/db/schema";
import { getViewer, groupMembership, hashInvite, isUuid, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  if (!isUuid(body?.groupId)) return NextResponse.json({ error: "Invalid group" }, { status: 400 });

  const membership = await groupMembership(viewer.id, body.groupId);
  if (membership?.role !== "admin") return NextResponse.json({ error: "Only the group admin can invite friends" }, { status: 403 });

  const token = randomBytes(32).toString("base64url");
  await db.insert(groupInvitations).values({
    groupId: body.groupId,
    tokenHash: hashInvite(token),
    createdBy: viewer.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Never save the plaintext token. The share link can be used ONCE.
  const link = new URL("/", request.nextUrl.origin);
  link.searchParams.set("invite", token);
  return NextResponse.json({ link: link.toString(), expiresInDays: 7 }, {
    headers: { "Cache-Control": "no-store" },
  });
}
