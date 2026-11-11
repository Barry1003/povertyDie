"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { ImmersiveWealth } from "@/components/3d/immersive-wealth";
import { CharacterAvatar } from "@/components/identity/character-avatar";
import type { Viewer } from "@/lib/group/security";

async function send(path: string, data: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong");
  return result;
}

export function GroupSetup({
  viewer,
  initialInvite = "",
}: {
  viewer: Viewer;
  initialInvite?: string;
}) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("Poverty Die");
  const [invite, setInvite] = useState(initialInvite);
  const [working, setWorking] = useState<"create" | "join" | null>(null);
  const [message, setMessage] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking("create"); setMessage("");
    try {
      await send("/api/groups", { name: groupName });
      router.replace("/");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create group"); }
    finally { setWorking(null); }
  }

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking("join"); setMessage("");
    try {
      await send("/api/groups/join", { invite: invite.trim() });
      router.replace("/");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to join group"); }
    finally { setWorking(null); }
  }

  return (
    <main className="min-h-screen bg-[#f5faf7] text-[#183932]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16856e] text-xl font-black text-white">P</span>
          <div><p className="text-lg font-black tracking-tight">Poverty Die</p><p className="text-xs text-[#678178]">Friends building wealth together</p></div>
        </div>
        <button type="button" className="text-sm text-[#4b7568] underline underline-offset-4" onClick={async () => {
          await authClient.signOut();
          window.location.assign("/sign-in");
        }}>Sign out</button>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <Link href="/profile" className="inline-flex items-center gap-3 rounded-full border border-[#d9e8e0] bg-white px-3 py-2 text-xs shadow-sm">
            <CharacterAvatar name={viewer.name} seed={viewer.avatarSeed} size="sm" />
            Signed in as <strong>{viewer.name}</strong> · Edit profile
          </Link>
          <h1 className="mt-7 max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            Your friends. <span className="text-[#14866e]">One shared journey.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5c746c]">
            Make a private group or join the one your friends started. Once you join, everyone shares the same verified contribution totals and member records.
          </p>
          <div className="relative mt-6 h-52 overflow-hidden rounded-3xl bg-[#163a31] sm:h-64">
            <ImmersiveWealth variant="welcome" />
            <span className="absolute bottom-4 left-5 text-xs font-semibold tracking-wide text-[#d2efdd]">A clearer way to grow together</span>
          </div>
        </div>

        <div className="grid gap-5">
          <form onSubmit={join} className="rounded-3xl border border-[#d8e8df] bg-white p-6 shadow-[0_16px_50px_rgba(30,70,53,0.07)]">
            <span className="text-xs font-bold uppercase tracking-[.15em] text-[#16856e]">I have an invitation</span>
            <h2 className="mt-2 text-2xl font-bold">Join your friends</h2>
            <p className="mt-2 text-sm text-[#678178]">Paste the private invite code or use the link your group admin sent.</p>
            <label htmlFor="invite-code" className="mt-5 block text-xs font-semibold">Invitation code</label>
            <input id="invite-code" value={invite} onChange={e => setInvite(e.target.value)}
              required placeholder="Paste your invitation code"
              className="mt-2 w-full rounded-xl border border-[#cedfd6] bg-white px-4 py-3 text-sm outline-offset-2 focus:border-[#16856e]" />
            <button disabled={!!working} className="mt-4 w-full rounded-xl bg-[#16856e] px-4 py-3 font-bold text-white disabled:opacity-60">
              {working === "join" ? "Joining…" : "Join the group"}
            </button>
          </form>

          <form onSubmit={create} className="rounded-3xl border border-[#d8e8df] bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-[.15em] text-[#6a7e72]">Starting something new?</span>
            <h2 className="mt-2 text-xl font-bold">Start a group</h2>
            <label htmlFor="group-name" className="mt-4 block text-xs font-semibold">Group name</label>
            <input id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)}
              minLength={3} maxLength={64} required className="mt-2 w-full rounded-xl border border-[#cedfd6] px-4 py-3 text-sm outline-offset-2 focus:border-[#16856e]" />
            <button disabled={!!working} className="mt-4 w-full rounded-xl border border-[#16856e] px-4 py-3 font-bold text-[#126a57] disabled:opacity-60">
              {working === "create" ? "Creating…" : "Create my group"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-[#72847c]">You'll be the first administrator and can invite each friend using a one-time link.</p>
          </form>
          {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</p>}
        </div>
      </section>
    </main>
  );
}
