import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { normalizeGroupJoinCode } from "@/lib/group/join-code";
import { getViewer, hashInvite, hasReturnedRow, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  const token = body?.invite;
  const groupCode = normalizeGroupJoinCode(token);
  if (groupCode) {
    const membershipId = crypto.randomUUID();
    try {
      // A reusable code grants membership only to an authenticated, otherwise-unjoined user.
      // Membership uniqueness is enforced by the database under concurrent requests.
      const result = await db.execute(sql`
        INSERT INTO "memberships" ("id", "group_id", "user_id", "role")
        SELECT ${membershipId}::uuid, "id", ${viewer.id}, 'member'
        FROM "groups"
        WHERE "join_code" = ${groupCode} AND "join_code_enabled" = true
          AND NOT EXISTS (SELECT 1 FROM "memberships" WHERE "user_id" = ${viewer.id})
        ON CONFLICT DO NOTHING
        RETURNING "group_id"
      `);
      if (!hasReturnedRow(result)) {
        return NextResponse.json({ error: "Invalid or disabled code, or you already belong to a group" }, { status: 409 });
      }
      return NextResponse.json({ joined: true });
    } catch {
      return NextResponse.json({ error: "Unable to join the group" }, { status: 409 });
    }
  }
  if (typeof token !== "string" || !/^[\w-]{40,90}$/.test(token)) {
    return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
  }

  const tokenHash = hashInvite(token);
  const membershipId = crypto.randomUUID();
  try {
    // A single SQL statement atomically consumes a valid single-use invite and
    // creates group membership. Concurrent attempts cannot reuse the token.
    const result = await db.execute(sql`
      WITH consumed AS (
        UPDATE "group_invitations"
        SET "used_at" = now()
        WHERE "token_hash" = ${tokenHash}
          AND "used_at" IS NULL
          AND "expires_at" > now()
          AND NOT EXISTS (
            SELECT 1 FROM "memberships" WHERE "user_id" = ${viewer.id}
          )
        RETURNING "group_id"
      )
      INSERT INTO "memberships" ("id", "group_id", "user_id", "role")
      SELECT ${membershipId}::uuid, "group_id", ${viewer.id}, 'member'
      FROM consumed
      ON CONFLICT DO NOTHING
      RETURNING "group_id"
    `);
    if (!hasReturnedRow(result)) {
      return NextResponse.json({ error: "This invitation has expired, was used, or you are already in a group" }, { status: 409 });
    }
    return NextResponse.json({ joined: true });
  } catch {
    return NextResponse.json({ error: "Unable to join the group" }, { status: 409 });
  }
}
