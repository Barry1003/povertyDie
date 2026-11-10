import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import App from "@/App";
import { avatarUrl } from "@/lib/avatar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return <App viewer={{ name: session.user.name || session.user.email || "Member", image: avatarUrl(profile?.avatarSeed || userId) }} />;
}
