import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { safeReturnTo } from "@/lib/auth/redirect";
import { OAuthCallbackRecovery } from "@/components/auth/oauth-callback-recovery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finishing sign-in | Poverty Die" };

/**
 * A public OAuth handoff destination. Neon Auth middleware processes the
 * session verifier and sets first-party cookies before this page executes.
 * Only a verified server session is allowed to enter the dashboard.
 */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeReturnTo(params.next);
  const { data: session } = await auth.getSession();

  if (session?.user?.id) redirect(next);

  return <OAuthCallbackRecovery returnTo={next} />;
}
