import { getDevices } from "@/models/server/devices";
import { getAllLogs, getLogCount, getLogsForChart } from "@/models/server/logs";
import LogChart from "./chart";

export default async function Logs() {
  const [logs, count, devices, chartData] = await Promise.all([
    getAllLogs(50),
    getLogCount(),
    getDevices(),
    getLogsForChart() // This returns the format you want
  ]);

  console.log('Chart data:', chartData);

  const devicesId = new Map(devices.map(device => [device.$id, device.name]));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Logs</h1>
        <div className="text-sm text-muted-foreground">Total: {count}</div>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground">No logs available.</p>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-card p-6 rounded-lg border">
            <LogChart data={chartData} />
          </div>

          {/* Logs List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Logs</h2>
            {logs.map((log) => (
              <div key={log.id} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{devicesId.get(log.device) || log.device}</span>
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    log.status === 'info' ? 'bg-blue-100 text-blue-800' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    log.status === 'error' ? 'bg-red-100 text-red-800' :
                    log.status === 'ok' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{log.message}</p>
                <p className="text-xs text-muted-foreground">
                  Latency: {log.latency}ms | Logged at: {new Date(log.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}