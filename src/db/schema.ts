import { relations, sql } from "drizzle-orm";
import {
  boolean, check, index, jsonb, numeric, pgTable, text, timestamp, uuid, uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Neon Auth owns neon_auth.user, account, and session. User IDs below come
 * directly from the verified Neon Auth server session; no local password
 * store and no duplicate identity table.
 */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  username: text("username").unique(), // Lowercase canonical username, optional for existing members
  email: text("email").notNull(),
  avatarSeed: text("avatar_seed").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("canonical_username", sql`${t.username} IS NULL OR ${t.username} ~ '^[a-z][a-z0-9_]{2,23}$'`),
]);

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  joinCodeEnabled: boolean("join_code_enabled").notNull().default(true),
  createdBy: text("created_by").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  role: text("role", { enum: ["member", "admin", "reviewer"] }).notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("one_membership_per_group").on(t.groupId, t.userId),
  uniqueIndex("one_group_per_user").on(t.userId),
]);

// Only a hash of each single-use, time-limited invite is stored in Postgres.
export const groupInvitations = pgTable("group_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  createdBy: text("created_by").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("invite_group_idx").on(t.groupId)]);

/**
 * A payment claim is not a bank transaction. Only an independent reviewer
 * can mark it verified after checking the receiving account externally.
 * DECIMAL strings are used instead of JS floats for stored money.
 */
export const contributions = pgTable("contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  memberId: text("member_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  contributionMonth: text("contribution_month").notNull(),
  paymentReference: text("payment_reference").notNull(),
  note: text("note"),
  status: text("status", { enum: ["submitted", "verified", "rejected"] }).notNull().default("submitted"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("contribution_group_created_idx").on(t.groupId, t.createdAt),
  index("contribution_member_idx").on(t.groupId, t.memberId),
  uniqueIndex("contribution_reference_unique").on(t.groupId, t.memberId, t.paymentReference),
  check("contribution_positive_amount", sql`${t.amount} > 0`),
]);

// Investment prices and earnings are NOT inferred from contribution totals.
// This table is for a later reconciled valuation and unit-allocation phase.
export const investments = pgTable("investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  name: text("name").notNull(),
  category: text("category"),
  investedAmount: numeric("invested_amount", { precision: 18, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 18, scale: 2 }),
  currency: text("currency").notNull().default("NGN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("investment_group_idx").on(t.groupId)]);

// Immutable review trail; never overwrite past decisions.
export const contributionReviews = pgTable("contribution_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  contributionId: uuid("contribution_id").notNull().references(() => contributions.id),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  reviewerId: text("reviewer_id").notNull(),
  decision: text("decision", { enum: ["verified", "rejected"] }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("one_review_per_contribution").on(t.contributionId)]);


/**
 * A monthly rotating custodian is accountable for a reconciliation report.
 * Scheduling does NOT grant permission to confirm a transfer or approve NAV.
 */
export const custodyAssignments = pgTable("custody_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // YYYY-MM
  custodianUserId: text("custodian_user_id").notNull(),
  scheduledBy: text("scheduled_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("one_custodian_per_group_period").on(t.groupId, t.period),
  index("custodian_group_period_idx").on(t.groupId, t.createdAt),
  check("custody_period_format", sql`${t.period} ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'`),
]);

export type ValuationMark = {
  assetLabel: string;
  category: string;
  sourceCurrency: "NGN" | "USD" | "GBP" | "EUR" | "OTHER";
  amountInSourceCurrency: string;
  ngnFairValue: string;
  evidenceReference: string;
  fxQuoteReference?: string;
};

/**
 * An assigned custodian may SUBMIT one report per month. This stores the
 * reported numbers as an untrusted draft of actual NAV. Nothing in this table
 * makes its numbers approved, audited or available as member earnings.
 */
export const valuationReports = pgTable("valuation_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  custodianUserId: text("custodian_user_id").notNull(),
  cashNgn: numeric("cash_ngn", { precision: 18, scale: 2 }).notNull(),
  liabilitiesNgn: numeric("liabilities_ngn", { precision: 18, scale: 2 }).notNull(),
  assetMarks: jsonb("asset_marks").$type<ValuationMark[]>().notNull(),
  statementReference: text("statement_reference").notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["submitted", "approved", "rejected"] }).notNull().default("submitted"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("one_report_per_group_period").on(t.groupId, t.period),
  index("report_group_submitted_idx").on(t.groupId, t.submittedAt),
  check("nonnegative_cash", sql`${t.cashNgn} >= 0`),
  check("nonnegative_liabilities", sql`${t.liabilitiesNgn} >= 0`),
  check("report_period_format", sql`${t.period} ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'`),
]);

/**
 * APPROVED snapshots will only be inserted after a future, independently
 * reviewed, transactional NAV settlement process is implemented.
 * No route currently inserts these. It must never be filled with mock data.
 */
export const valuationEvents = pgTable("valuation_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id").notNull().unique().references(() => valuationReports.id),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  approvedBy: text("approved_by").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }).notNull().defaultNow(),
  preMoneyNavNgn: numeric("pre_money_nav_ngn", { precision: 18, scale: 2 }).notNull(),
  closeNavNgn: numeric("close_nav_ngn", { precision: 18, scale: 2 }).notNull(),
  preMoneyPriceNgn: numeric("pre_money_price_ngn", { precision: 18, scale: 6 }).notNull(),
  closingPriceNgn: numeric("closing_price_ngn", { precision: 18, scale: 6 }).notNull(),
  totalIssuedUnits: numeric("total_issued_units", { precision: 30, scale: 8 }).notNull(),
}, (t) => [index("approved_event_group_idx").on(t.groupId, t.approvedAt)]);

export const unitIssuances = pgTable("unit_issuances", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  valuationEventId: uuid("valuation_event_id").notNull().references(() => valuationEvents.id),
  contributionId: uuid("contribution_id").notNull().unique().references(() => contributions.id),
  memberId: text("member_id").notNull(),
  amountNgn: numeric("amount_ngn", { precision: 18, scale: 2 }).notNull(),
  unitsIssued: numeric("units_issued", { precision: 30, scale: 8 }).notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("unit_issuance_member_idx").on(t.groupId, t.memberId),
  check("positive_unit_issuance", sql`${t.unitsIssued} > 0`),
]);

export const groupRelations = relations(groups, ({ many }) => ({
  memberships: many(memberships),
  contributions: many(contributions),
  investments: many(investments),
}));
export const membershipRelations = relations(memberships, ({ one }) => ({
  group: one(groups, { fields: [memberships.groupId], references: [groups.id] }),
}));
