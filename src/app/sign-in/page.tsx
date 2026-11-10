import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="logo"><span className="logo-mark"><span>P</span></span><div><b>POVERTY DIE</b><small>WEALTH COLLECTIVE</small></div></div>
        <div className="auth-copy"><span className="badge dark">PRIVATE WEALTH COLLECTIVE</span><h1>Build wealth together.<em> Track every step.</em></h1><p>A shared home for members to track contributions, holdings and progress.</p></div>
        <small>Invitation-only Google accounts</small>
      </section>
      <section className="auth-form">
        <span className="kicker">WELCOME BACK</span>
        <h2>Sign in to Poverty Die</h2>
        <p>Use the Google account invited to your investment group.</p>
        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/" }); }}>
          <button type="submit" className="btn primary">Continue with Google</button>
        </form>
        <small className="secure">Only approved email addresses can join. Contact your group administrator for access.</small>
      </section>
    </main>
  );
}
