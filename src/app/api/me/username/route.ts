import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { canonicalUsername, usernameError } from "@/lib/auth/username";
import { getViewer, readJson, sameOrigin } from "@/lib/group/security";

export const runtime = "nodejs";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select({ username: profiles.username })
    .from(profiles).where(eq(profiles.userId, viewer.id)).limit(1);

  return NextResponse.json({ username: profile?.username ?? null }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJson(request);
  const error = usernameError(body?.username);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const username = canonicalUsername(body?.username);
  if (!username) return NextResponse.json({ error: "Invalid username" }, { status: 400 });

  try {
    const updated = await db.update(profiles)
      .set({ username, updatedAt: new Date() })
      .where(eq(profiles.userId, viewer.id))
      .returning({ username: profiles.username });
    if (!updated[0]) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json({ username: updated[0].username }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    // Unique index protects even simultaneous requests; do not expose DB errors.
    return NextResponse.json({ error: "This username is already taken. Try another." }, { status: 409 });
  }
}
