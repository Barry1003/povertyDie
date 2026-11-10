"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function NotInvitedSignOut() {
  const router = useRouter();
  return <button type="button" className="btn secondary" onClick={async () => {
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }}>Try a different Google account</button>;
}
