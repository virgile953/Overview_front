import { getLogCount, getLogsForChart } from "@/models/server/logs";
import LogChart from "./chart";
import DatesSelector from "./DatesSelector";
import LogsClientWrapper from "./LogsClientWrapper";
import { getDevices } from "@/models/server/devices";
import DeviceSelector from "./DeviceSelector";

export default async function Logs() {
  const [devices, count, chartData] = await Promise.all([
    getDevices(),
    getLogCount(),
    getLogsForChart(new Date(), new Date(), 24, "hour"),
  ]);

  console.log('Chart data:', chartData);
  console.log('Devices:', devices);
  return (
    <LogsClientWrapper initialChartData={chartData} initialCount={count} initialDevices={devices}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Logs</h1>
          <div className="text-sm text-muted-foreground">Total: {count}</div>
        </div>
        {/* Chart Section */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="text-lg font-semibold align-middle">Log Activity Over Time</h3>
            <div className="flex gap-2">
              <DeviceSelector />
              <DatesSelector />
            </div>
          </div>
          <LogChart data={chartData} />
        </div>
      </div>
    </LogsClientWrapper>
  );
}