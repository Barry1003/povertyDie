import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contributions, custodyAssignments, groups, memberships, profiles, valuationReports } from "@/db/schema";
import { toKobo, koboToDecimal } from "@/lib/group/money";
import type { Viewer } from "@/lib/group/security";

export type MemberView = {
  userId: string;
  name: string;
  avatarSeed: string;
  role: "member" | "admin" | "reviewer";
  verified: string;
  pending: string;
  joinedAt: string;
};

export type ContributionView = {
  id: string;
  memberId: string;
  memberName: string;
  amount: string;
  month: string;
  reference: string;
  status: "submitted" | "verified" | "rejected";
  createdAt: string;
  verifiedBy: string | null;
  reviewNote: string | null;
};

export type GroupDashboard = {
  group: { id: string; name: string };
  viewer: Viewer & { role: "member" | "admin" | "reviewer" };
  members: MemberView[];
  contributions: ContributionView[];
  groupVerified: string;
  groupPending: string;
  personalVerified: string;
  memberCount: number;
  custody: Array<{
    period: string;
    custodianUserId: string;
    custodianName: string;
    reportStatus: "submitted" | "approved" | "rejected" | null;
    submittedAt: string | null;
  }>;
};

/** Only returns a group that the authenticated viewer has joined. */
export async function loadGroupDashboard(viewer: Viewer): Promise<GroupDashboard | null> {
  const [current] = await db.select({
    groupId: groups.id,
    groupName: groups.name,
    role: memberships.role,
  }).from(memberships)
    .innerJoin(groups, eq(groups.id, memberships.groupId))
    .where(eq(memberships.userId, viewer.id))
    .orderBy(asc(memberships.joinedAt))
    .limit(1);

  if (!current) return null;
  const groupId = current.groupId;

  const [memberRows, claimRows, custodyRows, reportRows] = await Promise.all([
    db.select({
      userId: memberships.userId,
      role: memberships.role,
      joinedAt: memberships.joinedAt,
      name: profiles.displayName,
      avatarSeed: profiles.avatarSeed,
      verified: sql<string>`coalesce(sum(${contributions.amount}) filter (where ${contributions.status} = 'verified'), 0)::text`,
      pending: sql<string>`coalesce(sum(${contributions.amount}) filter (where ${contributions.status} = 'submitted'), 0)::text`,
    }).from(memberships)
      .leftJoin(profiles, eq(profiles.userId, memberships.userId))
      .leftJoin(contributions, and(
        eq(contributions.groupId, groupId),
        eq(contributions.memberId, memberships.userId),
      ))
      .where(eq(memberships.groupId, groupId))
      .groupBy(memberships.userId, memberships.role, memberships.joinedAt, profiles.displayName, profiles.avatarSeed)
      .orderBy(asc(memberships.joinedAt)),
    db.select({
      id: contributions.id,
      memberId: contributions.memberId,
      memberName: profiles.displayName,
      amount: contributions.amount,
      month: contributions.contributionMonth,
      reference: contributions.paymentReference,
      status: contributions.status,
      createdAt: contributions.createdAt,
      verifiedBy: contributions.verifiedBy,
      reviewNote: contributions.reviewNote,
    }).from(contributions)
      .leftJoin(profiles, eq(profiles.userId, contributions.memberId))
      .where(eq(contributions.groupId, groupId))
      .orderBy(desc(contributions.createdAt))
      .limit(100),
    db.select({
      period: custodyAssignments.period,
      custodianUserId: custodyAssignments.custodianUserId,
      custodianName: profiles.displayName,
    }).from(custodyAssignments)
      .leftJoin(profiles, eq(profiles.userId, custodyAssignments.custodianUserId))
      .where(eq(custodyAssignments.groupId, groupId))
      .orderBy(desc(custodyAssignments.period))
      .limit(18),
    db.select({
      period: valuationReports.period,
      status: valuationReports.status,
      submittedAt: valuationReports.submittedAt,
    }).from(valuationReports)
      .where(eq(valuationReports.groupId, groupId))
      .orderBy(desc(valuationReports.period))
      .limit(18),
  ]);

  const members: MemberView[] = memberRows.map(row => ({
    userId: row.userId,
    name: row.name || "Member",
    avatarSeed: row.avatarSeed || row.userId,
    role: row.role,
    verified: row.verified,
    pending: row.pending,
    joinedAt: row.joinedAt.toISOString(),
  }));
  const claims: ContributionView[] = claimRows.map(row => ({
    id: row.id,
    memberId: row.memberId,
    memberName: row.memberName || "Member",
    amount: row.amount,
    month: row.month,
    reference: row.reference,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    verifiedBy: row.verifiedBy,
    reviewNote: row.reviewNote,
  }));

  const groupVerified = members.reduce((sum, member) => sum + toKobo(member.verified), 0n);
  const groupPending = members.reduce((sum, member) => sum + toKobo(member.pending), 0n);
  const personalVerified = members.find(member => member.userId === viewer.id)?.verified ?? "0";

  return {
    group: { id: groupId, name: current.groupName },
    viewer: { ...viewer, role: current.role },
    members,
    contributions: claims,
    groupVerified: koboToDecimal(groupVerified),
    groupPending: koboToDecimal(groupPending),
    personalVerified,
    memberCount: members.length,
    custody: custodyRows.map(row => {
      const report = reportRows.find(value => value.period === row.period);
      return {
        period: row.period,
        custodianUserId: row.custodianUserId,
        custodianName: row.custodianName || "Member",
        reportStatus: report?.status ?? null,
        submittedAt: report?.submittedAt.toISOString() ?? null,
      };
    }),
  };
}
