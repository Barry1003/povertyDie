import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generateGroupJoinCode } from "@/lib/group/join-code";
import { getViewer, hasReturnedRow, readJson, sameOrigin, textInput } from "@/lib/group/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = await readJson(request);
  const name = textInput(body?.name, 64);
  if (!name || name.length < 3) {
    return NextResponse.json({ error: "Group name must be 3–64 characters" }, { status: 400 });
  }

  // One atomic statement creates the group and its founding admin membership.
  // Do not allow a signed-in user to start another group while already a member.
  const groupId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const joinCode = generateGroupJoinCode();
  try {
    const result = await db.execute(sql`
      WITH created AS (
        INSERT INTO "groups" ("id", "name", "created_by", "join_code")
        SELECT ${groupId}::uuid, ${name}, ${viewer.id}, ${joinCode}
        WHERE NOT EXISTS (
          SELECT 1 FROM "memberships" WHERE "user_id" = ${viewer.id}
        )
        RETURNING "id"
      )
      INSERT INTO "memberships" ("id", "group_id", "user_id", "role")
      SELECT ${membershipId}::uuid, "id", ${viewer.id}, 'admin' FROM created
      RETURNING "group_id"
    `);
    if (!hasReturnedRow(result)) {
      return NextResponse.json({ error: "You already belong to a group" }, { status: 409 });
    }
    return NextResponse.json({ groupId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create group; check existing membership" }, { status: 409 });
  }
}
