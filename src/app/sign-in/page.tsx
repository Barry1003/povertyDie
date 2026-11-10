import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isInvitedEmail } from "@/lib/auth/authorization";
import { GoogleSignIn } from "@/components/google-sign-in";

export const dynamic = "force-dynamic";
export const metadata = { title: "Google sign-in | Poverty Die" };

export default async function SignInPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    if (!isInvitedEmail(session.user.email)) redirect("/not-invited");
    redirect("/");
  }
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="logo">
          <span className="logo-mark"><span>P</span></span>
          <div><b>POVERTY DIE</b><small>WEALTH COLLECTIVE</small></div>
        </div>
        <div className="auth-copy">
          <span className="badge dark">PRIVATE WEALTH COLLECTIVE</span>
          <h1>Build wealth together. <em>Track every step.</em></h1>
          <p>A transparent home for friends to track shared investments, contributions and progress.</p>
        </div>
        <small>Private group · Managed Neon authentication</small>
      </section>
      <section className="auth-form">
        <span className="kicker">WELCOME BACK</span>
        <h2>Sign in to Poverty Die</h2>
        <p>Sign in with the Google account approved for your investment group.</p>
        <GoogleSignIn />
        <small className="secure">Access to group data is restricted to approved members.</small>
      </section>
    </main>
  );
}
