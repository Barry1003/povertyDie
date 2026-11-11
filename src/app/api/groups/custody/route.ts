import { and, asc, desc, eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { custodyAssignments, memberships } from "@/db/schema";
import { currentPeriod, nextCustodian, nextPeriod, validPeriod } from "@/lib/accounting/custody";
import { getViewer, groupMembership, isUuid, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  if (!isUuid(body?.groupId) || !validPeriod(body?.period)) {
    return NextResponse.json({ error: "Provide a group ID and YYYY-MM" }, { status: 400 });
  }
  // Scheduling is limited to this month or next month to avoid skipping over
  // custodians when the group roster changes.
  const now = currentPeriod();
  if (body.period !== now && body.period !== nextPeriod(now)) {
    return NextResponse.json({ error: "Only the current or next month can be scheduled" }, { status: 400 });
  }
  const membership = await groupMembership(viewer.id, body.groupId);
  if (membership?.role !== "admin") {
    return NextResponse.json({ error: "Only a group administrator can schedule custody" }, { status: 403 });
  }

  const [members, previous] = await Promise.all([
    db.select({ userId: memberships.userId, joinedAt: memberships.joinedAt })
      .from(memberships)
      .where(eq(memberships.groupId, body.groupId))
      .orderBy(asc(memberships.joinedAt), asc(memberships.userId)),
    db.select({ custodianUserId: custodyAssignments.custodianUserId })
      .from(custodyAssignments)
      .where(and(eq(custodyAssignments.groupId, body.groupId), lt(custodyAssignments.period, body.period)))
      .orderBy(desc(custodyAssignments.period))
      .limit(1),
  ]);

  const selected = nextCustodian(
    members.map(row => ({ userId: row.userId, joinedAt: row.joinedAt.toISOString() })),
    previous[0]?.custodianUserId ?? null,
  );

  const [created] = await db.insert(custodyAssignments).values({
    groupId: body.groupId,
    period: body.period,
    custodianUserId: selected,
    scheduledBy: viewer.id,
  }).onConflictDoNothing().returning({ id: custodyAssignments.id });

  if (!created) {
    return NextResponse.json({ error: "This month already has a custodian" }, { status: 409 });
  }
  return NextResponse.json({ scheduled: true, period: body.period, custodianUserId: selected }, { status: 201 });
}
