import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import App from "@/App";
import { avatarUrl } from "@/lib/avatar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  // Neon Auth owns the user; this app only stores additional profile data.
  // Seed is the stable opaque user ID, unique per account and across devices.
  await db.insert(profiles)
    .values({ userId, avatarSeed: userId })
    .onConflictDoNothing();

  return (
    <App
      viewer={{
        name: session.user.name || session.user.email || "Member",
        image: avatarUrl(userId),
      }}
    />
  );
}
