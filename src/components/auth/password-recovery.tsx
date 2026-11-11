"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

const input = "mt-2 block w-full rounded-xl border border-[#cbded3] bg-white px-4 py-3 text-sm outline-offset-2 focus:border-[#16856e]";

export function PasswordRecovery({ mode, token }: { mode: "request" | "reset"; token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    if (mode === "reset" && (password.length < 12 || password.length > 128 || password !== confirm)) {
      setError("Choose a password of 12–128 characters and enter it twice.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "request") {
        const result = await authClient.requestPasswordReset({
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) {
          setError("Password recovery is unavailable. Confirm email/password and reset email delivery are enabled in Neon Auth.");
          return;
        }
        // Avoid user enumeration; never say whether the account exists.
        setNotice("If an account exists with that address, a reset link will be sent. Check your inbox and spam folder.");
      } else {
        if (!token) {
          setError("This reset link is missing or invalid. Request a new one.");
          return;
        }
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) {
          setError("This link may have expired or the password was rejected. Request a new reset link.");
          return;
        }
        setNotice("Password updated. You can now sign in with your email and new password.");
        setPassword(""); setConfirm("");
      }
    } catch {
      setError("Unable to contact Neon Auth. Check your connection or try again.");
    } finally { setBusy(false); }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {mode === "request" ? <label htmlFor="reset-email" className="block text-sm font-semibold">
        Email address
        <input id="reset-email" type="email" autoComplete="email" required maxLength={254} className={input}
          placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </label> : <>
        <label htmlFor="new-password" className="block text-sm font-semibold">New password
          <input id="new-password" type={show ? "text" : "password"} autoComplete="new-password"
            minLength={12} maxLength={128} required className={input} value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <label htmlFor="confirm-new-password" className="block text-sm font-semibold">Confirm new password
          <input id="confirm-new-password" type={show ? "text" : "password"} autoComplete="new-password"
            minLength={12} maxLength={128} required className={input} value={confirm} onChange={e => setConfirm(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-xs text-[#577366]">
          <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show passwords
        </label>
      </>}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-[#22684d]" role="status">{notice}</p>}
      <button type="submit" disabled={busy || (mode === "reset" && !token)}
        className="w-full rounded-xl bg-[#16856e] px-5 py-3 font-bold text-white disabled:opacity-50">
        {busy ? "Please wait…" : mode === "request" ? "Send reset link" : "Update password"}
      </button>
      <p className="text-center text-xs">
        <Link className="font-semibold text-[#16856e] hover:underline" href="/sign-in">Back to sign in</Link>
        {mode === "reset" && <> · <Link className="font-semibold text-[#16856e] hover:underline" href="/forgot-password">Request a new link</Link></>}
      </p>
    </form>
  );
}
