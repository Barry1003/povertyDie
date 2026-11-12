"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { safeReturnTo } from "@/lib/auth/redirect";

export function OAuthCallbackRecovery({ returnTo }: { returnTo: string }) {
  const destination = safeReturnTo(returnTo);
  const [message, setMessage] = useState("Checking your sign-in session…");

  useEffect(() => {
    let active = true;
    void authClient.getSession().then(({ data }) => {
      if (!active) return;
      if (data?.user?.id) {
        window.location.replace(destination);
      } else {
        setMessage("Google returned to Poverty Die, but no active session was found. Please try signing in again using your browser.");
      }
    }).catch(() => {
      if (active) setMessage("Your sign-in session could not be checked. Please try again.");
    });
    return () => { active = false; };
  }, [destination]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f8f5] p-6 text-[#173c32]">
      <section className="w-full max-w-md rounded-3xl border border-[#d8e8df] bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold">Finishing your sign-in</h1>
        <p role="status" className="mt-4 text-sm leading-relaxed text-[#587d6e]">{message}</p>
        <Link href={`/sign-in?next=${encodeURIComponent(destination)}`}
          className="mt-6 inline-block rounded-xl bg-[#16856e] px-5 py-3 text-sm font-bold text-white">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
