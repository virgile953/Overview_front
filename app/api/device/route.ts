import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { ApiDevice, DeviceResponse, getDevices, singleDeviceResponse, updateDevice } from "@/lib/devices/devices";
import { emitDevicesUpdate, emitDeviceUpdate } from "@/lib/socketUtils";
import { addDeviceLog } from "@/models/server/logs";

export async function POST(request: Request) {
  const requestData = await request.json();

  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, organizationId, lastActive } = requestData;

  console.log('Received device POST:', { name, type, status, organizationId, macAddress });

  if (!name || !type || !status || !organizationId || !macAddress) {
    console.log('Invalid device data received:', requestData);
    return new Response(JSON.stringify({ error: "Missing required fields (name, type, status, organizationId, macAddress are required)" }), { status: 400 });
  }

  const deviceId: string = macAddress;
  const currentTime = new Date();
  const lastActiveDate = lastActive ? new Date(lastActive) : currentTime;

  try {
    // Check if device already exists in database by MAC address
    const dbDevicesResponse = await getDevices(organizationId);
    const existingDbDevice = dbDevicesResponse.devices.find(device => device.macAddress === macAddress);

    // Check if device exists in cache before update
    const existingCacheDevice = await DeviceCacheManager.getDevice(deviceId);

    let dbId: string | undefined;
    let dbAction: string = 'cache-only';

    if (existingDbDevice && existingDbDevice.dbId) {
      // Build updates object with only defined values
      const updates: Record<string, unknown> = {
        name,
        type,
        status,
        lastActive: lastActiveDate,
      };
      
      if (location) updates.location = location;
      if (ipAddress) updates.ipAddress = ipAddress;
      if (serialNumber) updates.serialNumber = serialNumber;
      if (firmwareVersion) updates.firmwareVersion = firmwareVersion;

      const updatedDevice = await updateDevice(existingDbDevice.macAddress!, organizationId, updates);
      const timeDiff = currentTime.getTime() - lastActiveDate.getTime();
      await addDeviceLog({ device: updatedDevice.id, status: 'info', message: 'Device updated via API', latency: timeDiff });
      dbId = existingDbDevice.dbId;
      dbAction = 'updated';
    }

    // Update device cache with correct organizationId
    await DeviceCacheManager.updateDevice(deviceId, {
      device: {
        id: existingDbDevice ? existingDbDevice.dbId : undefined,
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActiveDate,
        organizationId: organizationId,
      },
      lastSeen: new Date(),
      status: 'online',
    });

    console.log(`Device ${macAddress} cached for org ${organizationId}, dbId: ${dbId}`);

    // Verify it's in cache
    const cachedDevice = await DeviceCacheManager.getDevice(macAddress);
    console.log('Verified device in cache:', cachedDevice ? 'YES' : 'NO');
    
    // Check org devices
    const orgDevices = await DeviceCacheManager.getAllDevices(organizationId);
    console.log(`Total devices in cache for org ${organizationId}:`, orgDevices.size);

    const stats = await DeviceCacheManager.getStats(organizationId);
    console.log('Cache stats:', stats);

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
        lastActive: lastActiveDate.toISOString(),
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
        const fullDeviceData = await getCurrentDeviceData(organizationId);
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
      totalDevices: stats.total,
      organizationId,
      cached: true
    }), { status: 200 });

  } catch (error) {
    console.error('Error handling device POST request:', error);

    // Still update cache even if DB operation fails
    await DeviceCacheManager.updateDevice(deviceId, {
      device: {
        name,
        type,
        status,
        location,
        ipAddress,
        macAddress,
        serialNumber,
        firmwareVersion,
        lastActive: lastActiveDate,
        organizationId,
      },
      lastSeen: new Date(),
      status: 'online',
    });

    const stats = await DeviceCacheManager.getStats(organizationId);

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
        lastActive: lastActiveDate.toISOString(),
        organizationId,
        lastSeen: new Date(),
        connectionStatus: 'online',
        dbId: undefined
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
      totalDevices: stats.total,
      organizationId,
      cached: true
    }), { status: 200 });
  }
}

