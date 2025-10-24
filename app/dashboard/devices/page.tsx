import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DevicesClient } from "./devices-client";
import { fetchDevices } from "./actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DevicesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return <div>No active organization</div>;
  }

  // Fetch initial devices from cache
  const initialDevices = await fetchDevices();

  return (
    <DevicesClient
      initialDevices={initialDevices}
      organizationId={organizationId}
    />
  );
}
