import { getLogCount } from "@/models/server/logs";
import LogChart from "./chart";
import DatesSelector from "./DatesSelector";
import LogsClientWrapper from "./LogsClientWrapper";
import { getDevices } from "@/models/server/devices";
import DeviceSelector from "./DeviceSelector";
export const dynamic = 'force-dynamic'

export default async function Logs() {
  const [devices, count] = await Promise.all([
    getDevices(),
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