async function getCurrentDeviceData(organizationId: string): Promise<DeviceResponse> {
  try {
    const dbDevicesResponse = await getDevices(organizationId);
    const dbDevices = dbDevicesResponse.devices;
    const allDevices = new Map<string, ApiDevice>();

    // Add database devices
    dbDevices.forEach(device => {
      return allDevices.set(device.macAddress!, {
        ...device,
        lastActive: device.lastActive,
        lastSeen: device.lastActive!,
        connectionStatus: 'offline',
        source: 'database',
      });
    });

    // Add/update with cached devices for this organization only
    const cachedDevices = await DeviceCacheManager.getAllDevices(organizationId);
    cachedDevices.forEach((data, macAddress) => {
      const existingDevice = allDevices.get(macAddress);
      allDevices.set(macAddress, {
        deviceId: macAddress,
        id: data.device.id || existingDevice?.id || "",
        ...data.device,
        lastSeen: data.lastSeen,
        connectionStatus: data.status,
        source: data.device.id ? 'database+cache' : 'cache-only',
      });
    });

    const devices = Array.from(allDevices.values());
    const stats = await DeviceCacheManager.getStats(organizationId);

    return {
      devices,
      totalDevices: devices.length,
      cacheCount: stats.cacheOnly,
      dbCount: stats.linkedToDb,
      stats
    };
  } catch (error) {
    console.error('Error in getCurrentDeviceData:', error);
    // Fallback to cache-only for this organization
    const cachedDevices = await DeviceCacheManager.getAllDevices(organizationId);
    const devices = Array.from(cachedDevices.entries()).map(([id, data]) => ({
      deviceId: id,
      id: data.device.id || "",
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: 'cache-only' as const,
    }));

    const stats = await DeviceCacheManager.getStats(organizationId);
    return {
      devices,
      totalDevices: devices.length,
      cacheCount: stats.cacheOnly,
      dbCount: stats.linkedToDb,
      stats
    };
  }
}
// // GET endpoint to retrieve device status
// // export async function GET(request: Request) {
// //   const url = new URL(request.url);
// //   const deviceId = url.searchParams.get('deviceId');

// //   try {
// //     if (deviceId) {
// //       // Get specific device using DeviceCacheManager
// //       const deviceData = DeviceCacheManager.getDevice(deviceId);
// //       if (!deviceData) {
// //         return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
// //       }

// //       return new Response(JSON.stringify({
// //         deviceId,
// //         ...deviceData.device,
// //         lastSeen: deviceData.lastSeen,
// //         connectionStatus: deviceData.status,
// //         dbId: deviceData.dbId
// //       }), { status: 200 });
// //     } else {
// //       // Get all devices - combine database devices with cached devices
// //       const dbDevices = await getDevices();
// //       const allDevices = new Map<string, Device & {
// //         deviceId: string;
// //         lastSeen: Date;
// //         connectionStatus: string;
// //         source: string;
// //       }>();

// //       // First, add all database devices
// //       dbDevices.forEach(device => {
// //         allDevices.set(device.macAddress, {
// //           deviceId: device.macAddress,
// //           ...device, // This includes id
// //           lastActive: new Date(device.lastActive),
// //           lastSeen: new Date(device.lastActive),
// //           connectionStatus: 'offline', // Default to offline, will be updated if in cache
// //           source: 'database'
// //         });
// //       });

// //       // Then, add/update with cached devices (these are more recent)
// //       const cachedDevices = DeviceCacheManager.getAllDevices();
// //       cachedDevices.forEach((data, macAddress) => {
// //         const existingDevice = allDevices.get(macAddress);

