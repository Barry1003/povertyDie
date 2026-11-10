import { relations } from "drizzle-orm";
import { boolean, index, integer, numeric, pgTable, primaryKey, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<"oauth" | "oidc" | "email" | "webauthn">().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// Display identity: one stable, unique seed for each Google-authenticated user.
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["member", "admin", "reviewer"] }).notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("one_membership_per_group").on(t.groupId,t.userId), index("membership_user_idx").on(t.userId)]);

// Amounts are NUMERIC strings rather than floats to avoid currency rounding errors.
// A claimed payment is NOT verified until a separate reviewer approves it.
export const contributions = pgTable("contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  memberId: text("member_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  status: text("status", { enum: ["submitted", "verified", "rejected"] }).notNull().default("submitted"),
  verifiedBy: text("verified_by").references(() => users.id),
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

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts), sessions: many(sessions), memberships: many(memberships), profile: one(profiles),
}));
export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  group: one(groups, { fields: [memberships.groupId], references: [groups.id] }),
}));
