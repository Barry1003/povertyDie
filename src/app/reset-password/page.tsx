import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordRecovery } from "@/components/auth/password-recovery";

export const metadata = { title: "Choose a new password | Poverty Die" };

export default async function ResetPasswordPage({
  searchParams,
}: { searchParams: Promise<{ token?: string | string[]; error?: string }> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" && params.token.length <= 1024 ? params.token : "";
  return (
    <AuthShell eyebrow="Account recovery" title="Choose a new password"
      description={params.error ? "Your recovery link could not be verified. Request a new reset email." :
        "Choose a strong new password. Recovery links may expire and can be used only once."}>
      <PasswordRecovery mode="reset" token={token} />
    </AuthShell>
  );
}
