import LogChart from "./chart";
import DatesSelector from "./DatesSelector";
import LogsClientWrapper from "./LogsClientWrapper";
import DeviceSelector from "./DeviceSelector";
import { getDevices } from "@/lib/devices/devices";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getLogCount } from "@/lib/logs";

export default async function Logs() {

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

  const [devices, count] = await Promise.all([
    (await getDevices(organizationId)).devices,
    getLogCount(),
  ]);

  return (
    <LogsClientWrapper initialCount={count} initialDevices={devices}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Logs</h1>
          <div className="text-sm text-muted-foreground">Total: {count}</div>
        </div>
        {/* Chart Section */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-4 gap-2">
            <h3 className="text-lg font-semibold align-middle">Log Activity Over Time</h3>
            <div className="flex flex-col gap-2 lg:flex-row w-fit">
              <DeviceSelector />
              <DatesSelector />
            </div>
          </div>
          <LogChart />
        </div>
      </div>
    </LogsClientWrapper>
  );
}