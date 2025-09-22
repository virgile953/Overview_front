import { ApiDevice } from "@/app/api/device/route";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Device } from "@/models/server/devices";
import { Trash2 } from "lucide-react";
import { useState } from "react";

// Device Card Component
export default function DeviceCard({
  device,
  onDeviceAdded
}: {
  device: ApiDevice;
  onDeviceAdded: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [addStatus, setAddStatus] = useState<'success' | 'error' | ''>('');

  const [isRemoving, setIsRemoving] = useState(false);
  const [removeMessage, setRemoveMessage] = useState('');
  const [removeStatus, setRemoveStatus] = useState<'success' | 'error' | ''>('');

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

  function getConnectionStatus(device: ApiDevice | Device): string {
    if ('connectionStatus' in device) {
      return device.connectionStatus;
    }
    return 'unknown';
  }

  function getLastSeenTime(device: ApiDevice | Device): string {
    if ('lastSeen' in device) {
      const lastSeen = typeof device.lastSeen === 'string' ? device.lastSeen : device.lastSeen.toISOString();
      return formatLastSeen(lastSeen);
    }
    return formatLastSeen(device.lastActive);
  }

  function isDeviceInDatabase(device: ApiDevice | Device): boolean {
    if ('source' in device) {
      return device.source !== 'cache-only';
    }
    return true;
  }

  async function deleteDeviceFromDb() {
    if (!confirm("Are you sure ?")) return;
    if (isRemoving) return;
    setIsRemoving(true);
    setRemoveMessage('');
    try {
      const response = await fetch(`/api/device/admin?dbId=${device.$id}&macAddress=${device.macAddress}`, {
        method: 'DELETE',
        headers:
        {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json();
      if (response.ok && result.success) {
        setRemoveStatus('success');
        setRemoveMessage('✅ Device removed from database!');
        // Call the callback to refresh the devices list
        onDeviceAdded();
      } else {
        setRemoveStatus('error');
        setRemoveMessage(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch {

    }
  }

  async function addDeviceToDb() {
    if (isAdding) return;
    setIsAdding(true);
    setAddMessage('');

    try {
      const response = await fetch('/api/device/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setAddStatus('success');
        setAddMessage('✅ Device added to database!');
        // Call the callback to refresh the devices list
        onDeviceAdded();
      } else {
        setAddStatus('error');
        setAddMessage(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setAddMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAddStatus('error');
    } finally {
      setIsAdding(false);
      // Clear message after 3 seconds
      setTimeout(() => {
        setAddMessage('');
        setAddStatus('');
      }, 3000);
    }
  }

  async function RemoveDeviceFromDb() {
    if (isRemoving) return;
    setIsRemoving(true);
    setAddMessage('');

    try {
      const response = await fetch('/api/device/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setRemoveStatus('success');
        setRemoveMessage('✅ Device added to database!');
        // Call the callback to refresh the devices list
        onDeviceAdded();
      } else {
        setRemoveStatus('error');
        setRemoveMessage(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setRemoveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setRemoveStatus('error');
    } finally {
      setIsAdding(false);
      // Clear message after 3 seconds
      setTimeout(() => {
        setRemoveMessage('');
        setRemoveStatus('');
      }, 3000);
    }
  }


  const getSourceColor = (device: ApiDevice | Device): string => {
    if ('source' in device) {
      switch (device.source) {
        case 'database+cache':
          return 'border-emerald-600/50';
        case 'database':
          return 'border-blue-600/50';
        case 'cache-only':
          return 'border-yellow-600/50';
        default:
          return 'border-border';
      }
    }
    return 'border-border';
  };

  return (
    <div className={`h-full w-full bg-sidebar-accent border rounded-lg p-4 hover:shadow-md transition-shadow ${getSourceColor(device)}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground flex flex-row">{device.name}
            {
              !isDeviceInDatabase(device) && (
                <div className="ml-4">
                  <button
                    className="w-full px-2 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={addDeviceToDb}
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add to Database'}
                  </button>
                  {addMessage && (
                    <p className={`text-xs mt-2 ${addStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {addMessage}
                    </p>
                  )}
                </div>
              )
            }
          </h3>
          <p className="text-sm text-muted-foreground">{device.type}</p>
          {'source' in device && (
            <p className="text-xs text-muted-foreground mt-1">
              Source: {device.source}
            </p>
          )}
        </div>
        <span className={`px-3 py-2 rounded-full text-xs font-medium border ${getStatusColor(getConnectionStatus(device))}`}>
          {getConnectionStatus(device)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-foreground">Location:</span>
          <span className="ml-2 text-muted-foreground">{device.location}</span>
        </div>

        <div>
          <span className="text-foreground">IP:</span>
          <span className="ml-2 text-muted-foreground font-mono">{device.ipAddress}</span>
        </div>

        <div>
          <span className="text-foreground">MAC:</span>
          <span className="ml-2 text-muted-foreground font-mono">{device.macAddress}</span>
        </div>

        {device.firmwareVersion && (
          <div>
            <span className="text-foreground">OS:</span>
            <span className="ml-2 text-muted-foreground">{device.firmwareVersion}</span>
          </div>
        )}

        <div className="flex flex-row w-full justify-between">
          <div>
            <span className="text-foreground">Last seen:</span>
            <Tooltip >
              <TooltipTrigger>
                <span className="ml-2 text-muted-foreground">{getLastSeenTime(device)}</span>
              </TooltipTrigger>
              <TooltipContent className="text-sm">
                <span>{new Date(device.lastActive).toLocaleTimeString('fr-FR')}</span>
              </TooltipContent>
            </Tooltip>
          </div>
          {isDeviceInDatabase(device) &&
            <Tooltip>
              <TooltipTrigger>
                <Trash2 size={20} onClick={deleteDeviceFromDb} />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">Remove from DB<br />
                  (Will still receive device data in cache)
                </div>
              </TooltipContent>
            </Tooltip>
          }
        </div>

        {/* Show "Add to Database" button only for cache-only devices */}

      </div >
    </div >
  );
}