// //         allDevices.set(macAddress, {
// //           deviceId: macAddress,
// //           id: data.dbId || existingDevice?.id || "",
// //           ...data.device,
// //           lastSeen: data.lastSeen,
// //           connectionStatus: data.status,
// //           source: data.dbId ? 'database+cache' : 'cache-only',
// //           name: "",
// //           organizationId: "",
// //           type: "",
// //           status: "",
// //           location: "",
// //           ipAddress: "",
// //           macAddress: "",
// //           serialNumber: "",
// //           firmwareVersion: "",
// //           lastActive: new Date(),
// //         });
// //       });

// //       const devices = Array.from(allDevices.values());
// //       const stats = DeviceCacheManager.getStats();

// //       return new Response(JSON.stringify({
// //         devices,
// //         totalDevices: devices.length,
// //         cacheCount: stats.total,
// //         dbCount: dbDevices.length,
// //         stats
// //       }), { status: 200 });
// //     }
// //   } catch (error) {
// //     console.error('Error in GET /api/device:', error);

// //     // Fallback to cache-only if database fails
// //     const cachedDevices = DeviceCacheManager.getAllDevices();
// //     const devices = Array.from(cachedDevices.entries()).map(([id, data]) => ({
// //       deviceId: id,
// //       ...data.device,
// //       lastSeen: data.lastSeen,
// //       connectionStatus: data.status,
// //       source: 'cache-only',
// //       warning: 'Database unavailable'
// //     }));

// //     const stats = DeviceCacheManager.getStats();

// //     return new Response(JSON.stringify({
// //       devices,
// //       totalDevices: devices.length,
// //       stats,
// //       warning: 'Database unavailable, showing cached devices only',
// //       error: error instanceof Error ? error.message : 'Unknown error'
// //     }), { status: 200 });
// //   }
// // }


// // export async function getDevicesGet(deviceId?: string) {
// //   if (deviceId) {
// //     // Get specific device using DeviceCacheManager
// //     const deviceData = DeviceCacheManager.getDevice(deviceId);
// //     if (!deviceData) {
// //       return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
// //     }

// //     return new Response(JSON.stringify({
// //       deviceId,
// //       ...deviceData.device,
// //       lastSeen: deviceData.lastSeen,
// //       connectionStatus: deviceData.status,
// //       dbId: deviceData.dbId
// //     }), { status: 200 });
// //   } else {
// //     // Get all devices - combine database devices with cached devices
// //     const dbDevices = await getDevices("coucou");
// //     const allDevices = new Map<string, Device & {
// //       deviceId: string;
// //       lastSeen: Date;
// //       connectionStatus: string;
// //       source: string;
// //     }>();

// //     // First, add all database devices
// //     dbDevices.forEach(device => {
// //       allDevices.set(device.macAddress, {
// //         deviceId: device.macAddress,
// //         ...device, // This includes id
// //         lastSeen: new Date(device.lastActive),
// //         lastActive: new Date(device.lastActive),
// //         connectionStatus: 'offline', // Default to offline, will be updated if in cache
// //         source: 'database'
// //       });
// //     });

// //     // Then, add/update with cached devices (these are more recent)
// //     const cachedDevices = DeviceCacheManager.getAllDevices();
// //     cachedDevices.forEach((data, macAddress) => {
// //       const existingDevice = allDevices.get(macAddress);

// //       allDevices.set(macAddress, {
// //         deviceId: macAddress,
// //         id: data.dbId || existingDevice?.id || "",
// //         ...data.device,
// //         lastSeen: data.lastSeen,
// //         connectionStatus: data.status,
// //         source: data.dbId ? 'database+cache' : 'cache-only',
// //         name: "",
// //         organizationId: "",
// //         type: "",
// //         status: "",
// //         location: "",
// //         ipAddress: "",
// //         macAddress: "",
// //         serialNumber: "",
// //         firmwareVersion: "",
// //         lastActive: new Date(),
// //       });
// //     });

// //     const devices = Array.from(allDevices.values());
// //     const stats = DeviceCacheManager.getStats();

// //     return new Response(JSON.stringify({
// //       devices,
// //       totalDevices: devices.length,
// //       cacheCount: stats.total,
// //       dbCount: dbDevices.length,
// //       stats
// //     }), { status: 200 });
// //   }
// // }