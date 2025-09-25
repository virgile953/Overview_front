import { getDevice } from "@/models/server/devices";
import { getDeviceLogs } from "@/models/server/logs";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, Activity, Calendar, MapPin, Network, Settings } from "lucide-react";
interface DevicePageProps {
  params: {
    'device-name': string;
  };
}

const DevicePage = async ({ params }: DevicePageProps) => {
  const { 'device-name': deviceName } = await params;
  
  const device = await getDevice(deviceName);

  if (!device) {
    notFound();
  }

  const logs = await getDeviceLogs(device.$id, 50);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'ok':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/devices"
          className="p-2 rounded-lg border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{device.name}</h1>
          <p className="text-muted-foreground">{device.type}</p>
        </div>
      </div>

      {/* Device Status and Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(device.status)}`}>
                {device.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">IP Address</p>
              <p className="font-medium">{device.ipAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{device.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Last Active</p>
              <p className="font-medium text-sm">
                {new Date(device.lastActive).toLocaleString("fr-FR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Details */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Device Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Device Name</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{device.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Device Type</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{device.type}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded font-mono">{device.serialNumber}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">MAC Address</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded font-mono">{device.macAddress}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">IP Address</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded font-mono">{device.ipAddress}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Firmware Version</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{device.firmwareVersion}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{device.location}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner ID</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded font-mono">{device.ownerId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Logs */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Recent Logs ({logs.length})</h2>

        {logs && logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No logs available for this device.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thumb-rounded-full scrollbar-thumb-sky-700 scrollbar-track-sky-300">
            {logs.map((log) => (
              <div key={log.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getLogStatusColor(log.status)}`}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("fr-FR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </span>
                </div>

                <p className="text-sm mb-2">{log.message}</p>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Latency: {log.latency}ms</span>
                  <span>ID: {log.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DevicePage;