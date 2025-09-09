import { ApiDevice } from "./page";

// Device Card Component
export default function DeviceCard({ device }: { device: ApiDevice }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-600/20 text-green-30 border-green-600/30';
      case 'offline':
        return 'bg-red-600/20 text-red-30 border-red-600/30';
      case 'error':
        return 'bg-yellow-600/20 text-yellow-30 border-yellow-600/30';
      default:
        return 'bg-gray-600/20 text-gray-30 border-gray-600/30';
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 15) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-gray-900 border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-200">{device.name}</h3>
          <p className="text-sm text-gray-500">{device.type}</p>
        </div>
        <span className={`px-3 py-2 rounded-full text-xs font-medium border ${getStatusColor(device.connectionStatus)}`}>
          {device.connectionStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Location:</span>
          <span className="ml-2 text-gray-200">{device.location}</span>
        </div>

        <div>
          <span className="text-gray-500">IP:</span>
          <span className="ml-2 text-gray-200 font-mono">{device.ipAddress}</span>
        </div>

        <div>
          <span className="text-gray-500">MAC:</span>
          <span className="ml-2 text-gray-200 font-mono">{device.macAddress}</span>
        </div>

        {device.firmwareVersion && (
          <div>
            <span className="text-gray-500">OS:</span>
            <span className="ml-2 text-gray-200">{device.firmwareVersion}</span>
          </div>
        )}

        <div>
          <span className="text-gray-500">Last seen:</span>
          <span className="ml-2 text-gray-200">{formatLastSeen(device.lastSeen)}</span>
        </div>
      </div>
    </div>
  );
}
