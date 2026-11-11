import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { GoogleSignIn } from "@/components/google-sign-in";
import { safeReturnTo } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in | Poverty Die" };

export default async function SignInPage({
  searchParams,
}: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");

  const params = await searchParams;
  const returnTo = safeReturnTo(params.next);
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to Poverty Die"
      description="Access your shared investment circle with email and password, or continue securely with Google.">
      <EmailAuthForm mode="sign-in" returnTo={returnTo} />
      <div className="my-5 flex items-center gap-3 text-xs text-[#789083]">
        <span className="h-px flex-1 bg-[#d8e8de]" />or<span className="h-px flex-1 bg-[#d8e8de]" />
      </div>
      <GoogleSignIn callbackURL={returnTo} />
      <p className="mt-5 text-center text-xs text-[#678174]">
        Usernames are unique profile handles. Managed Neon Auth currently uses your email for password sign-in.
      </p>
    </AuthShell>
  );
}
