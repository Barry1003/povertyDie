import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getViewer, groupMembership, hasReturnedRow, isUuid, readJson, sameOrigin, textInput } from "@/lib/group/security";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await readJson(request);
  const decision = body?.decision;
  const note = body?.note === "" || body?.note === undefined ? null : textInput(body?.note, 300);
  if (!isUuid(id) || !isUuid(body?.groupId) ||
    (decision !== "verified" && decision !== "rejected") ||
    (body?.note && note === null) || (decision === "rejected" && !note)) {
    return NextResponse.json({ error: "Invalid review details or missing rejection reason" }, { status: 400 });
  }

  const membership = await groupMembership(viewer.id, body.groupId);
  if (membership?.role !== "admin" && membership?.role !== "reviewer") {
    return NextResponse.json({ error: "Independent reviewer permission required" }, { status: 403 });
  }

  // Status transition and immutable audit insert happen atomically; a reviewer
  // cannot approve their own contribution and cannot review twice.
  const auditId = crypto.randomUUID();
  const result = await db.execute(sql`
    WITH changed AS (
      UPDATE "contributions"
      SET "status" = ${decision},
          "verified_by" = CASE WHEN ${decision} = 'verified' THEN ${viewer.id} ELSE NULL END,
          "verified_at" = CASE WHEN ${decision} = 'verified' THEN now() ELSE NULL END,
          "review_note" = ${note}
      WHERE "id" = ${id}::uuid
        AND "group_id" = ${body.groupId}::uuid
        AND "status" = 'submitted'
        AND "member_id" <> ${viewer.id}
      RETURNING "id", "group_id"
    )
    INSERT INTO "contribution_reviews"
      ("id", "contribution_id", "group_id", "reviewer_id", "decision", "note")
    SELECT ${auditId}::uuid, "id", "group_id", ${viewer.id}, ${decision}, ${note}
    FROM changed
    RETURNING "contribution_id"
  `);

  if (!hasReturnedRow(result)) return NextResponse.json({
    error: "Claim already reviewed, missing, or self-approval is forbidden",
  }, { status: 409 });

  return NextResponse.json({ reviewed: true, decision });
}
