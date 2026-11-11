"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { safeReturnTo } from "@/lib/auth/redirect";

export function GoogleSignIn({ callbackURL = "/" }: { callbackURL?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = safeReturnTo(callbackURL);

  async function handleSignIn() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: next });
      if (result.error) {
        setError(result.error.message || "Could not sign in with Google.");
        setPending(false);
      }
      // Neon Auth completes the OAuth redirect and creates the shared session.
    } catch {
      setError("Google sign-in could not start. Confirm the Vercel domain is trusted in Neon Auth.");
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleSignIn} disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#cbded3] bg-white px-5 py-3 text-sm font-bold text-[#25493a] transition-colors hover:bg-[#f0f7f3] disabled:opacity-60">
        <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18">
          <path fill="#4285F4" d="M43.6 24.45c0-1.36-.12-2.66-.35-3.92H24v7.42h11c-.48 2.53-1.92 4.67-4.08 6.12v5.08h6.62c3.87-3.57 6.06-8.83 6.06-14.7Z"/>
          <path fill="#34A853" d="M24 44c5.53 0 10.18-1.82 13.57-4.93l-6.62-5.08c-1.83 1.23-4.16 1.96-6.95 1.96-5.35 0-9.88-3.61-11.5-8.45H5.66v5.25C9.06 39.51 15.97 44 24 44Z"/>
          <path fill="#FBBC05" d="M12.5 27.5A11.98 11.98 0 0 1 11.87 24c0-1.21.21-2.39.61-3.5v-5.25H5.66A20.01 20.01 0 0 0 4 24c0 3.22.77 6.27 2.14 8.75l6.36-5.25Z"/>
          <path fill="#EA4335" d="M24 12.05c3 0 5.68 1.03 7.79 3.05l5.85-5.85C34.16 5.98 29.52 4 24 4 15.97 4 9.06 8.49 5.66 15.25l6.84 5.25C14.12 15.66 18.65 12.05 24 12.05Z"/>
        </svg>
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
    </div>
  );
}
