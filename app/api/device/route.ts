import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { Device, getDevices, updateDevice } from "@/models/server/devices";

export interface ApiDevice extends Device {
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


// Cleanup interval to mark devices as offline after inactivity
const OFFLINE_THRESHOLD = 1 * 60 * 1000; // 1 minute
setInterval(() => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > OFFLINE_THRESHOLD) {
      DeviceCacheManager.markOffline(macAddress);
    }
  }
}, 60 * 1000); // Check every minute

// Cleanup interval to remove devices after prolonged inactivity
const REMOVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > REMOVE_THRESHOLD) {
      DeviceCacheManager.removeDevice(macAddress);
    }
  }
}, 60 * 1000); // Check every minute



export async function POST(request: Request) {
  // Handle POST request to create a new device or update existing one
  const requestData = await request.json();
  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, ownerId } = requestData;

  // Validate required fields
  if (!name || !type || !status || !ownerId || !macAddress) {
    return new Response(JSON.stringify({ error: "Missing required fields (name, type, status, ownerId, macAddress are required)" }), { status: 400 });
  }

  // Create unique device identifier using MAC address
  const deviceId: string = macAddress;
  const currentTime = new Date().toISOString();

  try {
    // Check if device already exists in database by MAC address
    const dbDevices = await getDevices();
    const existingDbDevice = dbDevices.find(device => device.macAddress === macAddress);

    let dbId: string | undefined;
    let dbAction: string = 'cache-only';

    if (existingDbDevice) {
      // Update existing device in database
      const updatedDevice = await updateDevice(existingDbDevice.$id, {
        name,
        type,
        status,
        location,
        ipAddress,
        serialNumber,
        firmwareVersion,
        lastActive: currentTime,
        ownerId,
      });
      dbId = updatedDevice.$id;
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
        lastActive: currentTime,
        ownerId,
      },
      lastSeen: new Date(),
      status: 'online',
      dbId
    });

    const stats = DeviceCacheManager.getStats();

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
        lastActive: currentTime,
        ownerId,
      },
      lastSeen: new Date(),
      status: 'online'
    });

    const stats = DeviceCacheManager.getStats();

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
          ...device, // This includes $id
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
          $id: data.dbId || existingDevice?.$id || "",
          ...data.device,
          lastSeen: data.lastSeen,
          connectionStatus: data.status,
          source: data.dbId ? 'database+cache' : 'cache-only'
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