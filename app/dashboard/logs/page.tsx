import { getLogCount, getLogsForChart } from "@/models/server/logs";
import LogChart from "./chart";

export default async function Logs() {
  const [count, chartData] = await Promise.all([
    getLogCount(),
    getLogsForChart(new Date(), new Date(), 24, "hour"),
  ]);

  console.log('Chart data:', chartData);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Logs</h1>
        <div className="text-sm text-muted-foreground">Total: {count}</div>
      </div>
      {/* Chart Section */}
      <div className="bg-card p-6 rounded-lg border">
        <LogChart data={chartData} />
      </div>

    </div>
  );
}