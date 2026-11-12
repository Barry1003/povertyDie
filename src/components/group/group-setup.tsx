import { BrandLogo } from "@/components/brand/brand-logo";
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
    <main className="min-h-screen bg-[#FAF5FF] text-[#2B0D45]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <BrandLogo />
        <button type="button" className="text-sm text-[#641EA2] underline underline-offset-4" onClick={async () => {
          await authClient.signOut();
          window.location.assign("/sign-in");
        }}>Sign out</button>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <Link href="/profile" className="inline-flex items-center gap-3 rounded-full border border-[#E2CEF3] bg-white px-3 py-2 text-xs shadow-sm">
            <CharacterAvatar name={viewer.name} seed={viewer.avatarSeed} size="sm" />
            Signed in as <strong>{viewer.name}</strong> · Edit profile
          </Link>
          <h1 className="mt-7 max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            Your friends. <span className="text-[#7C3AED]">One shared journey.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#6B349C]">
            Make a private group or join the one your friends started. Once you join, everyone shares the same verified contribution totals and member records.
          </p>
          <div className="relative mt-6 h-52 overflow-hidden rounded-3xl bg-[#2B0D45] sm:h-64">
            <ImmersiveWealth variant="welcome" />
            <span className="absolute bottom-4 left-5 text-xs font-semibold tracking-wide text-[#E2CEF3]">A clearer way to grow together</span>
          </div>
        </div>

        <div className="grid gap-5">
          <form onSubmit={join} className="rounded-3xl border border-[#E9D5FF] bg-white p-6 shadow-[0_16px_50px_rgba(30,70,53,0.07)]">
            <span className="text-xs font-bold uppercase tracking-[.15em] text-[#7C3AED]">I have an invitation</span>
            <h2 className="mt-2 text-2xl font-bold">Join your friends</h2>
            <p className="mt-2 text-sm text-[#783AAE]">Paste the private invite code or use the link your group admin sent.</p>
            <label htmlFor="invite-code" className="mt-5 block text-xs font-semibold">Invitation code</label>
            <input id="invite-code" value={invite} onChange={e => setInvite(e.target.value)}
              required placeholder="Paste your invitation code"
              className="mt-2 w-full rounded-xl border border-[#D8C2EB] bg-white px-4 py-3 text-sm outline-offset-2 focus:border-[#7C3AED]" />
            <button disabled={!!working} className="mt-4 w-full rounded-xl bg-[#7C3AED] px-4 py-3 font-bold text-white disabled:opacity-60">
              {working === "join" ? "Joining…" : "Join the group"}
            </button>
          </form>

          <form onSubmit={create} className="rounded-3xl border border-[#E9D5FF] bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-[.15em] text-[#783AAE]">Starting something new?</span>
            <h2 className="mt-2 text-xl font-bold">Start a group</h2>
            <label htmlFor="group-name" className="mt-4 block text-xs font-semibold">Group name</label>
            <input id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)}
              minLength={3} maxLength={64} required className="mt-2 w-full rounded-xl border border-[#D8C2EB] px-4 py-3 text-sm outline-offset-2 focus:border-[#7C3AED]" />
            <button disabled={!!working} className="mt-4 w-full rounded-xl border border-[#7C3AED] px-4 py-3 font-bold text-[#601C9B] disabled:opacity-60">
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
