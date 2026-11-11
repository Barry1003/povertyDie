import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { custodyAssignments, type ValuationMark, valuationReports } from "@/db/schema";
import { currentPeriod, validPeriod } from "@/lib/accounting/custody";
import { koboToDecimal, toKobo } from "@/lib/group/money";
import { getViewer, groupMembership, isUuid, sameOrigin, textInput } from "@/lib/group/security";

export const runtime = "nodejs";

function nonnegativeAmount(value: unknown): string | null {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(value.trim())) return null;
  try { return koboToDecimal(toKobo(value.trim())); }
  catch { return null; }
}

function validateMarks(raw: unknown): ValuationMark[] | null {
  if (!Array.isArray(raw) || raw.length > 30) return null;
  const seen = new Set<string>();
  const marks: ValuationMark[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const value = item as Record<string, unknown>;
    const assetLabel = textInput(value.assetLabel, 100);
    const category = textInput(value.category, 50);
    const sourceCurrency = value.sourceCurrency;
    const sourceAmount = nonnegativeAmount(value.amountInSourceCurrency);
    const ngnValue = nonnegativeAmount(value.ngnFairValue);
    const evidence = textInput(value.evidenceReference, 300);
    const fxQuote = value.fxQuoteReference === undefined ? null : textInput(value.fxQuoteReference, 300);

    if (!assetLabel || !category || !evidence || evidence.length < 6 ||
      sourceAmount === null || ngnValue === null ||
      !["NGN", "USD", "EUR", "GBP", "OTHER"].includes(String(sourceCurrency)) ||
      seen.has(assetLabel.toLowerCase())) return null;

    seen.add(assetLabel.toLowerCase());
    if (sourceCurrency === "NGN" && sourceAmount !== ngnValue) return null;
    if (sourceCurrency !== "NGN" && (!fxQuote || fxQuote.length < 6)) return null;

    marks.push({
      assetLabel, category,
      sourceCurrency: sourceCurrency as ValuationMark["sourceCurrency"],
      amountInSourceCurrency: sourceAmount,
      ngnFairValue: ngnValue,
      evidenceReference: evidence,
      ...(fxQuote ? { fxQuoteReference: fxQuote } : {}),
    });
  }
  return marks;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.text();
  if (raw.length > 20_000) return NextResponse.json({ error: "Report is too large" }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid report");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid report JSON" }, { status: 400 });
  }

  const { groupId, period } = body;
  const cashNgn = nonnegativeAmount(body.cashNgn);
  const liabilitiesNgn = nonnegativeAmount(body.liabilitiesNgn);
  const statementReference = textInput(body.statementReference, 300);
  const notes = body.notes === "" || body.notes === undefined ? null : textInput(body.notes, 1000);
  const assetMarks = validateMarks(body.assetMarks);

  if (!isUuid(groupId) || !validPeriod(period) || period > currentPeriod() ||
    cashNgn === null || liabilitiesNgn === null || !statementReference ||
    statementReference.length < 6 || assetMarks === null ||
    (body.notes && notes === null)) {
    return NextResponse.json({ error: "Complete cash, liabilities, asset evidence and statement reference" }, { status: 400 });
  }

  const membership = await groupMembership(viewer.id, groupId);
  if (!membership) return NextResponse.json({ error: "Not a group member" }, { status: 403 });

  const [assignment] = await db.select({ custodianId: custodyAssignments.custodianUserId })
    .from(custodyAssignments)
    .where(and(eq(custodyAssignments.groupId, groupId), eq(custodyAssignments.period, period)))
    .limit(1);
  if (!assignment || assignment.custodianId !== viewer.id) {
    return NextResponse.json({ error: "Only the scheduled custodian can submit this month's report" }, { status: 403 });
  }

  const [report] = await db.insert(valuationReports).values({
    groupId, period, custodianUserId: viewer.id,
    cashNgn, liabilitiesNgn, statementReference, assetMarks, notes,
    status: "submitted",
  }).onConflictDoNothing().returning({ id: valuationReports.id });

  if (!report) return NextResponse.json({ error: "This month's report was already submitted" }, { status: 409 });
  return NextResponse.json({
    id: report.id,
    status: "submitted",
    message: "Custody statement saved for future independent reconciliation. No NAV or units approved.",
  }, { status: 201 });
}
