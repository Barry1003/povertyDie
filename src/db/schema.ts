import { relations, sql } from "drizzle-orm";
import {
  check, index, integer, numeric, pgTable, text, timestamp, uuid, uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Neon Auth owns neon_auth.user, account, and session. User IDs below come
 * directly from the verified Neon Auth server session; no local password
 * store and no duplicate identity table.
 */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  avatarSeed: text("avatar_seed").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
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
  index("membership_user_idx").on(t.userId),
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

export const groupRelations = relations(groups, ({ many }) => ({
  memberships: many(memberships),
  contributions: many(contributions),
  investments: many(investments),
}));
export const membershipRelations = relations(memberships, ({ one }) => ({
  group: one(groups, { fields: [memberships.groupId], references: [groups.id] }),
}));
