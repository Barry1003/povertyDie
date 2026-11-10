import { redirect } from "next/navigation";
import { GroupHub } from "@/components/group/group-hub";
import { GroupSetup } from "@/components/group/group-setup";
import { getViewer } from "@/lib/group/security";
import { loadGroupDashboard } from "@/lib/group/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string | string[] }>;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");

  const dashboard = await loadGroupDashboard(viewer);
  if (!dashboard) {
    const params = await searchParams;
    return (
      <GroupSetup
        viewer={viewer}
        initialInvite={typeof params.invite === "string" ? params.invite : ""}
      />
    );
  }

  return <GroupHub data={dashboard} />;
}
