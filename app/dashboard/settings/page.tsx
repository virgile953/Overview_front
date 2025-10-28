import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SettingsForm from "./SettingsForm";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your notification preferences and system settings.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}