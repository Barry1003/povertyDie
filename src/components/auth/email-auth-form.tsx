"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { canonicalUsername, usernameError } from "@/lib/auth/username";
import { safeReturnTo } from "@/lib/auth/redirect";

const inputClass = "mt-1.5 block w-full rounded-xl border border-[#cbded3] bg-white px-4 py-3 text-sm text-[#173d33] placeholder-[#889e92] outline-offset-2 focus:border-[#16856e]";
const labelClass = "block text-sm font-semibold text-[#284b3f]";

export function EmailAuthForm({
  mode, returnTo = "/",
}: {
  mode: "sign-in" | "sign-up";
  returnTo?: string;
}) {
  const router = useRouter();
  const next = safeReturnTo(returnTo);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(""); setNotice("");
    if (mode === "sign-up") {
      const invalid = usernameError(username);
      if (invalid) return setError(invalid);
      if (name.trim().length < 2 || name.trim().length > 100)
        return setError("Enter your full name (2–100 characters)");
      if (password.length < 12 || password.length > 128)
        return setError("Use a password between 12 and 128 characters");
      if (confirmPassword !== password)
        return setError("The passwords do not match");
    }
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const response = await authClient.signIn.email({
          email: email.trim().toLowerCase(), password, callbackURL: next,
        });
        if (response.error) {
          setError(response.error.message || "Unable to sign in. Check your email and password.");
          return;
        }
        window.location.assign(next);
        return;
      }

      const response = await authClient.signUp.email({
        name: name.trim(), email: email.trim().toLowerCase(), password, callbackURL: next,
      });
      if (response.error) {
        setError(response.error.message || "Could not create your account. Try again or use Google.");
        return;
      }

      // Neon may require email verification before creating a session.
      const session = await authClient.getSession();
      if (session.data?.user?.id) {
        const preferred = canonicalUsername(username);
        const saved = await fetch("/api/me/username", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: preferred }),
          cache: "no-store",
        });
        // Account was created regardless of whether the chosen username is free.
        // Let the user choose a different handle without losing their new account.
        if (!saved.ok) {
          router.replace("/profile");
          router.refresh();
          return;
        }
        window.location.assign(next);
        return;
      }
      setNotice("Account created. Check your inbox for any verification email, then sign in. You can confirm your username in Profile after verifying.");
      setPassword(""); setConfirmPassword("");
    } catch {
      setError("Authentication is unavailable right now. Verify Neon Auth is enabled and this domain is trusted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {mode === "sign-up" && <>
        <label className={labelClass} htmlFor="auth-name">Full name
          <input id="auth-name" name="name" className={inputClass} autoComplete="name" required minLength={2} maxLength={100}
            value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
        </label>
        <label className={labelClass} htmlFor="auth-username">Choose a username
          <input id="auth-username" name="username" className={inputClass} autoComplete="username" required
            minLength={3} maxLength={24} pattern="[a-zA-Z][a-zA-Z0-9_]{2,23}"
            value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. ishola1003" />
          <span className="mt-1 block text-xs font-normal text-[#729082]">
            Unique group handle. Confirmed after email verification; password login still uses your email.
          </span>
        </label>
      </>}
      <label className={labelClass} htmlFor="auth-email">Email address
        <input id="auth-email" name="email" className={inputClass} type="email" autoComplete="email" required
          maxLength={254} value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" />
      </label>
      <div>
        <label className={labelClass} htmlFor="auth-password">Password</label>
        <div className="relative">
          <input id="auth-password" name="password" className={inputClass + " pr-20"}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required minLength={mode === "sign-up" ? 12 : 1} maxLength={128}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={mode === "sign-up" ? "At least 12 characters" : "Your password"} />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(value => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-[#16856e]">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {mode === "sign-up" && <label className={labelClass} htmlFor="auth-confirm">Confirm password
        <input id="auth-confirm" name="confirmPassword" className={inputClass} type={showPassword ? "text" : "password"}
          autoComplete="new-password" required minLength={12} maxLength={128}
          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </label>}
      {mode === "sign-in" && <div className="text-right">
        <Link href="/forgot-password" className="text-xs font-bold text-[#16856e] hover:underline">Forgot password?</Link>
      </div>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-[#c5e5d4] bg-[#ecf8f1] p-3 text-sm text-[#236954]">{notice}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#16856e] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#116954] disabled:cursor-wait disabled:opacity-55">
        {busy ? "Please wait…" : mode === "sign-in" ? "Sign in with email" : "Create account"}
      </button>
      <p className="text-center text-xs text-[#668074]">
        {mode === "sign-in" ? "New to Poverty Die? " : "Already have an account? "}
        <Link className="font-bold text-[#16856e] hover:underline" href={mode === "sign-in" ? `/sign-up?next=${encodeURIComponent(next)}` : `/sign-in?next=${encodeURIComponent(next)}`}>
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
