import { NotInvitedSignOut } from "@/components/not-invited-sign-out";

export const metadata = { title: "Invitation required | Poverty Die" };

export default function NotInvitedPage() {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="auth-copy">
          <span className="badge dark">PRIVATE WEALTH COLLECTIVE</span>
          <h1>Invitation required.</h1>
          <p>Your Google sign-in succeeded, but your email hasn't been approved for this private investment group.</p>
        </div>
      </section>
      <section className="auth-form">
        <h2>Not on the guest list?</h2>
        <p>Ask the group administrator to add your verified Google email before continuing.</p>
        <NotInvitedSignOut />
      </section>
    </main>
  );
}
