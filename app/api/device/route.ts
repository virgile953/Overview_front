import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { getDevices, updateDevice } from "@/models/server/devices";
import { emitDevicesUpdate, emitDeviceUpdate } from "@/lib/socketUtils";
import { addDeviceLog } from "@/models/server/logs";
import { Device } from "@/lib/db/schema";

export interface ApiDevice extends Partial<Device> {
  deviceId: string;
  lastSeen: Date | string;
  connectionStatus: string;
  source: 'database' | 'database+cache' | 'cache-only';
  dbId?: string;
}

export interface DeviceResponse {
  devices: ApiDevice[];
  totalDevices: number;
  cacheCount: number;
  dbCount: number;
  stats: {
    total: number;
    online: number;
    offline: number;
    linkedToDb: number;
    cacheOnly: number;
  };
}

export interface singleDeviceResponse {
  deviceId: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  ipAddress?: string;
  macAddress: string;
  serialNumber?: string;
  firmwareVersion?: string;
  lastActive: string;
  organizationId: string;
  lastSeen: Date | string;
  connectionStatus: string;
  dbId?: string;
}

// Cleanup interval to mark devices as offline after inactivity
const OFFLINE_THRESHOLD = 1 * 60 * 1000; // 1 minute
setInterval(async () => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  let hasChanges = false;

  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > OFFLINE_THRESHOLD && data.status === 'online') {
      DeviceCacheManager.markOffline(macAddress);
      hasChanges = true;
    }
  }

  // Emit update if any devices were marked offline
  if (hasChanges) {
    try {
      const deviceData = await getCurrentDeviceData();
      emitDevicesUpdate('devicesUpdated', deviceData);
    } catch (error) {
      console.warn('Failed to emit device offline update:', error);
    }
  }
}, 60 * 1000); // Check every minute

// Cleanup interval to remove devices after prolonged inactivity
const REMOVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
setInterval(async () => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  let hasChanges = false;

  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > REMOVE_THRESHOLD) {
      DeviceCacheManager.removeDevice(macAddress);
      hasChanges = true;
    }
  }

  // Emit update if any devices were removed
  if (hasChanges) {
    try {
      const deviceData = await getCurrentDeviceData();
      emitDevicesUpdate('devicesUpdated', deviceData);
    } catch (error) {
      console.warn('Failed to emit device removal update:', error);
    }
  }
}, 60 * 1000); // Check every minute


async function getCurrentDeviceData(): Promise<DeviceResponse> {
  try {
    const dbDevices = await getDevices();
    const allDevices = new Map<string, ApiDevice>();

    // Add database devices
    dbDevices.forEach(device => {
      allDevices.set(device.macAddress, {
        deviceId: device.macAddress,
        ...device,
        lastSeen: new Date(device.lastActive),
        connectionStatus: 'offline',
        source: 'database'
      });
    });

    // Add/update with cached devices
    const cachedDevices = DeviceCacheManager.getAllDevices();
    cachedDevices.forEach((data, macAddress) => {
      const existingDevice = allDevices.get(macAddress);
      allDevices.set(macAddress, {
        deviceId: macAddress,
        id: data.dbId || existingDevice?.id || "",
        ...data.device,
        lastSeen: data.lastSeen,
        connectionStatus: data.status,
        source: data.dbId ? 'database+cache' : 'cache-only',
        dbId: data.dbId
      });
    });

    const devices = Array.from(allDevices.values());
    const stats = DeviceCacheManager.getStats();

    return {
      devices,
      totalDevices: devices.length,
      cacheCount: stats.total,
      dbCount: dbDevices.length,
      stats
    };
  } catch {
    // Fallback to cache-only
    const cachedDevices = DeviceCacheManager.getAllDevices();
    const devices = Array.from(cachedDevices.entries()).map(([id, data]) => ({
      deviceId: id,
      id: data.dbId || "",
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: 'cache-only' as const,
      dbId: data.dbId
    }));

    const stats = DeviceCacheManager.getStats();
    return {
      devices,
      totalDevices: devices.length,
      cacheCount: stats.total,
      dbCount: 0,
      stats
    };
  }
}

