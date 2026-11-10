import { relations } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Neon Auth creates and manages identities in neon_auth.user, neon_auth.session,
 * neon_auth.account, and associated tables. Do not recreate or migrate those.
 * User IDs below are the stable, opaque IDs returned by Neon Auth.
 */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  avatarSeed: text("avatar_seed").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
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

// Amounts are NUMERIC strings rather than floating-point values.
// Only an independent approved verification makes a claim count as a contribution.
export const contributions = pgTable("contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  memberId: text("member_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  status: text("status", { enum: ["submitted", "verified", "rejected"] }).notNull().default("submitted"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("contribution_group_created_idx").on(t.groupId, t.createdAt)]);

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

export const groupRelations = relations(groups, ({ many }) => ({
  memberships: many(memberships),
  contributions: many(contributions),
  investments: many(investments),
}));
export const membershipRelations = relations(memberships, ({ one }) => ({
  group: one(groups, { fields: [memberships.groupId], references: [groups.id] }),
}));
