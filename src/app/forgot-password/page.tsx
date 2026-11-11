import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordRecovery } from "@/components/auth/password-recovery";

export const metadata = { title: "Recover account | Poverty Die" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Account recovery" title="Reset your password"
      description="Enter the email address associated with your Neon Auth account. If it exists, you'll receive a secure reset link.">
      <PasswordRecovery mode="request" />
    </AuthShell>
  );
}
