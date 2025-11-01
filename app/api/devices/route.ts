import { getDevices } from "@/lib/devices/devices";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    return new Response(JSON.stringify({ error: "No organization ID" }), { status: 400 });
  }

  try {
    const deviceData = await getDevices();
    return new Response(JSON.stringify(deviceData), { status: 200 });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch devices" }),
      { status: 500 }
    );
  }
}
