import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, profiles, sessions, users, verificationTokens } from "@/db/schema";

const allowedEmails = new Set((process.env.ALLOWED_EMAILS || "")
  .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  providers: [Google({ allowDangerousEmailAccountLinking: false })],
  session: { strategy: "database" },
  pages: { signIn: "/sign-in" },
  trustHost: true,
  callbacks: {
    async signIn({ profile, account, user }) {
      if (account?.provider !== "google") return false;
      if (profile?.email_verified !== true) return false;
      const email = user.email?.trim().toLowerCase();
      return Boolean(email && allowedEmails.has(email));
    },
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db.insert(profiles).values({ userId: user.id, avatarSeed: user.id }).onConflictDoNothing();
    },
  },
});
