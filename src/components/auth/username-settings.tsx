"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CharacterAvatar } from "@/components/identity/character-avatar";
import { canonicalUsername, usernameError } from "@/lib/auth/username";

export function UsernameSettings({
  name, email, avatarSeed, initialUsername,
}: { name: string; email: string; avatarSeed: string; initialUsername: string | null }) {
  const [username, setUsername] = useState(initialUsername ?? "");
  const [saved, setSaved] = useState(initialUsername);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = usernameError(username);
    if (invalid) { setError(invalid); return; }

    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/me/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: canonicalUsername(username) }),
        cache: "no-store",
      });
      const body: { error?: string; username?: string } = await response.json();
      if (!response.ok) { setError(body.error || "Could not save username"); return; }
      setSaved(body.username ?? null);
      setUsername(body.username ?? "");
      setMessage("Username saved. Your friends will be able to recognize this handle in Poverty Die.");
    } catch {
      setError("Could not connect to the profile service. Try again.");
    } finally { setBusy(false); }
  }

  return <div className="rounded-3xl border border-[#E0CEEF] bg-white p-6 shadow-[0_15px_45px_rgba(19,58,40,0.06)] sm:p-8">
    <Link href="/" className="text-xs font-bold text-[#7C3AED] hover:underline">← Back to your group</Link>
    <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Your member profile</h1>
    <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#F4EDFB] p-4">
      <CharacterAvatar name={name} seed={avatarSeed} size="lg" />
      <div className="min-w-0">
        <strong className="block truncate text-base">{name}</strong>
        <span className="mt-1 block text-xs text-[#7739AC]">{email}</span>
        <span className="mt-1 block text-xs font-bold text-[#7C3AED]">{saved ? `@${saved}` : "No username chosen"}</span>
      </div>
    </div>
    <form onSubmit={submit} className="mt-6 space-y-3">
      <label htmlFor="preferred-username" className="block text-sm font-semibold">Unique username</label>
      <input id="preferred-username" value={username} onChange={event => setUsername(event.target.value)}
        autoComplete="username" minLength={3} maxLength={24} required
        pattern="[a-zA-Z][a-zA-Z0-9_]{2,23}"
        className="w-full rounded-xl border border-[#DDD6FE] px-4 py-3 text-sm focus:border-[#7C3AED]"
        placeholder="e.g. ishola1003" />
      <p className="text-xs leading-relaxed text-[#7A3BB1]">
        Usernames are unique, case-insensitive group handles. Password login uses your Neon Auth email address.
        We will only enable username/password login when the managed authentication provider offers it safely.
      </p>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-violet-50 p-3 text-xs text-violet-800">{message}</p>}
      <button disabled={busy} type="submit"
        className="rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Save username"}
      </button>
    </form>
  </div>;
}
