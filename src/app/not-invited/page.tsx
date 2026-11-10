import { redirect } from "next/navigation";

// Legacy route: the email allowlist was removed. No Google identity
// is rejected for not being on an invitation list.
export default function LegacyNotInvitedPage() {
  redirect("/");
}
