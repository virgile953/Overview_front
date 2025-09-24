import { getDevices } from "@/models/server/devices";
import { getAllLogs, getLogCount } from "@/models/server/logs";


export default async function Logs() {

  const logs = await getAllLogs();
  const count = await getLogCount();
  const devices = await getDevices();

  const devicesId = new Map(devices.map(device => [device.$id, device.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Logs</h1>
      <div>{count}</div>
      {logs.length === 0 ? (
        <p className="text-muted-foreground">No logs available.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border border-border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{devicesId.get(log.device)}</span>
                <span className={`px-2 py-1 text-sm rounded-full ${log.status === 'info' ? 'bg-blue-100 text-blue-800' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' :
                        log.status === 'ok' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                  }`}>
                  {log.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{log.message}</p>
              <p className="text-xs text-muted-foreground">Latency: {log.latency}ms | Logged at: {new Date(log.createdAt).toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}