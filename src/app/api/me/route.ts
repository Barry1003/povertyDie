import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { memberships, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { avatarUrl } from "@/lib/avatar";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = session.user.id;
  const [profile, groups] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, id)).limit(1),
    db.select({ groupId: memberships.groupId, role: memberships.role }).from(memberships).where(eq(memberships.userId, id)),
  ]);
  return NextResponse.json({ user: { id, name: session.user.name, email: session.user.email, avatarUrl: avatarUrl(profile[0]?.avatarSeed || id) }, memberships: groups });
}
