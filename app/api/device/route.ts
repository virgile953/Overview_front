import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { getDevices, updateDevice } from "@/lib/devices/devices";
// import { emitDevicesUpdate, emitDeviceUpdate } from "@/lib/socketUtils";
// import { addDeviceLog } from "@/models/server/logs";

export async function POST(request: Request) {
  const requestData = await request.json();
  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, organizationId, lastActive } = requestData;

  console.log('Received device POST:', { name, macAddress, organizationId });

  if (!name || !type || !status || !organizationId || !macAddress) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const lastActiveDate = lastActive ? new Date(lastActive) : new Date();

  try {
    const dbDevicesResponse = await getDevices(organizationId);
    const existingDbDevice = dbDevicesResponse.devices.find(d => d.macAddress === macAddress);

    let dbId: string | undefined;
    let action = 'cache-only';

    // Update database if device exists
    if (existingDbDevice && existingDbDevice.id) {
      const updates: Record<string, unknown> = { name, type, status, lastActive: lastActiveDate };
      if (location) updates.location = location;
      if (ipAddress) updates.ipAddress = ipAddress;
      if (serialNumber) updates.serialNumber = serialNumber;
      if (firmwareVersion) updates.firmwareVersion = firmwareVersion;

      const updatedDevice = await updateDevice(macAddress, organizationId, updates);
      dbId = updatedDevice.id;
      action = 'updated';
    }

    // Always update cache
    DeviceCacheManager.set(macAddress, {
      device: {
        id: dbId,
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

    console.log(`Device ${macAddress} cached for org ${organizationId}`);

    const stats = await DeviceCacheManager.getStats(organizationId);

    return new Response(JSON.stringify({
      success: true,
      deviceId: macAddress,
      dbId,
      action,
      totalDevices: stats.total,
      organizationId,
    }), { status: 200 });

  } catch (error) {
    console.error('Error handling device POST:', error);

    // Cache even on error
    DeviceCacheManager.set(macAddress, {
      device: { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, lastActive: lastActiveDate, organizationId },
      lastSeen: new Date(),
      status: 'online',
    });

    return new Response(JSON.stringify({
      success: true,
      deviceId: macAddress,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 200 });
  }
}

// async function getCurrentDeviceData(organizationId: string): Promise<DeviceResponse> {
//   try {
//     const dbDevicesResponse = await getDevices(organizationId);
//     const dbDevices = dbDevicesResponse.devices;
//     const allDevices = new Map<string, ApiDevice>();

//     // Add database devices
//     dbDevices.forEach(device => {
//       return allDevices.set(device.macAddress!, {
//         ...device,
//         lastActive: device.lastActive,
//         lastSeen: device.lastActive!,
//         connectionStatus: 'offline',
//         source: 'database',
//       });
//     });

//     // Add/update with cached devices for this organization only
//     const cachedDevices = await DeviceCacheManager.getAll(organizationId);
//     cachedDevices.forEach((data, macAddress) => {
//       const existingDevice = allDevices.get(macAddress);
//       allDevices.set(macAddress, {
//         deviceId: macAddress,
//         id: data.device.id || existingDevice?.id || "",
//         ...data.device,
//         lastSeen: data.lastSeen,
//         connectionStatus: data.status,
//         source: data.device.id ? 'database+cache' : 'cache-only',
//       });
//     });

//     const devices = Array.from(allDevices.values());
//     const stats = await DeviceCacheManager.getStats(organizationId);

//     return {
//       devices,
//       totalDevices: devices.length,
//       cacheCount: stats.cacheOnly,
//       dbCount: stats.linkedToDb,
//       stats
//     };
//   } catch (error) {
//     console.error('Error in getCurrentDeviceData:', error);
//     // Fallback to cache-only for this organization
//     const cachedDevices = await DeviceCacheManager.getAll(organizationId);
//     const devices = Array.from(cachedDevices.entries()).map(([id, data]) => ({
//       deviceId: id,
//       id: data.device.id || "",
//       ...data.device,
//       lastSeen: data.lastSeen,
//       connectionStatus: data.status,
//       source: 'cache-only' as const,
//     }));

//     const stats = await DeviceCacheManager.getStats(organizationId);
//     return {
//       devices,
//       totalDevices: devices.length,
//       cacheCount: stats.cacheOnly,
//       dbCount: stats.linkedToDb,
//       stats
//     };
//   }
// }
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