import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { GoogleSignIn } from "@/components/google-sign-in";
import { ImmersiveWealth } from "@/components/3d/immersive-wealth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Google sign-in | Poverty Die" };

export default async function SignInPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");
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
        <div className="sign-in-sculpture">
          <ImmersiveWealth variant="welcome" />
          <span className="sign-in-sculpture-label">A shared vision, shaped together.</span>
        </div>
        <small>Open Google sign-up · Private financial groups</small>
      </section>
      <section className="auth-form">
        <div className="mobile-signin-brand">
          <div className="logo"><span className="logo-mark"><span>P</span></span><div><b>POVERTY DIE</b><small>WEALTH COLLECTIVE</small></div></div>
          <ImmersiveWealth variant="welcome" className="mobile-signin-sculpture" />
        </div>
        <span className="kicker">WELCOME BACK</span>
        <h2>Sign in to Poverty Die</h2>
        <p>Continue with any Google account to sign in or create your profile.</p>
        <GoogleSignIn />
        <small className="secure">Registration is open. Access to live group financial records will require membership.</small>
      </section>
    </main>
  );
}
