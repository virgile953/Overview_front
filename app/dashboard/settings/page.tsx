import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SettingsPage() {
  
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
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Manage your account and application settings here.</p>
      {/* Additional settings components can be added here */}
    </div>
  );
}