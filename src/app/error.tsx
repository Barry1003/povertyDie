"use client";

/**
 * Don't mistake a successful identity login for a working dashboard.
 * This boundary catches server-rendering failures (including DB failures)
 * and offers a retry without exposing database details to users.
 */
export default function AppError({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main role="alert" className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-xs font-bold uppercase tracking-[0.22em] text-violet-700">Poverty Die</span>
      <h1 className="text-3xl font-bold text-[#2E0E4A]">Your dashboard could not load</h1>
      <p className="text-sm leading-relaxed text-[#6A339A]">
        Your sign-in may have succeeded, but the group data could not be loaded.
        This can happen during temporary database or deployment issues.
        No financial records have been changed by this error screen.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white hover:bg-[#6D28D9]"
      >
        Retry dashboard
      </button>
      <p className="text-xs text-[#6A339A]">
        If the problem continues, ask the project owner to check the deployment health endpoint.
      </p>
    </main>
  );
}