export async function POST(request: Request) {
  const requestData = await request.json();

  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, organizationId, lastActive } = requestData;

  if (!name || !type || !status || !organizationId || !macAddress) {
    console.log('Invalid device data received:', requestData);  
    return new Response(JSON.stringify({ error: "Missing required fields (name, type, status, organizationId, macAddress are required)" }), { status: 400 });
  }

  const deviceId: string = macAddress;
  const currentTime = new Date();

  try {
    // Check if device already exists in database by MAC address
    const dbDevices = await getDevices();
    const existingDbDevice = dbDevices.find(device => device.macAddress === macAddress);

    // Check if device exists in cache before update
    const existingCacheDevice = DeviceCacheManager.getDevice(deviceId);

    let dbId: string | undefined;
    let dbAction: string = 'cache-only';

    if (existingDbDevice) {
      const updatedDevice = await updateDevice(existingDbDevice.id, {
        name,
        type,
        status,
        location,
        ipAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActive || currentTime.toISOString(),
        organizationId: organizationId,
      });
      const timeDiff = currentTime.getTime() - new Date(lastActive).getTime();
      addDeviceLog({ device: updatedDevice.id, status: 'info', message: 'Device updated via API', latency: timeDiff });
      dbId = updatedDevice.id;
      dbAction = 'updated';
    }
    // If device doesn't exist in DB, we only cache it (don't create new DB entry)
    // Update device cache using DeviceCacheManager
    DeviceCacheManager.updateDevice(deviceId, {
      device: {
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActive || currentTime.toISOString(),
        organizationId: organizationId,
      },
      lastSeen: new Date(),
      status: 'online',
      dbId
    });

    const stats = DeviceCacheManager.getStats();

    // Emit individual device update for real-time UI updates
    try {
      const deviceData: singleDeviceResponse = {
        deviceId,
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActive || currentTime.toISOString(),
        organizationId,
        lastSeen: new Date(),
        connectionStatus: 'online',
        dbId
      };

      emitDeviceUpdate('deviceUpdated', deviceData);
    } catch (socketError) {
      console.warn('Failed to emit single device update via Socket.IO:', socketError);
    }

    // Also emit full devices update if this is a new device (for stats update)
    if (!existingDbDevice && !existingCacheDevice) {
      try {
        const fullDeviceData = await getCurrentDeviceData();
        emitDevicesUpdate('devicesUpdated', fullDeviceData);
      } catch (socketError) {
        console.warn('Failed to emit full devices update via Socket.IO:', socketError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      deviceId,
      dbId,
      action: dbAction,
      message: existingDbDevice
        ? 'Device updated in database and cache'
        : 'Device cached only (not in database)',
      totalDevices: stats.total
    }), { status: 200 });

  } catch (error) {
    console.error('Error handling device POST request:', error);

    // Still update cache even if DB operation fails
    DeviceCacheManager.updateDevice(deviceId, {
      device: {
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActive || currentTime.toISOString(),
        organizationId,
      },
      lastSeen: new Date(),
      status: 'online'
    });

    const stats = DeviceCacheManager.getStats();

    // Emit individual device update even in error case
    try {
      const deviceData: singleDeviceResponse = {
        deviceId,
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActive || currentTime.toISOString(),
        organizationId,
        lastSeen: new Date(),
        connectionStatus: 'online',
        dbId: undefined // No DB ID in error case
      };

      emitDeviceUpdate('deviceUpdated', deviceData);
    } catch (socketError) {
      console.warn('Failed to emit device update via Socket.IO:', socketError);
    }

    return new Response(JSON.stringify({
      success: true,
      deviceId,
      warning: 'Device cached but database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      totalDevices: stats.total
    }), { status: 200 });
  }
}

// GET endpoint to retrieve device status
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deviceId = url.searchParams.get('deviceId');

  try {
    if (deviceId) {
      // Get specific device using DeviceCacheManager
      const deviceData = DeviceCacheManager.getDevice(deviceId);
      if (!deviceData) {
        return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
      }

      return new Response(JSON.stringify({
        deviceId,
        ...deviceData.device,
        lastSeen: deviceData.lastSeen,
        connectionStatus: deviceData.status,
        dbId: deviceData.dbId
      }), { status: 200 });
    } else {
      // Get all devices - combine database devices with cached devices
      const dbDevices = await getDevices();
      const allDevices = new Map<string, Device & {
        deviceId: string;
        lastSeen: Date;
        connectionStatus: string;
        source: string;
      }>();

      // First, add all database devices
      dbDevices.forEach(device => {
        allDevices.set(device.macAddress, {
          deviceId: device.macAddress,
          ...device, // This includes id
          lastSeen: new Date(device.lastActive),
          connectionStatus: 'offline', // Default to offline, will be updated if in cache
          source: 'database'
        });
      });

      // Then, add/update with cached devices (these are more recent)
      const cachedDevices = DeviceCacheManager.getAllDevices();
      cachedDevices.forEach((data, macAddress) => {
        const existingDevice = allDevices.get(macAddress);

        allDevices.set(macAddress, {
          deviceId: macAddress,
          id: data.dbId || existingDevice?.id || "",
          ...data.device,
          lastSeen: data.lastSeen,
          connectionStatus: data.status,
          source: data.dbId ? 'database+cache' : 'cache-only',
          name: "",
          organizationId: "",
          type: "",
          status: "",
          location: "",
          ipAddress: "",
          macAddress: "",
          serialNumber: "",
          firmwareVersion: "",
          lastActive: new Date(),
        });
      });

      const devices = Array.from(allDevices.values());
      const stats = DeviceCacheManager.getStats();

      return new Response(JSON.stringify({
        devices,
        totalDevices: devices.length,
        cacheCount: stats.total,
        dbCount: dbDevices.length,
        stats
      }), { status: 200 });
    }
  } catch (error) {
    console.error('Error in GET /api/device:', error);

    // Fallback to cache-only if database fails
    const cachedDevices = DeviceCacheManager.getAllDevices();
    const devices = Array.from(cachedDevices.entries()).map(([id, data]) => ({
      deviceId: id,
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: 'cache-only',
      warning: 'Database unavailable'
    }));

    const stats = DeviceCacheManager.getStats();

    return new Response(JSON.stringify({
      devices,
      totalDevices: devices.length,
      stats,
      warning: 'Database unavailable, showing cached devices only',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 200 });
  }
}