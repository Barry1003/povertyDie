import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contributions } from "@/db/schema";
import { getViewer, groupMembership, isUuid, readJson, sameOrigin, textInput } from "@/lib/group/security";
import { normalizeAmount } from "@/lib/group/money";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);

  const amount = normalizeAmount(body?.amount);
  const month = body?.month;
  const reference = textInput(body?.reference, 80);
  const note = body?.note === "" || body?.note === undefined ? null : textInput(body?.note, 300);
  if (!isUuid(body?.groupId) || !amount ||
    typeof month !== "string" || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(month) ||
    !reference || reference.length < 4 || !/^[\w\s\-./]+$/.test(reference) ||
    (body?.note && note === null)) {
    return NextResponse.json({
      error: "Provide a valid amount, month (YYYY-MM), transfer reference and optional note",
    }, { status: 400 });
  }

  const membership = await groupMembership(viewer.id, body.groupId);
  if (!membership) return NextResponse.json({ error: "Not a group member" }, { status: 403 });

  try {
    const [created] = await db.insert(contributions).values({
      groupId: body.groupId,
      memberId: viewer.id,
      amount,
      currency: "NGN",
      contributionMonth: month,
      paymentReference: reference,
      note,
      status: "submitted",
    }).returning({ id: contributions.id });
    // This is NOT a verified receipt, units issued, or bank-transfer execution.
    return NextResponse.json({ id: created.id, status: "submitted" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Payment reference already submitted or database error" }, { status: 409 });
  }
}
