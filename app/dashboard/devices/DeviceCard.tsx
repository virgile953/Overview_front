import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Device, NewDevice } from "@/lib/db/schema";
import { CirclePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApiDevice, createDevice, deleteDevice } from "@/lib/devices/devices";
import { useSession } from "@/lib/auth-client";

// Device Card Component
export default function DeviceCard({
  device,
  onDeviceAdded
}: {
  device: ApiDevice;
  onDeviceAdded: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { data: session } = useSession();

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
    return formatLastSeen(device.lastActive.toISOString());
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
    try {
      const response = await deleteDevice(device.id!, device.organizationId!);

      if (response) {
        onDeviceAdded();
      }
    } catch {

    }
  }

  async function addDevice() {
    if (isAdding) return;
    setIsAdding(true);

    try {
      // Validate required fields before adding to database
      if (!device.name || !device.type || !device.status || !device.location ||
        !device.ipAddress || !device.macAddress || !device.serialNumber ||
        !device.firmwareVersion || !device.lastActive) {
        throw new Error('Missing required device fields');
      }
      if (!session || !session.session.activeOrganizationId) {
        throw new Error('Unauthorized');
      }
      
      // Ensure lastActive is a proper Date object
      const deviceToAdd: NewDevice = {
        name: device.name,
        type: device.type,
        status: device.status,
        location: device.location,
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
        serialNumber: device.serialNumber,
        firmwareVersion: device.firmwareVersion,
        lastActive: device.lastActive instanceof Date 
          ? device.lastActive 
          : new Date(device.lastActive),
        organizationId: session.session.activeOrganizationId,
      };
      
      const response = await createDevice(deviceToAdd);
      if (response) {
        onDeviceAdded();
      }
    } catch (error) {
      console.error('Failed to add device:', error);
    } finally {
      setIsAdding(false);
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
          {device.id ? (
            <Link className="text-sm font-medium" href={`/dashboard/devices/${device.id}`}>{device.name}</Link>
          ) : (
            <div className="text-sm text-muted-foreground">{device.name}</div>
          )}
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
                <span>{device.lastSeen?.toLocaleTimeString('fr-FR')}</span>
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
          {
            !isDeviceInDatabase(device) && (
              <div className="ml-4">
                <Tooltip>
                  <TooltipTrigger>
                    <CirclePlus
                      onClick={() => !isAdding ? addDevice() : null}
                      size={20}
                      className={`cursor-pointer hover:text-emerald-400 ${isAdding ? 'animate-spin' : ''}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">Add to Database</div>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          }
        </div>
      </div >
    </div >
  );
}
