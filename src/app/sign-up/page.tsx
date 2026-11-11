import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { GoogleSignIn } from "@/components/google-sign-in";
import { safeReturnTo } from "@/lib/auth/redirect";

export const metadata = { title: "Create account | Poverty Die" };
export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");

  const params = await searchParams;
  const returnTo = safeReturnTo(params.next);
  return (
    <AuthShell eyebrow="Join the collective" title="Create your account"
      description="Register with email and password or continue with Google. Your private group remains invitation-only.">
      <EmailAuthForm mode="sign-up" returnTo={returnTo} />
      <div className="my-5 flex items-center gap-3 text-xs text-[#789083]">
        <span className="h-px flex-1 bg-[#d8e8de]" />or<span className="h-px flex-1 bg-[#d8e8de]" />
      </div>
      <GoogleSignIn callbackURL={returnTo} />
    </AuthShell>
  );
}
