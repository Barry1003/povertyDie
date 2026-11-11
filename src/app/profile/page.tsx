import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getViewer } from "@/lib/group/security";
import { UsernameSettings } from "@/components/auth/username-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "My profile | Poverty Die" };

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fprofile");
  const [profile] = await db.select({ username: profiles.username })
    .from(profiles).where(eq(profiles.userId, viewer.id)).limit(1);

  return <main className="min-h-screen bg-[#f5faf7] px-4 py-12 text-[#173d32]">
    <div className="mx-auto max-w-xl">
      <UsernameSettings name={viewer.name} email={viewer.email}
        avatarSeed={viewer.avatarSeed} initialUsername={profile?.username ?? null} />
    </div>
  </main>;
}
