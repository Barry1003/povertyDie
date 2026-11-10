"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function GoogleSignIn() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      if (result.error) {
        setError(result.error.message || "Could not sign in with Google.");
        setPending(false);
      }
      // On success, Neon Auth redirects to Google and then back to the app.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
      setPending(false);
    }
  }

  return (
    <>
      <button className="btn primary" type="button" onClick={handleSignIn} disabled={pending}>
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p role="alert" style={{ color: "#c94e5a" }}>{error}</p>}
    </>
  );
}
