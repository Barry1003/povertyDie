import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { memberships, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { avatarUrl } from "@/lib/avatar";

export const runtime = "nodejs";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  await db.insert(profiles)
    .values({ userId, avatarSeed: userId })
    .onConflictDoNothing();

  const groupRoles = await db
    .select({ groupId: memberships.groupId, role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, userId));

  return NextResponse.json({
    user: {
      id: userId,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: avatarUrl(userId),
    },
    memberships: groupRoles,
  });
}
